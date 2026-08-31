-- Regular vs Master admin: only Master can access destructive actions (Settings reset, deletes).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS admin_tier text NOT NULL DEFAULT 'regular'
  CHECK (admin_tier IN ('regular', 'master'));

UPDATE public.profiles
SET admin_tier = 'master'
WHERE role = 'admin';

CREATE OR REPLACE FUNCTION public.is_master_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
      AND admin_tier = 'master'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_master_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_clear_platform_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_master_admin() THEN
    RAISE EXCEPTION 'Master admin access required';
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

CREATE OR REPLACE FUNCTION public.admin_delete_candidate(p_candidate_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id UUID;
BEGIN
  IF NOT public.is_master_admin() THEN
    RAISE EXCEPTION 'Master admin access required';
  END IF;

  SELECT profile_id INTO v_profile_id
  FROM public.candidates
  WHERE id = p_candidate_id;

  IF v_profile_id IS NULL THEN
    RAISE EXCEPTION 'Candidate not found';
  END IF;

  DELETE FROM public.applications WHERE candidate_id = p_candidate_id;
  DELETE FROM public.mentoring_sessions WHERE candidate_id = p_candidate_id;
  DELETE FROM public.issues WHERE candidate_id = p_candidate_id;
  DELETE FROM public.university_waitlist WHERE candidate_id = p_candidate_id;
  DELETE FROM public.candidates WHERE id = p_candidate_id;

  DELETE FROM public.messages WHERE sender_id = v_profile_id;
  DELETE FROM public.conversation_participants WHERE profile_id = v_profile_id;
  DELETE FROM public.notifications WHERE user_id = v_profile_id;
  DELETE FROM public.support_tickets WHERE user_id = v_profile_id;

  DELETE FROM public.profiles WHERE id = v_profile_id;
  DELETE FROM auth.users WHERE id = v_profile_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_company(p_company_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id UUID;
BEGIN
  IF NOT public.is_master_admin() THEN
    RAISE EXCEPTION 'Master admin access required';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.companies WHERE id = p_company_id) THEN
    RAISE EXCEPTION 'Company not found';
  END IF;

  DELETE FROM public.applications
  WHERE job_id IN (SELECT id FROM public.jobs WHERE company_id = p_company_id);

  DELETE FROM public.jobs WHERE company_id = p_company_id;

  DELETE FROM public.employer_tasks
  WHERE employer_id IN (SELECT id FROM public.employers WHERE company_id = p_company_id);

  FOR v_profile_id IN
    SELECT profile_id FROM public.employers WHERE company_id = p_company_id
  LOOP
    DELETE FROM public.messages WHERE sender_id = v_profile_id;
    DELETE FROM public.conversation_participants WHERE profile_id = v_profile_id;
    DELETE FROM public.notifications WHERE user_id = v_profile_id;
    DELETE FROM public.support_tickets WHERE user_id = v_profile_id;
    DELETE FROM public.employers WHERE profile_id = v_profile_id;
    DELETE FROM public.profiles WHERE id = v_profile_id;
    DELETE FROM auth.users WHERE id = v_profile_id;
  END LOOP;

  DELETE FROM public.employers WHERE company_id = p_company_id;
  DELETE FROM public.companies WHERE id = p_company_id;
END;
$$;
