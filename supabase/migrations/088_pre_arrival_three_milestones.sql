-- Pre-Arrival Employment: only 3 milestones after Final Clearance
-- (contract, remote setup, tasks). Drop "Ongoing work confirmed".

DELETE FROM public.pre_arrival_checkpoints
WHERE title ILIKE '%Ongoing work%'
   OR (checkpoint_number >= 4 AND title NOT ILIKE '%Employment contract%');
