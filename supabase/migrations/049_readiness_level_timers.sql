-- Level 1–2: no fixed time limit. Level 3: 60-minute hard limit.

UPDATE public.readiness_tests
SET timer_hard = false, timer_minutes = 0
WHERE level IN (1, 2);

UPDATE public.readiness_tests
SET timer_hard = true, timer_minutes = 60
WHERE level = 3;

-- Clear expiry on open level 1–2 attempts (no auto-submit).
UPDATE public.readiness_attempts ra
SET expires_at = NULL
FROM public.readiness_tests rt
WHERE ra.test_id = rt.id
  AND rt.level IN (1, 2)
  AND ra.status = 'in_progress';
