-- Admin-managed stage tasks: optional course link + type
ALTER TABLE public.stage_tasks
  ADD COLUMN IF NOT EXISTS content_url TEXT,
  ADD COLUMN IF NOT EXISTS task_type TEXT NOT NULL DEFAULT 'task'
    CHECK (task_type IN ('task', 'course'));

CREATE POLICY "stage_tasks_admin_write" ON public.stage_tasks
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "candidate_task_progress_admin_write" ON public.candidate_task_progress
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());
