-- Mentoring as a pipeline stage between Readiness and Selection (job applications).

INSERT INTO public.pipeline_stages (id, name, sort_order, description)
SELECT
  'mentoring',
  'Mentoring',
  COALESCE((SELECT sort_order FROM public.pipeline_stages WHERE id = 'readiness'), 3) + 1,
  'Mentor support after Readiness validation'
WHERE NOT EXISTS (SELECT 1 FROM public.pipeline_stages WHERE id = 'mentoring');

-- Keep selection after mentoring
UPDATE public.pipeline_stages
SET sort_order = COALESCE((SELECT sort_order FROM public.pipeline_stages WHERE id = 'mentoring'), 4) + 1
WHERE id = 'selection'
  AND EXISTS (SELECT 1 FROM public.pipeline_stages WHERE id = 'mentoring');
