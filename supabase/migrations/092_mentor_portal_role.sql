-- Mentor portal: role, profile link, RLS access for assigned mentors.

ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'mentor';

ALTER TABLE public.company_mentors
  ADD COLUMN IF NOT EXISTS profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS company_mentors_profile_id_uidx
  ON public.company_mentors (profile_id)
  WHERE profile_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.mentor_can_access_application(p_application_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM applications a
    JOIN company_mentors m ON m.id = a.assigned_mentor_id
    WHERE a.id = p_application_id
      AND m.profile_id = auth.uid()
      AND m.status = 'active'
  );
$$;

GRANT EXECUTE ON FUNCTION public.mentor_can_access_application(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.is_mentor()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'mentor'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_mentor() TO authenticated;

-- Meetings: mentors can read/write assigned applications
DROP POLICY IF EXISTS mentor_program_meetings_select ON public.mentor_program_meetings;
CREATE POLICY mentor_program_meetings_select ON public.mentor_program_meetings
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR public.employer_can_access_application(application_id)
    OR public.mentor_can_access_application(application_id)
    OR application_id IN (
      SELECT a.id FROM applications a
      JOIN candidates c ON c.id = a.candidate_id
      WHERE c.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS mentor_program_meetings_write ON public.mentor_program_meetings;
CREATE POLICY mentor_program_meetings_write ON public.mentor_program_meetings
  FOR ALL TO authenticated
  USING (
    public.is_admin()
    OR public.employer_can_access_application(application_id)
    OR public.mentor_can_access_application(application_id)
  )
  WITH CHECK (
    public.is_admin()
    OR public.employer_can_access_application(application_id)
    OR public.mentor_can_access_application(application_id)
  );

-- Observations
DROP POLICY IF EXISTS mentor_meeting_observations_select ON public.mentor_meeting_observations;
CREATE POLICY mentor_meeting_observations_select ON public.mentor_meeting_observations
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM mentor_program_meetings m
      WHERE m.id = meeting_id
        AND (
          public.employer_can_access_application(m.application_id)
          OR public.mentor_can_access_application(m.application_id)
        )
    )
  );

DROP POLICY IF EXISTS mentor_meeting_observations_write ON public.mentor_meeting_observations;
CREATE POLICY mentor_meeting_observations_write ON public.mentor_meeting_observations
  FOR ALL TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM mentor_program_meetings m
      WHERE m.id = meeting_id
        AND (
          public.employer_can_access_application(m.application_id)
          OR public.mentor_can_access_application(m.application_id)
        )
    )
  )
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM mentor_program_meetings m
      WHERE m.id = meeting_id
        AND (
          public.employer_can_access_application(m.application_id)
          OR public.mentor_can_access_application(m.application_id)
        )
    )
  );

-- Signal notes
DROP POLICY IF EXISTS mentor_signal_notes_select ON public.mentor_signal_notes;
CREATE POLICY mentor_signal_notes_select ON public.mentor_signal_notes
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR public.employer_can_access_application(application_id)
    OR public.mentor_can_access_application(application_id)
  );

DROP POLICY IF EXISTS mentor_signal_notes_write ON public.mentor_signal_notes;
CREATE POLICY mentor_signal_notes_write ON public.mentor_signal_notes
  FOR ALL TO authenticated
  USING (
    public.is_admin()
    OR public.employer_can_access_application(application_id)
    OR public.mentor_can_access_application(application_id)
  )
  WITH CHECK (
    public.is_admin()
    OR public.employer_can_access_application(application_id)
    OR public.mentor_can_access_application(application_id)
  );

-- Activation notes
DROP POLICY IF EXISTS mentor_activation_notes_select ON public.mentor_activation_notes;
CREATE POLICY mentor_activation_notes_select ON public.mentor_activation_notes
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR public.employer_can_access_application(application_id)
    OR public.mentor_can_access_application(application_id)
  );

DROP POLICY IF EXISTS mentor_activation_notes_write ON public.mentor_activation_notes;
CREATE POLICY mentor_activation_notes_write ON public.mentor_activation_notes
  FOR ALL TO authenticated
  USING (
    public.is_admin()
    OR public.employer_can_access_application(application_id)
    OR public.mentor_can_access_application(application_id)
  )
  WITH CHECK (
    public.is_admin()
    OR public.employer_can_access_application(application_id)
    OR public.mentor_can_access_application(application_id)
  );

-- Mentors can read applications they are assigned to (for dashboard)
DROP POLICY IF EXISTS applications_mentor_select ON public.applications;
CREATE POLICY applications_mentor_select ON public.applications
  FOR SELECT TO authenticated
  USING (public.mentor_can_access_application(id));

-- Mentors can read company_mentors row for themselves + company name via companies
DROP POLICY IF EXISTS company_mentors_self_select ON public.company_mentors;
CREATE POLICY company_mentors_self_select ON public.company_mentors
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR profile_id = auth.uid()
    OR company_id IN (
      SELECT e.company_id FROM employers e WHERE e.profile_id = auth.uid()
    )
  );

-- Mentors can read activation records for assigned applications (week gates / status)
DROP POLICY IF EXISTS activation_records_mentor_select ON public.activation_records;
CREATE POLICY activation_records_mentor_select ON public.activation_records
  FOR SELECT TO authenticated
  USING (public.mentor_can_access_application(application_id));

-- Mentors need company/job/candidate reads for dashboard joins
DROP POLICY IF EXISTS companies_mentor_select ON public.companies;
CREATE POLICY companies_mentor_select ON public.companies
  FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT m.company_id FROM company_mentors m WHERE m.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS candidates_mentor_select ON public.candidates;
CREATE POLICY candidates_mentor_select ON public.candidates
  FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT a.candidate_id FROM applications a
      JOIN company_mentors m ON m.id = a.assigned_mentor_id
      WHERE m.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS jobs_mentor_select ON public.jobs;
CREATE POLICY jobs_mentor_select ON public.jobs
  FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT a.job_id FROM applications a
      JOIN company_mentors m ON m.id = a.assigned_mentor_id
      WHERE m.profile_id = auth.uid()
    )
  );
