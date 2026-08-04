-- Move A1 Norwegian + Employer onboarding toolkit out of Activation Pre-Arrival
-- (they belong in Relocation). Keep Pre-Arrival as 4 checkpoints.

-- Remove relocated checkpoints from Pre-Arrival
DELETE FROM public.pre_arrival_checkpoints
WHERE title IN (
  'A1 Norwegian course started',
  'Employer onboarding toolkit received'
)
OR checkpoint_number IN (4, 5);

-- Renumber "Ongoing work confirmed" from 6 → 4 when still present
UPDATE public.pre_arrival_checkpoints
SET checkpoint_number = 4, updated_at = now()
WHERE checkpoint_number = 6
  AND title = 'Ongoing work confirmed';

-- If both 4 (ongoing after renumber) and old 6 somehow coexist, keep one
DELETE FROM public.pre_arrival_checkpoints a
USING public.pre_arrival_checkpoints b
WHERE a.application_id = b.application_id
  AND a.checkpoint_number = 4
  AND b.checkpoint_number = 4
  AND a.id > b.id;
