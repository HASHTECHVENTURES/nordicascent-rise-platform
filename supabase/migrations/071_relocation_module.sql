-- Module 5 — Relocation: 6 fixed checkpoints per application

ALTER TABLE public.activation_records
  ADD COLUMN IF NOT EXISTS relocation_completed_at timestamptz;

CREATE TABLE IF NOT EXISTS public.relocation_checkpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  checkpoint_number smallint NOT NULL CHECK (checkpoint_number BETWEEN 1 AND 6),
  title text NOT NULL,
  who_confirms text NOT NULL CHECK (who_confirms IN ('company', 'candidate')),
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

CREATE INDEX IF NOT EXISTS relocation_checkpoints_app_idx
  ON public.relocation_checkpoints (application_id, checkpoint_number);

ALTER TABLE public.relocation_checkpoints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS relocation_checkpoints_select ON public.relocation_checkpoints;
CREATE POLICY relocation_checkpoints_select ON public.relocation_checkpoints
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

DROP POLICY IF EXISTS relocation_checkpoints_write ON public.relocation_checkpoints;
CREATE POLICY relocation_checkpoints_write ON public.relocation_checkpoints
  FOR ALL TO authenticated
  USING (
    public.is_admin()
    OR (
      who_confirms = 'company'
      AND public.employer_can_access_application(application_id)
    )
    OR (
      who_confirms = 'candidate'
      AND application_id IN (
        SELECT a.id FROM applications a
        JOIN candidates c ON c.id = a.candidate_id
        WHERE c.profile_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    public.is_admin()
    OR (
      who_confirms = 'company'
      AND public.employer_can_access_application(application_id)
    )
    OR (
      who_confirms = 'candidate'
      AND application_id IN (
        SELECT a.id FROM applications a
        JOIN candidates c ON c.id = a.candidate_id
        WHERE c.profile_id = auth.uid()
      )
    )
  );

CREATE OR REPLACE FUNCTION public.refresh_relocation_checkpoint_unlocks(p_application_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r record;
  v_prev_done boolean;
  v_ready boolean;
BEGIN
  SELECT
    ar.pre_arrival_completed_at IS NOT NULL
    AND a.status IN ('relocation', 'onboarding', 'followup', 'journey_complete')
  INTO v_ready
  FROM activation_records ar
  JOIN applications a ON a.id = ar.application_id
  WHERE ar.application_id = p_application_id;

  IF NOT COALESCE(v_ready, false) THEN
    RETURN;
  END IF;

  FOR r IN
    SELECT * FROM relocation_checkpoints
    WHERE application_id = p_application_id
    ORDER BY checkpoint_number
  LOOP
    IF r.status = 'completed' THEN
      CONTINUE;
    END IF;

    v_prev_done := true;
    IF r.checkpoint_number > 1 THEN
      SELECT status = 'completed' INTO v_prev_done
      FROM relocation_checkpoints
      WHERE application_id = p_application_id
        AND checkpoint_number = r.checkpoint_number - 1;
    END IF;

    IF r.checkpoint_number = 1 OR v_prev_done THEN
      IF r.status = 'locked' THEN
        UPDATE relocation_checkpoints
        SET status = 'available', updated_at = now()
        WHERE id = r.id;
      END IF;
    END IF;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.refresh_relocation_checkpoint_unlocks(uuid) TO authenticated;
