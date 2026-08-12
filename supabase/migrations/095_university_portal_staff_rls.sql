-- University portal: staff link + scoped academic access (no hiring/clearance).
-- Depends on 094_university_role_enum (committed university role).

CREATE TABLE IF NOT EXISTS public.university_staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  invite_sent_at timestamptz,
  invited_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS university_staff_profile_id_uidx
  ON public.university_staff (profile_id)
  WHERE profile_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS university_staff_university_idx
  ON public.university_staff (university_id);

CREATE UNIQUE INDEX IF NOT EXISTS university_staff_email_uni_uidx
  ON public.university_staff (university_id, lower(email));

ALTER TABLE public.university_staff ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_university()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'university'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_university() TO authenticated;

CREATE OR REPLACE FUNCTION public.university_staff_for_application(p_application_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM applications a
    JOIN candidates c ON c.id = a.candidate_id
    JOIN university_staff us ON us.university_id = c.university_id
    WHERE a.id = p_application_id
      AND us.profile_id = auth.uid()
      AND us.status = 'active'
  );
$$;

GRANT EXECUTE ON FUNCTION public.university_staff_for_application(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.university_can_access_application(p_application_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.university_staff_for_application(p_application_id)
    AND EXISTS (
      SELECT 1 FROM activation_records ar
      WHERE ar.application_id = p_application_id
        AND ar.university_credit_required = true
    );
$$;

GRANT EXECUTE ON FUNCTION public.university_can_access_application(uuid) TO authenticated;

DROP POLICY IF EXISTS university_staff_select ON public.university_staff;
CREATE POLICY university_staff_select ON public.university_staff
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR profile_id = auth.uid()
  );

DROP POLICY IF EXISTS university_staff_admin_write ON public.university_staff;
CREATE POLICY university_staff_admin_write ON public.university_staff
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS academic_workflow_steps_select ON public.academic_workflow_steps;
CREATE POLICY academic_workflow_steps_select ON public.academic_workflow_steps
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR public.employer_can_access_application(application_id)
    OR public.candidate_owns_application(application_id)
    OR public.university_can_access_application(application_id)
  );

DROP POLICY IF EXISTS academic_workflow_steps_write ON public.academic_workflow_steps;
CREATE POLICY academic_workflow_steps_write ON public.academic_workflow_steps
  FOR ALL TO authenticated
  USING (
    public.is_admin()
    OR public.employer_can_access_application(application_id)
    OR public.university_can_access_application(application_id)
  )
  WITH CHECK (
    public.is_admin()
    OR public.employer_can_access_application(application_id)
    OR public.university_can_access_application(application_id)
  );

DROP POLICY IF EXISTS activation_records_university_select ON public.activation_records;
CREATE POLICY activation_records_university_select ON public.activation_records
  FOR SELECT TO authenticated
  USING (
    public.university_staff_for_application(application_id)
    AND university_credit_required = true
  );

DROP POLICY IF EXISTS applications_university_select ON public.applications;
CREATE POLICY applications_university_select ON public.applications
  FOR SELECT TO authenticated
  USING (public.university_can_access_application(id));

DROP POLICY IF EXISTS candidates_university_select ON public.candidates;
CREATE POLICY candidates_university_select ON public.candidates
  FOR SELECT TO authenticated
  USING (
    university_id IN (
      SELECT us.university_id FROM university_staff us
      WHERE us.profile_id = auth.uid() AND us.status = 'active'
    )
  );

DROP POLICY IF EXISTS jobs_university_select ON public.jobs;
CREATE POLICY jobs_university_select ON public.jobs
  FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT a.job_id FROM applications a
      WHERE public.university_can_access_application(a.id)
    )
  );

DROP POLICY IF EXISTS companies_university_select ON public.companies;
CREATE POLICY companies_university_select ON public.companies
  FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT j.company_id FROM jobs j
      JOIN applications a ON a.job_id = j.id
      WHERE public.university_can_access_application(a.id)
    )
  );

DROP POLICY IF EXISTS profiles_university_candidate_select ON public.profiles;
CREATE POLICY profiles_university_candidate_select ON public.profiles
  FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT c.profile_id FROM candidates c
      JOIN university_staff us ON us.university_id = c.university_id
      WHERE us.profile_id = auth.uid() AND us.status = 'active'
    )
  );
