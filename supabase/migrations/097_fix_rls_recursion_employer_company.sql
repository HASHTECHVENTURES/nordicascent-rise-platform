-- Fix RLS infinite recursion that breaks employer company reads after signup.
-- Policies that JOIN applications/jobs under RLS re-enter each other (42P17).
-- Replace those joins with SECURITY DEFINER helpers that bypass RLS for the check only.

CREATE OR REPLACE FUNCTION public.candidate_applied_to_company(p_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.candidates c
    JOIN public.applications a ON a.candidate_id = c.id
    JOIN public.jobs j ON j.id = a.job_id
    WHERE c.profile_id = auth.uid()
      AND j.company_id = p_company_id
  );
$$;

CREATE OR REPLACE FUNCTION public.candidate_can_see_employer_profile(p_employer_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.candidates c
    JOIN public.applications a ON a.candidate_id = c.id
    JOIN public.jobs j ON j.id = a.job_id
    JOIN public.employers e ON e.company_id = j.company_id
    WHERE c.profile_id = auth.uid()
      AND e.profile_id = p_employer_profile_id
  );
$$;

CREATE OR REPLACE FUNCTION public.employer_can_see_applicant_profile(p_applicant_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.candidates c
    JOIN public.applications a ON a.candidate_id = c.id
    JOIN public.jobs j ON j.id = a.job_id
    JOIN public.employers e ON e.company_id = j.company_id
    WHERE c.profile_id = p_applicant_profile_id
      AND e.profile_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.employer_can_see_candidate_row(p_candidate_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.applications a
    JOIN public.jobs j ON j.id = a.job_id
    WHERE a.candidate_id = p_candidate_id
      AND j.company_id = public.get_my_company_id()
  );
$$;

CREATE OR REPLACE FUNCTION public.mentor_assigned_job_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT DISTINCT a.job_id
  FROM public.applications a
  JOIN public.company_mentors m ON m.id = a.assigned_mentor_id
  WHERE m.profile_id = auth.uid()
    AND a.job_id IS NOT NULL;
$$;

CREATE OR REPLACE FUNCTION public.mentor_assigned_candidate_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT DISTINCT a.candidate_id
  FROM public.applications a
  JOIN public.company_mentors m ON m.id = a.assigned_mentor_id
  WHERE m.profile_id = auth.uid()
    AND a.candidate_id IS NOT NULL;
$$;

CREATE OR REPLACE FUNCTION public.university_accessible_job_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT DISTINCT a.job_id
  FROM public.applications a
  WHERE public.university_can_access_application(a.id)
    AND a.job_id IS NOT NULL;
$$;

CREATE OR REPLACE FUNCTION public.university_accessible_company_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT DISTINCT j.company_id
  FROM public.jobs j
  JOIN public.applications a ON a.job_id = j.id
  WHERE public.university_can_access_application(a.id)
    AND j.company_id IS NOT NULL;
$$;

CREATE OR REPLACE FUNCTION public.company_has_open_jobs(p_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.jobs j
    WHERE j.company_id = p_company_id
      AND j.status = 'open'::public.job_status
  );
$$;

GRANT EXECUTE ON FUNCTION public.candidate_applied_to_company(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.candidate_can_see_employer_profile(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.employer_can_see_applicant_profile(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.employer_can_see_candidate_row(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mentor_assigned_job_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION public.mentor_assigned_candidate_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION public.university_accessible_job_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION public.university_accessible_company_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION public.company_has_open_jobs(uuid) TO authenticated;

-- Employers: candidate-applied path no longer joins applications under RLS
DROP POLICY IF EXISTS employers_select_candidate_applied ON public.employers;
CREATE POLICY employers_select_candidate_applied ON public.employers
  FOR SELECT
  TO authenticated
  USING (public.candidate_applied_to_company(company_id));

-- Companies: open-jobs visibility without scanning jobs under RLS
DROP POLICY IF EXISTS companies_select ON public.companies;
CREATE POLICY companies_select ON public.companies
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
    OR id = public.get_my_company_id()
    OR status = ANY (ARRAY['verified'::public.entity_status, 'active'::public.entity_status])
    OR public.company_has_open_jobs(id)
  );

DROP POLICY IF EXISTS companies_university_select ON public.companies;
CREATE POLICY companies_university_select ON public.companies
  FOR SELECT
  TO authenticated
  USING (id IN (SELECT public.university_accessible_company_ids()));

-- Jobs: mentor/university paths via SECURITY DEFINER sets
DROP POLICY IF EXISTS jobs_mentor_select ON public.jobs;
CREATE POLICY jobs_mentor_select ON public.jobs
  FOR SELECT
  TO authenticated
  USING (id IN (SELECT public.mentor_assigned_job_ids()));

DROP POLICY IF EXISTS jobs_university_select ON public.jobs;
CREATE POLICY jobs_university_select ON public.jobs
  FOR SELECT
  TO authenticated
  USING (id IN (SELECT public.university_accessible_job_ids()));

-- Candidates: employer visibility + mentor path without recursive joins
DROP POLICY IF EXISTS candidates_select ON public.candidates;
CREATE POLICY candidates_select ON public.candidates
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
    OR profile_id = auth.uid()
    OR public.employer_can_see_candidate_row(id)
  );

DROP POLICY IF EXISTS candidates_mentor_select ON public.candidates;
CREATE POLICY candidates_mentor_select ON public.candidates
  FOR SELECT
  TO authenticated
  USING (id IN (SELECT public.mentor_assigned_candidate_ids()));

-- Profiles: cross-role visibility without recursive joins
DROP POLICY IF EXISTS profiles_select_candidate_employers ON public.profiles;
CREATE POLICY profiles_select_candidate_employers ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.candidate_can_see_employer_profile(id));

DROP POLICY IF EXISTS profiles_select_employer_applicants ON public.profiles;
CREATE POLICY profiles_select_employer_applicants ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.employer_can_see_applicant_profile(id));
