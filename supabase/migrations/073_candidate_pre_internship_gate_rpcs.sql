-- Candidates must acknowledge presentation + accept internship, but activation_records
-- write RLS only allows admin/employer. Direct client updates appear to succeed (0 rows)
-- while nothing is saved — candidate acceptance never unlocks.
-- Fix: SECURITY DEFINER RPCs that verify the caller owns the application.

CREATE OR REPLACE FUNCTION public.candidate_owns_application(p_application_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM applications a
    JOIN candidates c ON c.id = a.candidate_id
    WHERE a.id = p_application_id
      AND c.profile_id = auth.uid()
  );
$$;

GRANT EXECUTE ON FUNCTION public.candidate_owns_application(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.acknowledge_pre_internship_presentation(p_application_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (
    public.is_admin()
    OR public.employer_can_access_application(p_application_id)
    OR public.candidate_owns_application(p_application_id)
  ) THEN
    RAISE EXCEPTION 'Not allowed to acknowledge presentation for this application';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM activation_records WHERE application_id = p_application_id
  ) THEN
    RAISE EXCEPTION 'Activation record not found';
  END IF;

  UPDATE activation_records
  SET
    presentation_acknowledged_at = COALESCE(presentation_acknowledged_at, now()),
    presentation_acknowledged_by = COALESCE(presentation_acknowledged_by, auth.uid()),
    updated_at = now()
  WHERE application_id = p_application_id;

  PERFORM public.refresh_internship_checkpoint_unlocks(p_application_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.acknowledge_pre_internship_presentation(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.accept_pre_internship(
  p_application_id uuid,
  p_internship_start_date date DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ack timestamptz;
BEGIN
  IF NOT public.candidate_owns_application(p_application_id) THEN
    RAISE EXCEPTION 'Only the candidate can accept the internship';
  END IF;

  SELECT presentation_acknowledged_at INTO v_ack
  FROM activation_records
  WHERE application_id = p_application_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Activation record not found';
  END IF;

  IF v_ack IS NULL THEN
    RAISE EXCEPTION 'Acknowledge the presentation before accepting the internship';
  END IF;

  UPDATE activation_records
  SET
    candidate_accepted_at = COALESCE(candidate_accepted_at, now()),
    internship_start_date = COALESCE(p_internship_start_date, internship_start_date),
    updated_at = now()
  WHERE application_id = p_application_id;

  PERFORM public.refresh_internship_checkpoint_unlocks(p_application_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.accept_pre_internship(uuid, date) TO authenticated;
