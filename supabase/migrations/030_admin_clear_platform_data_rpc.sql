-- One-click platform reset for admins (Settings → Clear all platform data).
-- Removes test users, companies, candidates, jobs, messages, and program tasks.

CREATE OR REPLACE FUNCTION public.admin_clear_platform_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  DELETE FROM public.messages;
  DELETE FROM public.conversation_participants;
  DELETE FROM public.conversations;

  DELETE FROM public.support_ticket_messages;
  DELETE FROM public.support_tickets;

  DELETE FROM public.notifications;
  DELETE FROM public.activity_log;
  DELETE FROM public.mentoring_sessions;

  DELETE FROM public.candidate_task_progress;
  DELETE FROM public.candidate_stage_progress;
  DELETE FROM public.applications;
  DELETE FROM public.issues;
  DELETE FROM public.employer_tasks;
  DELETE FROM public.jobs;
  DELETE FROM public.employers;
  DELETE FROM public.candidates;
  DELETE FROM public.companies;

  DELETE FROM public.contact_submissions;
  DELETE FROM public.announcements;
  DELETE FROM public.insight_articles;

  DELETE FROM public.stage_tasks;

  DELETE FROM public.profiles WHERE role <> 'admin';

  DELETE FROM auth.users
  WHERE email IS DISTINCT FROM 'admin@nordicascent.com';
END;
$$;

REVOKE ALL ON FUNCTION public.admin_clear_platform_data() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_clear_platform_data() TO authenticated;
