-- Fix stage_tasks reads for candidates (relocation guides, etc.).
-- Employer select policy could block reads when helper functions error.

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;
GRANT EXECUTE ON FUNCTION public.get_my_company_id() TO anon;

DROP POLICY IF EXISTS stage_tasks_candidate_platform_read ON public.stage_tasks;
CREATE POLICY stage_tasks_candidate_platform_read ON public.stage_tasks
  FOR SELECT TO authenticated
  USING (
    company_id IS NULL
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'candidate'
    )
  );

NOTIFY pgrst, 'reload schema';
