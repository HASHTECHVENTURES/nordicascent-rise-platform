-- Harden internship checkpoint unlock after pre-internship gate completes.
-- CP1 must stay locked until gate is complete; refresh must force-unlock CP1 when gate is OK.

CREATE OR REPLACE FUNCTION public.refresh_internship_checkpoint_unlocks(p_application_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r record;
  v_prev_done boolean;
  v_gate_ok boolean;
  v_credit boolean;
  v_academic_credit_done boolean;
  v_all_cps_done boolean;
BEGIN
  v_gate_ok := public.is_pre_internship_gate_complete(p_application_id);

  SELECT COALESCE(university_credit_required, false) INTO v_credit
  FROM activation_records
  WHERE application_id = p_application_id;

  IF COALESCE(v_credit, false) THEN
    SELECT EXISTS (
      SELECT 1 FROM academic_workflow_steps
      WHERE application_id = p_application_id
        AND step_number = 7
        AND status = 'completed'
    ) INTO v_academic_credit_done;
  ELSE
    v_academic_credit_done := true;
  END IF;

  -- Gate incomplete → keep CP1 locked (even if it was incorrectly marked available)
  IF NOT v_gate_ok THEN
    UPDATE internship_checkpoints
    SET status = 'locked', updated_at = now()
    WHERE application_id = p_application_id
      AND checkpoint_number = 1
      AND status = 'available';
  ELSE
    -- Gate complete → force-unlock CP1
    UPDATE internship_checkpoints
    SET status = 'available', updated_at = now()
    WHERE application_id = p_application_id
      AND checkpoint_number = 1
      AND status = 'locked';
  END IF;

  FOR r IN
    SELECT * FROM internship_checkpoints
    WHERE application_id = p_application_id
    ORDER BY checkpoint_number
  LOOP
    IF r.status = 'completed' THEN
      CONTINUE;
    END IF;

    -- System mentor bridges unlock via sync_mentor_internship_checkpoint
    IF r.who_confirms = 'system' THEN
      CONTINUE;
    END IF;

    IF r.checkpoint_number = 1 THEN
      CONTINUE; -- handled above
    END IF;

    v_prev_done := true;
    SELECT COALESCE(status = 'completed', false) INTO v_prev_done
    FROM internship_checkpoints
    WHERE application_id = p_application_id
      AND checkpoint_number = r.checkpoint_number - 1;

    IF v_prev_done AND r.status = 'locked' THEN
      UPDATE internship_checkpoints
      SET status = 'available', updated_at = now()
      WHERE id = r.id;
    END IF;
  END LOOP;

  IF EXISTS (
    SELECT 1 FROM internship_checkpoints
    WHERE application_id = p_application_id AND checkpoint_number = 1 AND status = 'completed'
  ) THEN
    UPDATE activation_records
    SET status = 'internship_active', updated_at = now()
    WHERE application_id = p_application_id
      AND status = 'ready_for_activation';
  END IF;

  SELECT NOT EXISTS (
    SELECT 1 FROM internship_checkpoints
    WHERE application_id = p_application_id AND status <> 'completed'
  ) AND EXISTS (
    SELECT 1 FROM internship_checkpoints WHERE application_id = p_application_id
  ) INTO v_all_cps_done;

  IF v_all_cps_done AND v_academic_credit_done THEN
    UPDATE activation_records
    SET
      status = 'internship_complete',
      internship_completion_issued_at = COALESCE(internship_completion_issued_at, now()),
      updated_at = now()
    WHERE application_id = p_application_id
      AND status IN ('ready_for_activation', 'internship_active');
  END IF;
END;
$$;

-- After accept, ensure rows exist then unlock
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

  -- Seed checkpoints if missing (all locked; refresh unlocks CP1)
  INSERT INTO internship_checkpoints (
    application_id, checkpoint_number, phase, title, who_confirms, auto_source, status
  )
  VALUES
    (p_application_id, 1, 'onboarding', 'Internship started', 'company', NULL, 'locked'),
    (p_application_id, 2, 'onboarding', 'Mentor Meeting 4 done', 'system', 'mentor_meeting_4', 'locked'),
    (p_application_id, 3, 'execution', 'Mid-internship status check', 'company', NULL, 'locked'),
    (p_application_id, 4, 'execution', 'Mentor Meeting 5 done', 'system', 'mentor_meeting_5', 'locked'),
    (p_application_id, 5, 'review', 'Candidate presented results', 'company', NULL, 'locked'),
    (p_application_id, 6, 'review', 'Internship evaluation submitted', 'company', NULL, 'locked'),
    (p_application_id, 7, 'review', 'Mentor Meeting 6 done', 'system', 'mentor_meeting_6', 'locked')
  ON CONFLICT (application_id, checkpoint_number) DO NOTHING;

  PERFORM public.refresh_internship_checkpoint_unlocks(p_application_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.refresh_internship_checkpoint_unlocks(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_pre_internship(uuid, date) TO authenticated;

-- Heal existing apps that completed the gate but still have CP1 locked
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT ar.application_id
    FROM activation_records ar
    WHERE public.is_pre_internship_gate_complete(ar.application_id)
  LOOP
    PERFORM public.refresh_internship_checkpoint_unlocks(r.application_id);
  END LOOP;
END $$;
