-- Align pipeline_stages sort_order with Module 1→2 journey: Preparation → Selection → Readiness → …
UPDATE public.pipeline_stages SET sort_order = 1 WHERE id = 'preparation';
UPDATE public.pipeline_stages SET sort_order = 2 WHERE id = 'selection';
UPDATE public.pipeline_stages SET sort_order = 3 WHERE id = 'readiness';
UPDATE public.pipeline_stages SET sort_order = 4 WHERE id = 'mentoring';
UPDATE public.pipeline_stages SET sort_order = 5 WHERE id = 'internship';
UPDATE public.pipeline_stages SET sort_order = 6 WHERE id = 'activation';
UPDATE public.pipeline_stages SET sort_order = 7 WHERE id = 'relocation';
UPDATE public.pipeline_stages SET sort_order = 8 WHERE id = 'onboarding';
UPDATE public.pipeline_stages SET sort_order = 9 WHERE id = 'followup';
