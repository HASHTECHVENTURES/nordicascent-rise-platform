-- Module 5 rebuild: 10-step parallel coordination tracker (Lars spec)

ALTER TABLE public.activation_records
  ADD COLUMN IF NOT EXISTS final_clearance_date date,
  ADD COLUMN IF NOT EXISTS planned_arrival_date date,
  ADD COLUMN IF NOT EXISTS relocation_status text
    CHECK (relocation_status IS NULL OR relocation_status IN (
      'relocation_active', 'relocation_at_risk', 'relocation_blocked', 'arrived'
    ));

ALTER TABLE public.candidates
  ADD COLUMN IF NOT EXISTS family_relocating boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS family_member_count integer CHECK (family_member_count IS NULL OR family_member_count >= 0);

-- Replace sequential 6-checkpoint model with 10-step state model
DROP TABLE IF EXISTS public.relocation_checkpoints CASCADE;

CREATE TABLE public.relocation_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  step_number smallint NOT NULL CHECK (step_number BETWEEN 1 AND 10),
  title text NOT NULL,
  owner_layer text NOT NULL DEFAULT 'nordic_ascent'
    CHECK (owner_layer IN (
      'nordic_ascent', 'relocation_partner', 'language_partner', 'real_estate', 'none'
    )),
  state text NOT NULL DEFAULT 'on_track'
    CHECK (state IN ('on_track', 'at_risk', 'blocked', 'done')),
  event_date date,
  notes text,
  upload_path text,
  address text,
  contact_name text,
  target_due_date date,
  completed_at timestamptz,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (application_id, step_number)
);

CREATE INDEX IF NOT EXISTS relocation_steps_app_idx
  ON public.relocation_steps (application_id, step_number);

ALTER TABLE public.relocation_steps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS relocation_steps_select ON public.relocation_steps;
CREATE POLICY relocation_steps_select ON public.relocation_steps
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR public.employer_can_access_application(application_id)
    OR public.candidate_owns_application(application_id)
  );

-- Admin/coordinator write all; employers limited fields via app layer (pilot: admin primary)
DROP POLICY IF EXISTS relocation_steps_write ON public.relocation_steps;
CREATE POLICY relocation_steps_write ON public.relocation_steps
  FOR ALL TO authenticated
  USING (
    public.is_admin()
    OR public.employer_can_access_application(application_id)
  )
  WITH CHECK (
    public.is_admin()
    OR public.employer_can_access_application(application_id)
  );

-- Roll up derived relocation status from step states
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
BEGIN
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
        AND step_number <> 7  -- family step may be N/A
    ) INTO v_has_blocked;

    SELECT EXISTS (
      SELECT 1 FROM relocation_steps
      WHERE application_id = p_application_id AND state = 'at_risk'
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

GRANT EXECUTE ON FUNCTION public.sync_relocation_status(uuid) TO authenticated;

-- Auto-flag overdue steps as at_risk (never blocked — manual only)
CREATE OR REPLACE FUNCTION public.refresh_relocation_timeline(p_application_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clearance date;
  v_arrival date;
  r record;
  v_due date;
BEGIN
  SELECT final_clearance_date, planned_arrival_date
  INTO v_clearance, v_arrival
  FROM activation_records
  WHERE application_id = p_application_id;

  FOR r IN
    SELECT * FROM relocation_steps
    WHERE application_id = p_application_id
      AND state NOT IN ('done', 'blocked')
  LOOP
    v_due := r.target_due_date;

    -- Recalc target windows when missing or when we have anchors
    IF r.step_number = 1 THEN
      v_due := v_clearance;
    ELSIF r.step_number IN (2, 3, 4) AND v_clearance IS NOT NULL THEN
      IF r.step_number = 3 THEN
        v_due := v_clearance + 14; -- within 2 weeks of step 1 / clearance
      ELSE
        v_due := v_clearance + 21;
      END IF;
    ELSIF r.step_number = 5 AND v_arrival IS NOT NULL THEN
      v_due := v_arrival - 28; -- ~4 weeks before arrival (start of 4–8 week window)
    ELSIF r.step_number = 6 AND v_arrival IS NOT NULL THEN
      v_due := v_arrival;
    ELSIF r.step_number = 8 AND v_arrival IS NOT NULL THEN
      v_due := v_arrival - 21; -- 2–3 weeks before
    ELSIF r.step_number = 9 AND v_arrival IS NOT NULL THEN
      v_due := v_arrival - 14; -- 1–2 weeks before
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

GRANT EXECUTE ON FUNCTION public.refresh_relocation_timeline(uuid) TO authenticated;

-- Seed relocation CMS
UPDATE public.platform_settings
SET settings = COALESCE(settings, '{}'::jsonb) || jsonb_build_object(
  'relocationCms', jsonb_build_object(
    'step_1', 'Your employment contract is signed and relocation coordination has started.',
    'step_2', 'Your visa and immigration process is underway with our relocation partner.',
    'step_3', 'Your Norwegian A1 language course is starting.',
    'step_4', 'Pre-arrival preparation is in progress with the relocation partner.',
    'step_5', 'Housing arrangements are being made for your arrival.',
    'step_6', 'Administrative setup (D-number, tax, bank) is being prepared.',
    'step_7', 'Family support is being coordinated for your accompanying family members.',
    'step_8', 'You will be connected with a local buddy through INDONORD.',
    'step_9', 'Final arrival guide and employer onboarding toolkit are being prepared.',
    'step_10', 'Confirm your arrival in Norway — onboarding starts next.'
  )
),
updated_at = now()
WHERE id = 'default';

CREATE OR REPLACE FUNCTION public.get_relocation_cms()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(settings->'relocationCms', '{}'::jsonb)
  FROM platform_settings
  WHERE id = 'default';
$$;

GRANT EXECUTE ON FUNCTION public.get_relocation_cms() TO authenticated;

-- Step 10 done → ARRIVED → Module 6 (onboarding)
CREATE OR REPLACE FUNCTION public.complete_relocation_on_arrival(p_application_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_step10_done boolean;
  v_record activation_records%ROWTYPE;
  v_app applications%ROWTYPE;
  v_now timestamptz := now();
  v_profile_id uuid;
  v_job_title text;
  v_company_name text;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM relocation_steps
    WHERE application_id = p_application_id AND step_number = 10 AND state = 'done'
  ) INTO v_step10_done;

  IF NOT v_step10_done THEN
    RETURN false;
  END IF;

  SELECT * INTO v_record FROM activation_records WHERE application_id = p_application_id;
  IF NOT FOUND OR v_record.relocation_completed_at IS NOT NULL THEN
    RETURN false;
  END IF;

  SELECT * INTO v_app FROM applications WHERE id = p_application_id;
  IF NOT FOUND OR v_app.status NOT IN ('relocation', 'pre_arrival') THEN
    RETURN false;
  END IF;

  SELECT c.profile_id INTO v_profile_id
  FROM candidates c WHERE c.id = v_app.candidate_id;

  SELECT j.title, co.name INTO v_job_title, v_company_name
  FROM jobs j
  LEFT JOIN companies co ON co.id = j.company_id
  WHERE j.id = v_app.job_id;

  UPDATE activation_records
  SET
    relocation_completed_at = v_now,
    relocation_status = 'arrived',
    updated_at = v_now
  WHERE application_id = p_application_id;

  UPDATE candidate_stage_progress
  SET status = 'completed', completed_at = v_now
  WHERE candidate_id = v_app.candidate_id AND stage_id = 'relocation' AND status <> 'completed';

  UPDATE applications
  SET status = 'onboarding', updated_at = v_now
  WHERE id = p_application_id;

  UPDATE candidate_stage_progress
  SET status = 'active', started_at = COALESCE(started_at, v_now)
  WHERE candidate_id = v_app.candidate_id AND stage_id = 'onboarding';

  IF NOT FOUND THEN
    INSERT INTO candidate_stage_progress (candidate_id, stage_id, status, started_at)
    VALUES (v_app.candidate_id, 'onboarding', 'active', v_now);
  END IF;

  IF v_profile_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, body, type, metadata)
    VALUES (
      v_profile_id,
      'Welcome — you have arrived',
      'Arrival confirmed' ||
        CASE WHEN v_company_name IS NOT NULL THEN ' for ' || v_company_name ELSE '' END ||
        '. Onboarding is next.',
      'relocation_arrived',
      jsonb_build_object(
        'applicationId', p_application_id,
        'jobTitle', COALESCE(v_job_title, 'your role'),
        'companyName', v_company_name
      )
    );
  END IF;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.complete_relocation_on_arrival(uuid) TO authenticated;

DROP FUNCTION IF EXISTS public.refresh_relocation_checkpoint_unlocks(uuid);
DROP FUNCTION IF EXISTS public.complete_relocation_if_ready(uuid);
