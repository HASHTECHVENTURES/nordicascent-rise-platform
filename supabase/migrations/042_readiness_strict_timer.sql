-- Enforce strict timers on all readiness tests (auto-submit at expiry).
UPDATE public.readiness_tests
SET timer_hard = true
WHERE timer_hard = false;

-- Normalize level-2 tests to 60 minutes to match module guidance.
UPDATE public.readiness_tests
SET timer_minutes = 60
WHERE level = 2 AND timer_minutes <> 60;
