-- Module 4: soft sequential order for mentor auto-checkpoints (2, 4, 7).
-- Mentor meetings may complete early; only mark the internship checkpoint complete
-- once the previous checkpoint is done. confirm_internship_checkpoint re-syncs.

CREATE OR REPLACE FUNCTION public.sync_mentor_internship_checkpoint(
  p_application_id uuid,
  p_meeting_number smallint
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_auto_source text;
  v_cp_num smallint;
  v_obs_date date;
  v_prev_done boolean;
BEGIN
  IF p_meeting_number = 4 THEN
    v_auto_source := 'mentor_meeting_4';
    v_cp_num := 2;
  ELSIF p_meeting_number = 5 THEN
    v_auto_source := 'mentor_meeting_5';
    v_cp_num := 4;
  ELSIF p_meeting_number = 6 THEN
    v_auto_source := 'mentor_meeting_6';
    v_cp_num := 7;
  ELSE
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM mentor_program_meetings m
    WHERE m.application_id = p_application_id
      AND m.meeting_number = p_meeting_number
      AND m.status = 'completed'
  ) THEN
    RETURN;
  END IF;

  IF v_cp_num > 1 THEN
    SELECT status = 'completed' INTO v_prev_done
    FROM internship_checkpoints
    WHERE application_id = p_application_id
      AND checkpoint_number = v_cp_num - 1;
    IF NOT COALESCE(v_prev_done, false) THEN
      RETURN;
    END IF;
  END IF;

  SELECT o.meeting_date INTO v_obs_date
  FROM mentor_program_meetings m
  LEFT JOIN mentor_meeting_observations o ON o.meeting_id = m.id
  WHERE m.application_id = p_application_id AND m.meeting_number = p_meeting_number
  LIMIT 1;

  UPDATE internship_checkpoints
  SET
    status = 'completed',
    event_date = COALESCE(v_obs_date, CURRENT_DATE),
    completed_at = now(),
    updated_at = now()
  WHERE application_id = p_application_id
    AND checkpoint_number = v_cp_num
    AND auto_source = v_auto_source
    AND status <> 'completed';

  PERFORM public.refresh_internship_checkpoint_unlocks(p_application_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.sync_mentor_internship_checkpoint(uuid, smallint) TO authenticated;
