-- Allow companies to create activation-stage tasks (work permit / pre-employment).

DROP POLICY IF EXISTS stage_tasks_employer_write ON public.stage_tasks;
CREATE POLICY stage_tasks_employer_write ON public.stage_tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    stage_id IN ('internship', 'activation')
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
    stage_id IN ('internship', 'activation') AND company_id = public.get_my_company_id()
  )
  WITH CHECK (
    stage_id IN ('internship', 'activation') AND company_id = public.get_my_company_id()
  );

DROP POLICY IF EXISTS stage_tasks_employer_delete ON public.stage_tasks;
CREATE POLICY stage_tasks_employer_delete ON public.stage_tasks
  FOR DELETE
  TO authenticated
  USING (
    stage_id IN ('internship', 'activation') AND company_id = public.get_my_company_id()
  );
