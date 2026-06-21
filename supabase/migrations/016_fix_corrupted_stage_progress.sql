-- Fix candidates whose post-selection stages were wrongly marked completed
-- (caused by isTaskRequirementMet defaulting to true for all non-profile tasks).

-- Remove auto-faked task completions for stages after preparation
DELETE FROM candidate_task_progress ctp
USING stage_tasks st
WHERE ctp.task_id = st.id
  AND st.stage_id IN ('selection', 'readiness', 'activation', 'relocation', 'onboarding', 'followup');

-- Reset those stages to not_started unless they are the current active stage
UPDATE candidate_stage_progress
SET status = 'not_started', started_at = NULL, completed_at = NULL
WHERE stage_id IN ('readiness', 'activation', 'relocation', 'onboarding', 'followup');

-- Selection stays active for candidates who were accepted; preparation stays completed
UPDATE candidate_stage_progress csp
SET status = 'active', started_at = COALESCE(started_at, NOW()), completed_at = NULL
WHERE stage_id = 'selection'
  AND candidate_id IN (
    SELECT a.candidate_id FROM applications a WHERE a.status = 'accepted'
  )
  AND NOT EXISTS (
    SELECT 1 FROM candidate_stage_progress x
    WHERE x.candidate_id = csp.candidate_id AND x.stage_id = 'selection' AND x.status = 'completed'
  );
