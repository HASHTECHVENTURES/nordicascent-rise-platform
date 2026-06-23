-- Admin delete single candidate or company (including auth user).

CREATE OR REPLACE FUNCTION public.admin_delete_candidate(p_candidate_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id UUID;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
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
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
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

REVOKE ALL ON FUNCTION public.admin_delete_candidate(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_delete_company(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_delete_candidate(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_company(UUID) TO authenticated;
