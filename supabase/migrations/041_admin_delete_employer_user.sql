-- Delete a single employer login (company record remains if other users exist).

CREATE OR REPLACE FUNCTION public.admin_delete_employer_user(p_profile_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = p_profile_id AND role = 'employer'
  ) THEN
    RAISE EXCEPTION 'Employer user not found';
  END IF;

  DELETE FROM public.employer_tasks
  WHERE employer_id IN (SELECT id FROM public.employers WHERE profile_id = p_profile_id);

  DELETE FROM public.messages WHERE sender_id = p_profile_id;
  DELETE FROM public.conversation_participants WHERE profile_id = p_profile_id;
  DELETE FROM public.notifications WHERE user_id = p_profile_id;
  DELETE FROM public.support_tickets WHERE user_id = p_profile_id;

  DELETE FROM public.employers WHERE profile_id = p_profile_id;
  DELETE FROM public.profiles WHERE id = p_profile_id;
  DELETE FROM auth.users WHERE id = p_profile_id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_delete_employer_user(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_delete_employer_user(UUID) TO authenticated;
