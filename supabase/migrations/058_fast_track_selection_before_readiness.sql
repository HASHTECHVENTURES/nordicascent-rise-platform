-- Fast Track must follow Preparation → Selection → Readiness (not skip Selection).
-- Reset candidates stuck on Readiness/mentoring while Selection is incomplete.

UPDATE public.candidate_stage_progress csp
SET status = 'not_started', started_at = NULL, completed_at = NULL
WHERE csp.stage_id IN ('readiness', 'mentoring')
  AND csp.status IN ('active', 'completed')
  AND EXISTS (
    SELECT 1
    FROM public.candidate_stage_progress sel
    WHERE sel.candidate_id = csp.candidate_id
      AND sel.stage_id = 'selection'
      AND sel.status <> 'completed'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM public.applications a
    WHERE a.candidate_id = csp.candidate_id
      AND a.readiness_unlocked_at IS NOT NULL
  );

UPDATE public.candidate_stage_progress sel
SET status = 'active', started_at = COALESCE(sel.started_at, now()), completed_at = NULL
WHERE sel.stage_id = 'selection'
  AND sel.status = 'not_started'
  AND EXISTS (
    SELECT 1
    FROM public.candidate_stage_progress prep
    WHERE prep.candidate_id = sel.candidate_id
      AND prep.stage_id = 'preparation'
      AND prep.status = 'completed'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM public.candidate_stage_progress other
    WHERE other.candidate_id = sel.candidate_id
      AND other.stage_id IN ('selection', 'readiness', 'mentoring', 'activation', 'relocation', 'onboarding', 'followup')
      AND other.status = 'active'
      AND other.id <> sel.id
  );
