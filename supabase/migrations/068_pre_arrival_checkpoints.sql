-- Module 4 Phase 4: Pre-arrival employment — 6 fixed checkpoints

CREATE TABLE IF NOT EXISTS public.pre_arrival_checkpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  checkpoint_number smallint NOT NULL CHECK (checkpoint_number BETWEEN 1 AND 6),
  title text NOT NULL,
  who_confirms text NOT NULL CHECK (who_confirms IN ('company', 'candidate')),
  allow_reconfirm boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'locked'
    CHECK (status IN ('locked', 'available', 'completed')),
  event_date date,
  notes text,
  attachment_path text,
  confirmed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (application_id, checkpoint_number)
);

CREATE INDEX IF NOT EXISTS pre_arrival_checkpoints_app_idx
  ON public.pre_arrival_checkpoints (application_id, checkpoint_number);

ALTER TABLE public.pre_arrival_checkpoints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pre_arrival_checkpoints_select ON public.pre_arrival_checkpoints;
CREATE POLICY pre_arrival_checkpoints_select ON public.pre_arrival_checkpoints
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

DROP POLICY IF EXISTS pre_arrival_checkpoints_write ON public.pre_arrival_checkpoints;
CREATE POLICY pre_arrival_checkpoints_write ON public.pre_arrival_checkpoints
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

CREATE OR REPLACE FUNCTION public.refresh_pre_arrival_checkpoint_unlocks(p_application_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r record;
  v_prev_done boolean;
  v_cleared boolean;
BEGIN
  SELECT status = 'cleared' INTO v_cleared
  FROM activation_records
  WHERE application_id = p_application_id;

  IF NOT COALESCE(v_cleared, false) THEN
    RETURN;
  END IF;

  FOR r IN
    SELECT * FROM pre_arrival_checkpoints
    WHERE application_id = p_application_id
    ORDER BY checkpoint_number
  LOOP
    IF r.status = 'completed' AND NOT r.allow_reconfirm THEN
      CONTINUE;
    END IF;

    IF r.status = 'completed' AND r.allow_reconfirm THEN
      CONTINUE;
    END IF;

    v_prev_done := true;
    IF r.checkpoint_number > 1 THEN
      SELECT status = 'completed' INTO v_prev_done
      FROM pre_arrival_checkpoints
      WHERE application_id = p_application_id
        AND checkpoint_number = r.checkpoint_number - 1;
    END IF;

    IF r.checkpoint_number = 1 OR v_prev_done THEN
      IF r.status = 'locked' THEN
        UPDATE pre_arrival_checkpoints
        SET status = 'available', updated_at = now()
        WHERE id = r.id;
      END IF;
    END IF;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.refresh_pre_arrival_checkpoint_unlocks(uuid) TO authenticated;

-- Employer contract uploads: pre-arrival/{application_id}/...
DROP POLICY IF EXISTS documents_pre_arrival_employer_insert ON storage.objects;
CREATE POLICY documents_pre_arrival_employer_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = 'pre-arrival'
    AND public.employer_can_access_application(((storage.foldername(name))[2])::uuid)
  );

DROP POLICY IF EXISTS documents_pre_arrival_employer_read ON storage.objects;
CREATE POLICY documents_pre_arrival_employer_read ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = 'pre-arrival'
    AND (
      public.is_admin()
      OR public.employer_can_access_application(((storage.foldername(name))[2])::uuid)
    )
  );
