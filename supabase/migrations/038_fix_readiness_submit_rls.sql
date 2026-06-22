-- Fix: candidates could not submit readiness tests (403 on UPDATE).
-- USING required status = in_progress; default WITH CHECK reused USING and blocked submitted/expired.

DROP POLICY IF EXISTS readiness_attempts_update ON public.readiness_attempts;
CREATE POLICY readiness_attempts_update ON public.readiness_attempts
  FOR UPDATE TO authenticated
  USING (
    public.is_admin()
    OR (
      candidate_id IN (SELECT id FROM public.candidates WHERE profile_id = auth.uid())
      AND status = 'in_progress'
    )
  )
  WITH CHECK (
    public.is_admin()
    OR candidate_id IN (SELECT id FROM public.candidates WHERE profile_id = auth.uid())
  );
