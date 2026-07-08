-- Module 3B: optional add-on topics mentors can attach to standard sessions
ALTER TABLE mentor_meeting_observations
  ADD COLUMN IF NOT EXISTS addon_topics text;

COMMENT ON COLUMN mentor_meeting_observations.addon_topics IS
  'Optional extra topics the mentor covered beyond the standard session theme.';
