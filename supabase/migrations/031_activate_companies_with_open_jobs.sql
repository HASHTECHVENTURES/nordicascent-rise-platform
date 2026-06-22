-- Companies that published open jobs should be visible to candidates.
UPDATE public.companies c
SET status = 'active', updated_at = NOW()
WHERE c.status = 'pending'
  AND EXISTS (
    SELECT 1 FROM public.jobs j
    WHERE j.company_id = c.id AND j.status = 'open'
  );
