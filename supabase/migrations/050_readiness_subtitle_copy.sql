-- Align readiness test subtitles with level-based timing rules.

UPDATE public.readiness_tests
SET subtitle = 'Awareness · Structured reflection'
WHERE level = 1;

UPDATE public.readiness_tests
SET subtitle = 'Application · Applied case work'
WHERE level = 2;

UPDATE public.readiness_tests
SET subtitle = 'Behaviour · Live / simulated behaviour'
WHERE level = 3;
