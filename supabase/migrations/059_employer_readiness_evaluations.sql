-- Employers can view curated Readiness signals for candidates on their jobs (post mentor unlock).

DROP POLICY IF EXISTS readiness_evaluations_employer_select ON public.readiness_evaluations;
CREATE POLICY readiness_evaluations_employer_select ON public.readiness_evaluations
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.applications a
      JOIN public.jobs j ON j.id = a.job_id
      JOIN public.employers e ON e.company_id = j.company_id
      WHERE a.candidate_id = readiness_evaluations.candidate_id
        AND e.profile_id = auth.uid()
        AND a.readiness_unlocked_at IS NOT NULL
    )
  );
