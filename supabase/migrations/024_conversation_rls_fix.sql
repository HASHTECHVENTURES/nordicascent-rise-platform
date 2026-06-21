-- Fix infinite recursion on conversation_participants RLS.
-- Uses SECURITY DEFINER helpers so policies never self-reference.

DROP POLICY IF EXISTS conversation_participants_insert_employer_applicant ON public.conversation_participants;

CREATE OR REPLACE FUNCTION public.get_my_conversation_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT conversation_id
  FROM public.conversation_participants
  WHERE profile_id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.get_my_conversation_ids() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_conversation_ids() TO authenticated;

DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'conversation_participants'
      AND cmd = 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.conversation_participants', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY conversation_participants_select ON public.conversation_participants
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
    OR profile_id = auth.uid()
    OR conversation_id IN (SELECT public.get_my_conversation_ids())
  );

CREATE OR REPLACE FUNCTION public.get_or_create_conversation_with_profile(
  p_other_profile_id uuid,
  p_subject text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_my_id uuid;
  v_conv_id uuid;
BEGIN
  v_my_id := auth.uid();
  IF v_my_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_other_profile_id = v_my_id THEN
    RAISE EXCEPTION 'Cannot message yourself';
  END IF;

  SELECT cp1.conversation_id INTO v_conv_id
  FROM public.conversation_participants cp1
  INNER JOIN public.conversation_participants cp2
    ON cp2.conversation_id = cp1.conversation_id
  WHERE cp1.profile_id = v_my_id
    AND cp2.profile_id = p_other_profile_id
  LIMIT 1;

  IF v_conv_id IS NOT NULL THEN
    RETURN v_conv_id;
  END IF;

  IF NOT public.is_admin() THEN
    IF NOT (
      EXISTS (
        SELECT 1
        FROM public.employers e
        INNER JOIN public.jobs j ON j.company_id = e.company_id
        INNER JOIN public.applications a ON a.job_id = j.id
        INNER JOIN public.candidates c ON c.id = a.candidate_id
        WHERE e.profile_id = v_my_id
          AND c.profile_id = p_other_profile_id
      )
      OR EXISTS (
        SELECT 1
        FROM public.candidates c
        INNER JOIN public.applications a ON a.candidate_id = c.id
        INNER JOIN public.jobs j ON j.id = a.job_id
        INNER JOIN public.employers e ON e.company_id = j.company_id
        WHERE c.profile_id = v_my_id
          AND e.profile_id = p_other_profile_id
      )
      OR EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = p_other_profile_id
          AND p.role = 'admin'
      )
      OR EXISTS (
        SELECT 1
        FROM public.profiles me
        WHERE me.id = v_my_id
          AND me.role = 'admin'
      )
    ) THEN
      RAISE EXCEPTION 'Not allowed to start this conversation';
    END IF;
  END IF;

  INSERT INTO public.conversations (subject)
  VALUES (p_subject)
  RETURNING id INTO v_conv_id;

  INSERT INTO public.conversation_participants (conversation_id, profile_id)
  VALUES (v_conv_id, v_my_id), (v_conv_id, p_other_profile_id);

  RETURN v_conv_id;
END;
$$;

REVOKE ALL ON FUNCTION public.get_or_create_conversation_with_profile(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_or_create_conversation_with_profile(uuid, text) TO authenticated;
