-- Module 4 — Activation (Phase 1): activation record + 7 internship checkpoints

CREATE TABLE IF NOT EXISTS public.activation_records (
  application_id uuid PRIMARY KEY REFERENCES public.applications(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'ready_for_activation'
    CHECK (status IN (
      'ready_for_activation',
      'internship_active',
      'internship_complete',
      'cleared',
      'on_hold',
      'rejected_activation'
    )),
  university_credit_required boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.internship_checkpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  checkpoint_number smallint NOT NULL CHECK (checkpoint_number BETWEEN 1 AND 7),
  phase text NOT NULL CHECK (phase IN ('onboarding', 'execution', 'review')),
  title text NOT NULL,
  who_confirms text NOT NULL CHECK (who_confirms IN ('company', 'system')),
  auto_source text CHECK (auto_source IN ('mentor_meeting_4', 'mentor_meeting_5', 'mentor_meeting_6')),
  status text NOT NULL DEFAULT 'locked'
    CHECK (status IN ('locked', 'available', 'completed')),
  event_date date,
  notes text,
  confirmed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (application_id, checkpoint_number)
);

CREATE INDEX IF NOT EXISTS internship_checkpoints_app_idx
  ON public.internship_checkpoints (application_id, checkpoint_number);

ALTER TABLE public.activation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_checkpoints ENABLE ROW LEVEL SECURITY;

-- activation_records
DROP POLICY IF EXISTS activation_records_select ON public.activation_records;
CREATE POLICY activation_records_select ON public.activation_records
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR public.employer_can_access_application(application_id)
    OR application_id IN (
      SELECT a.id FROM applications a
      JOIN candidates c ON c.id = a.candidate_id
      WHERE c.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS activation_records_write ON public.activation_records;
CREATE POLICY activation_records_write ON public.activation_records
  FOR ALL TO authenticated
  USING (public.is_admin() OR public.employer_can_access_application(application_id))
  WITH CHECK (public.is_admin() OR public.employer_can_access_application(application_id));

-- internship_checkpoints
DROP POLICY IF EXISTS internship_checkpoints_select ON public.internship_checkpoints;
CREATE POLICY internship_checkpoints_select ON public.internship_checkpoints
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR public.employer_can_access_application(application_id)
    OR application_id IN (
      SELECT a.id FROM applications a
      JOIN candidates c ON c.id = a.candidate_id
      WHERE c.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS internship_checkpoints_write ON public.internship_checkpoints;
CREATE POLICY internship_checkpoints_write ON public.internship_checkpoints
  FOR ALL TO authenticated
  USING (
    public.is_admin()
    OR (
      who_confirms = 'company'
      AND public.employer_can_access_application(application_id)
    )
  )
  WITH CHECK (
    public.is_admin()
    OR (
      who_confirms = 'company'
      AND public.employer_can_access_application(application_id)
    )
  );

-- System auto-complete (mentor bridge) via security definer
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

CREATE OR REPLACE FUNCTION public.refresh_internship_checkpoint_unlocks(p_application_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r record;
  v_prev_done boolean;
BEGIN
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

  -- Advance activation status
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

GRANT EXECUTE ON FUNCTION public.sync_mentor_internship_checkpoint(uuid, smallint) TO authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_internship_checkpoint_unlocks(uuid) TO authenticated;
