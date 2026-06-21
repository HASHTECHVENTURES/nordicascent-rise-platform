-- Full page content for stage tasks (shown when candidate clicks Continue)
ALTER TABLE public.stage_tasks
  ADD COLUMN IF NOT EXISTS content_body TEXT;
