-- Split internship (company program) from activation (work permit / pre-employment).

-- Move any company-created tasks from activation → internship
UPDATE public.stage_tasks
SET stage_id = 'internship'
WHERE stage_id = 'activation' AND company_id IS NOT NULL;

-- Add internship as its own pipeline stage (before activation)
INSERT INTO public.pipeline_stages (id, name, sort_order, description)
SELECT
  'internship',
  'Internship',
  COALESCE((SELECT sort_order FROM public.pipeline_stages WHERE id = 'activation'), 4) - 1,
  '6–10 week company internship program'
WHERE NOT EXISTS (SELECT 1 FROM public.pipeline_stages WHERE id = 'internship');

UPDATE public.pipeline_stages
SET description = 'Work permit and pre-employment steps'
WHERE id = 'activation';

-- Employer portal: company tasks are internship-only
DROP POLICY IF EXISTS stage_tasks_employer_write ON public.stage_tasks;
CREATE POLICY stage_tasks_employer_write ON public.stage_tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    stage_id = 'internship'
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
    stage_id = 'internship' AND company_id = public.get_my_company_id()
  )
  WITH CHECK (
    stage_id = 'internship' AND company_id = public.get_my_company_id()
  );

DROP POLICY IF EXISTS stage_tasks_employer_delete ON public.stage_tasks;
CREATE POLICY stage_tasks_employer_delete ON public.stage_tasks
  FOR DELETE
  TO authenticated
  USING (
    stage_id = 'internship' AND company_id = public.get_my_company_id()
  );
