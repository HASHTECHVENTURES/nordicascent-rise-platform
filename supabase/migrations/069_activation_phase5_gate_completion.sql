-- Module 4 Phase 5: Pre-internship gate + pre-arrival completion support

ALTER TABLE public.activation_records
  ADD COLUMN IF NOT EXISTS presentation_acknowledged_at timestamptz,
  ADD COLUMN IF NOT EXISTS presentation_acknowledged_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS candidate_accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS academic_unlocked_at timestamptz,
  ADD COLUMN IF NOT EXISTS academic_unlocked_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS internship_start_date date,
  ADD COLUMN IF NOT EXISTS pre_arrival_completed_at timestamptz;

CREATE OR REPLACE FUNCTION public.is_pre_internship_gate_complete(p_application_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT
        ar.presentation_acknowledged_at IS NOT NULL
        AND ar.candidate_accepted_at IS NOT NULL
        AND (
          NOT ar.university_credit_required
          OR ar.academic_unlocked_at IS NOT NULL
        )
      FROM activation_records ar
      WHERE ar.application_id = p_application_id
    ),
    false
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_pre_internship_gate_complete(uuid) TO authenticated;

-- Block internship checkpoint 1 until pre-internship gate is complete
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
BEGIN
  v_gate_ok := public.is_pre_internship_gate_complete(p_application_id);

  FOR r IN
    SELECT * FROM internship_checkpoints
    WHERE application_id = p_application_id
    ORDER BY checkpoint_number
  LOOP
    IF r.status = 'completed' THEN
      CONTINUE;
    END IF;

    IF r.who_confirms = 'system' THEN
      CONTINUE;
    END IF;

    IF r.checkpoint_number = 1 AND NOT v_gate_ok THEN
      CONTINUE;
    END IF;

    v_prev_done := true;
    IF r.checkpoint_number > 1 THEN
      SELECT status = 'completed' INTO v_prev_done
      FROM internship_checkpoints
      WHERE application_id = p_application_id
        AND checkpoint_number = r.checkpoint_number - 1;
    END IF;

    IF r.checkpoint_number = 1 OR v_prev_done THEN
      IF r.status = 'locked' THEN
        UPDATE internship_checkpoints
        SET status = 'available', updated_at = now()
        WHERE id = r.id;
      END IF;
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

  IF NOT EXISTS (
    SELECT 1 FROM internship_checkpoints
    WHERE application_id = p_application_id AND status <> 'completed'
  ) THEN
    UPDATE activation_records
    SET status = 'internship_complete', updated_at = now()
    WHERE application_id = p_application_id
      AND status IN ('ready_for_activation', 'internship_active');
  END IF;
END;
$$;
