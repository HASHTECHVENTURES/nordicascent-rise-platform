-- Module 6 — Onboarding: 9-step tracker + practical checklist (Lars spec)

ALTER TABLE public.activation_records
  ADD COLUMN IF NOT EXISTS arrival_date date,
  ADD COLUMN IF NOT EXISTS onboarding_status text
    CHECK (onboarding_status IS NULL OR onboarding_status IN (
      'onboarding_active', 'onboarding_flag', 'onboarding_complete'
    )),
  ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz;

CREATE TABLE IF NOT EXISTS public.onboarding_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  step_number smallint NOT NULL CHECK (step_number BETWEEN 1 AND 9),
  title text NOT NULL,
  responsible text NOT NULL DEFAULT 'nordic_ascent'
    CHECK (responsible IN (
      'candidate', 'nordic_ascent', 'relocation_partner', 'real_estate',
      'company', 'buddy', 'system'
    )),
  state text NOT NULL DEFAULT 'in_progress'
    CHECK (state IN ('in_progress', 'flag', 'done')),
  event_date date,
  event_time text,
  notes text,
  contact_name text,
  target_due_date date,
  flagged_at timestamptz,
  completed_at timestamptz,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (application_id, step_number)
);

CREATE INDEX IF NOT EXISTS onboarding_steps_app_idx
  ON public.onboarding_steps (application_id, step_number);

ALTER TABLE public.onboarding_steps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS onboarding_steps_select ON public.onboarding_steps;
CREATE POLICY onboarding_steps_select ON public.onboarding_steps
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR public.employer_can_access_application(application_id)
    OR public.candidate_owns_application(application_id)
  );

DROP POLICY IF EXISTS onboarding_steps_write ON public.onboarding_steps;
CREATE POLICY onboarding_steps_write ON public.onboarding_steps
  FOR ALL TO authenticated
  USING (
    public.is_admin()
    OR public.employer_can_access_application(application_id)
    OR (
      responsible = 'candidate'
      AND public.candidate_owns_application(application_id)
    )
  )
  WITH CHECK (
    public.is_admin()
    OR public.employer_can_access_application(application_id)
    OR (
      responsible = 'candidate'
      AND public.candidate_owns_application(application_id)
    )
  );

CREATE TABLE IF NOT EXISTS public.onboarding_checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  item_key text NOT NULL,
  title text NOT NULL,
  who_confirms text NOT NULL
    CHECK (who_confirms IN ('candidate', 'company', 'partner', 'nordic_ascent')),
  family_only boolean NOT NULL DEFAULT false,
  state text NOT NULL DEFAULT 'in_progress'
    CHECK (state IN ('in_progress', 'flag', 'done')),
  event_date date,
  notes text,
  target_due_date date,
  flagged_at timestamptz,
  completed_at timestamptz,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (application_id, item_key)
);

CREATE INDEX IF NOT EXISTS onboarding_checklist_app_idx
  ON public.onboarding_checklist_items (application_id, item_key);

ALTER TABLE public.onboarding_checklist_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS onboarding_checklist_select ON public.onboarding_checklist_items;
CREATE POLICY onboarding_checklist_select ON public.onboarding_checklist_items
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR public.employer_can_access_application(application_id)
    OR public.candidate_owns_application(application_id)
  );

DROP POLICY IF EXISTS onboarding_checklist_write ON public.onboarding_checklist_items;
CREATE POLICY onboarding_checklist_write ON public.onboarding_checklist_items
  FOR ALL TO authenticated
  USING (
    public.is_admin()
    OR (
      who_confirms = 'company'
      AND public.employer_can_access_application(application_id)
    )
    OR (
      who_confirms = 'candidate'
      AND public.candidate_owns_application(application_id)
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
      AND public.candidate_owns_application(application_id)
    )
  );

-- Seed steps + checklist for an application
CREATE OR REPLACE FUNCTION public.initialize_onboarding(p_application_id uuid, p_arrival_date date DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_arrival date;
  v_family boolean;
BEGIN
  SELECT COALESCE(p_arrival_date, ar.planned_arrival_date, CURRENT_DATE)
  INTO v_arrival
  FROM activation_records ar
  WHERE ar.application_id = p_application_id;

  IF v_arrival IS NULL THEN
    v_arrival := CURRENT_DATE;
  END IF;

  SELECT COALESCE(c.family_relocating, false) INTO v_family
  FROM applications a
  JOIN candidates c ON c.id = a.candidate_id
  WHERE a.id = p_application_id;

  UPDATE activation_records
  SET
    arrival_date = v_arrival,
    onboarding_status = COALESCE(onboarding_status, 'onboarding_active'),
    updated_at = now()
  WHERE application_id = p_application_id;

  INSERT INTO onboarding_steps (application_id, step_number, title, responsible, state, event_date, completed_at, target_due_date)
  VALUES
    (p_application_id, 1, 'Arrival in Norway', 'candidate', 'done', v_arrival, now(), v_arrival),
    (p_application_id, 2, 'Airport pickup and transport', 'nordic_ascent', 'in_progress', NULL, NULL, v_arrival),
    (p_application_id, 3, 'Housing move-in confirmed', 'candidate', 'in_progress', NULL, NULL, v_arrival),
    (p_application_id, 4, 'Administrative completion', 'relocation_partner', 'in_progress', NULL, NULL, v_arrival + 7),
    (p_application_id, 5, 'Practical checklist tracked', 'nordic_ascent', 'in_progress', NULL, NULL, v_arrival + 7),
    (p_application_id, 6, 'Workplace onboarding begins', 'company', 'in_progress', NULL, NULL, v_arrival + 14),
    (p_application_id, 7, 'Buddy connection activated locally', 'buddy', 'in_progress', NULL, NULL, v_arrival + 14),
    (p_application_id, 8, 'Cultural and social adjustment support', 'buddy', 'in_progress', NULL, NULL, v_arrival + 28),
    (p_application_id, 9, 'Onboarding completion', 'system', 'in_progress', NULL, NULL, v_arrival + 28)
  ON CONFLICT (application_id, step_number) DO NOTHING;

  INSERT INTO onboarding_checklist_items (application_id, item_key, title, who_confirms, family_only, target_due_date)
  VALUES
    (p_application_id, 'housing', 'Housing — keys received, basic setup working', 'candidate', false, v_arrival + 2),
    (p_application_id, 'phone_sim', 'Phone / SIM card active', 'candidate', false, v_arrival + 7),
    (p_application_id, 'bank', 'Bank account open and accessible', 'candidate', false, v_arrival + 14),
    (p_application_id, 'd_number', 'D-number confirmed', 'partner', false, v_arrival + 14),
    (p_application_id, 'tax_card', 'Tax card activated', 'partner', false, v_arrival + 14),
    (p_application_id, 'transport', 'Transport sorted — commute understood', 'candidate', false, v_arrival + 7),
    (p_application_id, 'workplace_access', 'Workplace access — building, systems, accounts', 'company', false, v_arrival + 7),
    (p_application_id, 'norwegian_course', 'Norwegian course — local continuation confirmed', 'candidate', false, v_arrival + 14),
    (p_application_id, 'doctor', 'Doctor / fastlege registered', 'candidate', false, v_arrival + 28),
    (p_application_id, 'family', 'Family items — school, kindergarten', 'candidate', true, v_arrival + 28)
  ON CONFLICT (application_id, item_key) DO NOTHING;

  -- Hide family item from timeline if not relocating (keep row but skip flagging via refresh)
  PERFORM public.refresh_onboarding_timeline(p_application_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.initialize_onboarding(uuid, date) TO authenticated;

CREATE OR REPLACE FUNCTION public.sync_onboarding_status(p_application_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status text;
  v_family boolean;
  v_has_flag boolean;
  v_checklist_done boolean;
  v_step6_done boolean;
  v_gating_done boolean;
  v_complete boolean;
BEGIN
  SELECT COALESCE(c.family_relocating, false) INTO v_family
  FROM applications a
  JOIN candidates c ON c.id = a.candidate_id
  WHERE a.id = p_application_id;

  SELECT EXISTS (
    SELECT 1 FROM onboarding_steps
    WHERE application_id = p_application_id AND state = 'flag'
      AND step_number <> 8 AND step_number <> 9
  ) OR EXISTS (
    SELECT 1 FROM onboarding_checklist_items
    WHERE application_id = p_application_id AND state = 'flag'
      AND (v_family OR NOT family_only)
  ) INTO v_has_flag;

  SELECT NOT EXISTS (
    SELECT 1 FROM onboarding_checklist_items
    WHERE application_id = p_application_id
      AND state <> 'done'
      AND (v_family OR NOT family_only)
  ) INTO v_checklist_done;

  SELECT EXISTS (
    SELECT 1 FROM onboarding_steps
    WHERE application_id = p_application_id AND step_number = 6 AND state = 'done'
  ) INTO v_step6_done;

  -- Gating steps 2–4, 7 done; step 8 never gates; step 5 follows checklist
  SELECT NOT EXISTS (
    SELECT 1 FROM onboarding_steps
    WHERE application_id = p_application_id
      AND step_number IN (2, 3, 4, 7)
      AND state <> 'done'
  ) INTO v_gating_done;

  v_complete := v_checklist_done AND v_step6_done AND v_gating_done AND NOT v_has_flag;

  IF v_complete THEN
    v_status := 'onboarding_complete';
  ELSIF v_has_flag THEN
    v_status := 'onboarding_flag';
  ELSE
    v_status := 'onboarding_active';
  END IF;

  UPDATE activation_records
  SET onboarding_status = v_status, updated_at = now()
  WHERE application_id = p_application_id;

  -- Sync step 5 from checklist progress
  IF v_checklist_done THEN
    UPDATE onboarding_steps
    SET state = 'done', completed_at = COALESCE(completed_at, now()), updated_at = now()
    WHERE application_id = p_application_id AND step_number = 5 AND state <> 'done';
  ELSIF v_has_flag AND EXISTS (
    SELECT 1 FROM onboarding_checklist_items
    WHERE application_id = p_application_id AND state = 'flag'
      AND (v_family OR NOT family_only)
  ) THEN
    UPDATE onboarding_steps
    SET state = 'flag', flagged_at = COALESCE(flagged_at, now()), updated_at = now()
    WHERE application_id = p_application_id AND step_number = 5 AND state = 'in_progress';
  END IF;

  RETURN v_status;
END;
$$;

GRANT EXECUTE ON FUNCTION public.sync_onboarding_status(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.refresh_onboarding_timeline(p_application_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_arrival date;
  v_family boolean;
  r record;
  c record;
BEGIN
  SELECT ar.arrival_date, COALESCE(cand.family_relocating, false)
  INTO v_arrival, v_family
  FROM activation_records ar
  JOIN applications a ON a.id = ar.application_id
  JOIN candidates cand ON cand.id = a.candidate_id
  WHERE ar.application_id = p_application_id;

  IF v_arrival IS NULL THEN
    RETURN;
  END IF;

  -- Recalc step windows (skip step 8 auto-flag — ongoing support)
  FOR r IN
    SELECT * FROM onboarding_steps
    WHERE application_id = p_application_id
      AND state NOT IN ('done')
      AND step_number NOT IN (1, 8, 9)
  LOOP
    UPDATE onboarding_steps s SET
      target_due_date = CASE s.step_number
        WHEN 2 THEN v_arrival
        WHEN 3 THEN v_arrival
        WHEN 4 THEN v_arrival + 7
        WHEN 5 THEN v_arrival + 7
        WHEN 6 THEN v_arrival + 14
        WHEN 7 THEN v_arrival + 14
        ELSE s.target_due_date
      END,
      updated_at = now()
    WHERE s.id = r.id;

    SELECT * INTO r FROM onboarding_steps WHERE id = r.id;

    IF r.target_due_date IS NOT NULL AND r.target_due_date < CURRENT_DATE AND r.state = 'in_progress' THEN
      UPDATE onboarding_steps
      SET state = 'flag', flagged_at = COALESCE(flagged_at, now()), updated_at = now()
      WHERE id = r.id;
    END IF;
  END LOOP;

  FOR c IN
    SELECT * FROM onboarding_checklist_items
    WHERE application_id = p_application_id
      AND state NOT IN ('done')
      AND (v_family OR NOT family_only)
  LOOP
    IF c.target_due_date IS NOT NULL AND c.target_due_date < CURRENT_DATE AND c.state = 'in_progress' THEN
      UPDATE onboarding_checklist_items
      SET state = 'flag', flagged_at = COALESCE(flagged_at, now()), updated_at = now()
      WHERE id = c.id;
    END IF;
  END LOOP;

  PERFORM public.sync_onboarding_status(p_application_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.refresh_onboarding_timeline(uuid) TO authenticated;

-- Auto-complete → Module 7 when criteria met
CREATE OR REPLACE FUNCTION public.complete_onboarding_if_ready(p_application_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status text;
  v_record activation_records%ROWTYPE;
  v_app applications%ROWTYPE;
  v_now timestamptz := now();
  v_profile_id uuid;
  v_job_title text;
  v_company_name text;
BEGIN
  v_status := public.sync_onboarding_status(p_application_id);
  IF v_status <> 'onboarding_complete' THEN
    RETURN false;
  END IF;

  SELECT * INTO v_record FROM activation_records WHERE application_id = p_application_id;
  IF NOT FOUND OR v_record.onboarding_completed_at IS NOT NULL THEN
    RETURN false;
  END IF;

  SELECT * INTO v_app FROM applications WHERE id = p_application_id;
  IF NOT FOUND OR v_app.status NOT IN ('onboarding') THEN
    RETURN false;
  END IF;

  SELECT c.profile_id INTO v_profile_id FROM candidates c WHERE c.id = v_app.candidate_id;
  SELECT j.title, co.name INTO v_job_title, v_company_name
  FROM jobs j LEFT JOIN companies co ON co.id = j.company_id WHERE j.id = v_app.job_id;

  UPDATE onboarding_steps
  SET state = 'done', completed_at = COALESCE(completed_at, v_now), updated_at = v_now
  WHERE application_id = p_application_id AND step_number = 9;

  UPDATE activation_records
  SET
    onboarding_completed_at = v_now,
    onboarding_status = 'onboarding_complete',
    updated_at = v_now
  WHERE application_id = p_application_id;

  UPDATE candidate_stage_progress
  SET status = 'completed', completed_at = v_now
  WHERE candidate_id = v_app.candidate_id AND stage_id = 'onboarding' AND status <> 'completed';

  UPDATE applications SET status = 'followup', updated_at = v_now WHERE id = p_application_id;

  UPDATE candidate_stage_progress
  SET status = 'active', started_at = COALESCE(started_at, v_now)
  WHERE candidate_id = v_app.candidate_id AND stage_id = 'followup';

  IF NOT FOUND THEN
    INSERT INTO candidate_stage_progress (candidate_id, stage_id, status, started_at)
    VALUES (v_app.candidate_id, 'followup', 'active', v_now);
  END IF;

  IF v_profile_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, body, type, metadata)
    VALUES (
      v_profile_id,
      'Onboarding complete',
      'Your first weeks are complete' ||
        CASE WHEN v_company_name IS NOT NULL THEN ' at ' || v_company_name ELSE '' END ||
        '. Follow-up support is next.',
      'onboarding_complete',
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

GRANT EXECUTE ON FUNCTION public.complete_onboarding_if_ready(uuid) TO authenticated;

-- Extend M5 arrival RPC to initialize Module 6
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
  v_arrival date;
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

  -- Prefer step 10 event_date, else planned arrival, else today
  SELECT COALESCE(
    (SELECT event_date FROM relocation_steps WHERE application_id = p_application_id AND step_number = 10),
    v_record.planned_arrival_date,
    CURRENT_DATE
  ) INTO v_arrival;

  UPDATE activation_records
  SET
    relocation_completed_at = v_now,
    relocation_status = 'arrived',
    arrival_date = v_arrival,
    onboarding_status = 'onboarding_active',
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

  PERFORM public.initialize_onboarding(p_application_id, v_arrival);

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

-- CMS
UPDATE public.platform_settings
SET settings = COALESCE(settings, '{}'::jsonb) || jsonb_build_object(
  'onboardingCms', jsonb_build_object(
    'step_1', 'You have arrived in Norway. Welcome — your first weeks of settling in start now.',
    'step_2', 'Airport pickup and transport to housing is being coordinated.',
    'step_3', 'Confirm you have moved into your housing and note any issues.',
    'step_4', 'Administrative items on Norwegian soil (D-number, tax, bank) are being completed.',
    'step_5', 'Work through your practical checklist — housing, SIM, bank, commute, and more.',
    'step_6', 'Your company is starting workplace onboarding — introductions, systems, and role.',
    'step_7', 'Your local buddy through INDONORD is being activated.',
    'step_8', 'Cultural and social adjustment support continues through your first month.',
    'step_9', 'When everything is in place, follow-up support opens automatically.',
    'contact_directory', E'Who to contact\n• Housing / keys — Relocation / real estate partner\n• Visa / D-number / tax / bank — Relocation partner\n• Workplace access & role — Your company HR / team lead\n• Buddy / local life — INDONORD buddy\n• Anything stuck — Nordic Ascent (we follow up within 24 hours)'
  )
),
updated_at = now()
WHERE id = 'default';

CREATE OR REPLACE FUNCTION public.get_onboarding_cms()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(settings->'onboardingCms', '{}'::jsonb)
  FROM platform_settings
  WHERE id = 'default';
$$;

GRANT EXECUTE ON FUNCTION public.get_onboarding_cms() TO authenticated;
