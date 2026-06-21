-- Company-specific internship / activation tasks (created in employer portal).

ALTER TABLE public.stage_tasks
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS stage_tasks_stage_company_idx
  ON public.stage_tasks (stage_id, company_id);

DROP POLICY IF EXISTS stage_tasks_employer_select ON public.stage_tasks;
CREATE POLICY stage_tasks_employer_select ON public.stage_tasks
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
    OR company_id IS NULL
    OR company_id = public.get_my_company_id()
    OR EXISTS (
      SELECT 1
      FROM public.candidates c
      INNER JOIN public.applications a ON a.candidate_id = c.id
      INNER JOIN public.jobs j ON j.id = a.job_id
      WHERE c.profile_id = auth.uid()
        AND a.status = 'accepted'
        AND j.company_id = stage_tasks.company_id
    )
  );

DROP POLICY IF EXISTS stage_tasks_employer_write ON public.stage_tasks;
CREATE POLICY stage_tasks_employer_write ON public.stage_tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    stage_id = 'activation'
    AND company_id = public.get_my_company_id()
    AND EXISTS (
      SELECT 1 FROM public.employers e
      WHERE e.profile_id = auth.uid() AND e.company_id = stage_tasks.company_id
    )
  );

DROP POLICY IF EXISTS stage_tasks_employer_update ON public.stage_tasks;
CREATE POLICY stage_tasks_employer_update ON public.stage_tasks
  FOR UPDATE
  TO authenticated
  USING (
    stage_id = 'activation' AND company_id = public.get_my_company_id()
  )
  WITH CHECK (
    stage_id = 'activation' AND company_id = public.get_my_company_id()
  );

DROP POLICY IF EXISTS stage_tasks_employer_delete ON public.stage_tasks;
CREATE POLICY stage_tasks_employer_delete ON public.stage_tasks
  FOR DELETE
  TO authenticated
  USING (
    stage_id = 'activation' AND company_id = public.get_my_company_id()
  );
