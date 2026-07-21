-- Company/admin confirm must not silently no-op under RLS (0 rows, no error).

CREATE OR REPLACE FUNCTION public.confirm_internship_checkpoint(
  p_checkpoint_id uuid,
  p_application_id uuid,
  p_event_date date,
  p_notes text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_who text;
  v_status text;
BEGIN
  IF NOT (
    public.is_admin()
    OR public.employer_can_access_application(p_application_id)
  ) THEN
    RAISE EXCEPTION 'Only company or admin can confirm internship checkpoints';
  END IF;

  SELECT who_confirms, status INTO v_who, v_status
  FROM internship_checkpoints
  WHERE id = p_checkpoint_id
    AND application_id = p_application_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Checkpoint not found';
  END IF;

  IF v_who <> 'company' THEN
    RAISE EXCEPTION 'This checkpoint is auto-completed from the mentor programme';
  END IF;

  IF v_status = 'locked' THEN
    RAISE EXCEPTION 'Checkpoint is still locked — complete previous steps first';
  END IF;

  IF v_status = 'completed' THEN
    RETURN;
  END IF;

  UPDATE internship_checkpoints
  SET
    status = 'completed',
    event_date = p_event_date,
    notes = NULLIF(trim(p_notes), ''),
    confirmed_by = auth.uid(),
    completed_at = now(),
    updated_at = now()
  WHERE id = p_checkpoint_id
    AND application_id = p_application_id;

  PERFORM public.refresh_internship_checkpoint_unlocks(p_application_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.confirm_internship_checkpoint(uuid, uuid, date, text) TO authenticated;
