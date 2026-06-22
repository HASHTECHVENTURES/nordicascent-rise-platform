-- Job applications unlocked by admin from Mentoring panel (not Readiness approval).
ALTER TABLE candidates
  ADD COLUMN IF NOT EXISTS jobs_unlocked BOOLEAN NOT NULL DEFAULT false;

-- Migrate existing readiness approvals to jobs_unlocked.
UPDATE candidates c
SET jobs_unlocked = true
FROM readiness_evaluations e
WHERE e.candidate_id = c.id
  AND e.approved_for_activation = true
  AND c.jobs_unlocked = false;

COMMENT ON COLUMN candidates.jobs_unlocked IS 'Admin unlocks job applications from Mentoring panel after mentoring support.';
