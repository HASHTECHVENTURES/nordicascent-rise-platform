-- Skip family step (7) in timeline/rollup when candidate.family_relocating is false
CREATE OR REPLACE FUNCTION public.sync_relocation_status(p_application_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status text;
  v_step10_done boolean;
  v_has_blocked boolean;
  v_has_risk boolean;
  v_family boolean;
BEGIN
  SELECT COALESCE(c.family_relocating, false) INTO v_family
  FROM applications a
  JOIN candidates c ON c.id = a.candidate_id
  WHERE a.id = p_application_id;

  SELECT EXISTS (
    SELECT 1 FROM relocation_steps
    WHERE application_id = p_application_id AND step_number = 10 AND state = 'done'
  ) INTO v_step10_done;

  IF v_step10_done THEN
    v_status := 'arrived';
  ELSE
    SELECT EXISTS (
      SELECT 1 FROM relocation_steps
      WHERE application_id = p_application_id AND state = 'blocked'
        AND (v_family OR step_number <> 7)
    ) INTO v_has_blocked;

    SELECT EXISTS (
      SELECT 1 FROM relocation_steps
      WHERE application_id = p_application_id AND state = 'at_risk'
        AND (v_family OR step_number <> 7)
    ) INTO v_has_risk;

    IF v_has_blocked THEN
      v_status := 'relocation_blocked';
    ELSIF v_has_risk THEN
      v_status := 'relocation_at_risk';
    ELSE
      v_status := 'relocation_active';
    END IF;
  END IF;

  UPDATE activation_records
  SET relocation_status = v_status, updated_at = now()
  WHERE application_id = p_application_id;

  RETURN v_status;
END;
$$;

CREATE OR REPLACE FUNCTION public.refresh_relocation_timeline(p_application_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clearance date;
  v_arrival date;
  v_family boolean;
  r record;
  v_due date;
BEGIN
  SELECT ar.final_clearance_date, ar.planned_arrival_date, COALESCE(c.family_relocating, false)
  INTO v_clearance, v_arrival, v_family
  FROM activation_records ar
  JOIN applications a ON a.id = ar.application_id
  JOIN candidates c ON c.id = a.candidate_id
  WHERE ar.application_id = p_application_id;

  FOR r IN
    SELECT * FROM relocation_steps
    WHERE application_id = p_application_id
      AND state NOT IN ('done', 'blocked')
      AND (v_family OR step_number <> 7)
  LOOP
    v_due := r.target_due_date;

    IF r.step_number = 1 THEN
      v_due := v_clearance;
    ELSIF r.step_number IN (2, 3, 4) AND v_clearance IS NOT NULL THEN
      IF r.step_number = 3 THEN
        v_due := v_clearance + 14;
      ELSE
        v_due := v_clearance + 21;
      END IF;
    ELSIF r.step_number = 5 AND v_arrival IS NOT NULL THEN
      v_due := v_arrival - 28;
    ELSIF r.step_number = 6 AND v_arrival IS NOT NULL THEN
      v_due := v_arrival;
    ELSIF r.step_number = 8 AND v_arrival IS NOT NULL THEN
      v_due := v_arrival - 21;
    ELSIF r.step_number = 9 AND v_arrival IS NOT NULL THEN
      v_due := v_arrival - 14;
    ELSIF r.step_number = 10 AND v_arrival IS NOT NULL THEN
      v_due := v_arrival;
    END IF;

    IF v_due IS DISTINCT FROM r.target_due_date THEN
      UPDATE relocation_steps
      SET target_due_date = v_due, updated_at = now()
      WHERE id = r.id;
    END IF;

    IF v_due IS NOT NULL AND v_due < CURRENT_DATE AND r.state = 'on_track' THEN
      UPDATE relocation_steps
      SET state = 'at_risk', updated_at = now()
      WHERE id = r.id;
    END IF;
  END LOOP;

  PERFORM public.sync_relocation_status(p_application_id);
END;
$$;
