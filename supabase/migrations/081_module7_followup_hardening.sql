-- Module 7 hardening: ARRIVED handoff in migrations, RPC auth, answers RLS,
-- protect internal followup fields from employer writes, seed CMS defaults.

-- 1) Persist ARRIVED → initialize_followup (matches live DB)
CREATE OR REPLACE FUNCTION public.complete_relocation_on_arrival(p_application_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

  IF NOT v_step10_done THEN RETURN false; END IF;

  SELECT * INTO v_record FROM activation_records WHERE application_id = p_application_id;
  IF NOT FOUND OR v_record.relocation_completed_at IS NOT NULL THEN RETURN false; END IF;

  SELECT * INTO v_app FROM applications WHERE id = p_application_id;
  IF NOT FOUND OR v_app.status NOT IN ('relocation', 'pre_arrival') THEN RETURN false; END IF;

  SELECT c.profile_id INTO v_profile_id FROM candidates c WHERE c.id = v_app.candidate_id;
  SELECT j.title, co.name INTO v_job_title, v_company_name
  FROM jobs j LEFT JOIN companies co ON co.id = j.company_id WHERE j.id = v_app.job_id;

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
    followup_status = 'followup_active',
    updated_at = v_now
  WHERE application_id = p_application_id;

  UPDATE candidate_stage_progress
  SET status = 'completed', completed_at = v_now
  WHERE candidate_id = v_app.candidate_id AND stage_id = 'relocation' AND status <> 'completed';

  UPDATE applications SET status = 'onboarding', updated_at = v_now WHERE id = p_application_id;

  UPDATE candidate_stage_progress
  SET status = 'active', started_at = COALESCE(started_at, v_now)
  WHERE candidate_id = v_app.candidate_id AND stage_id = 'onboarding';

  IF NOT FOUND THEN
    INSERT INTO candidate_stage_progress (candidate_id, stage_id, status, started_at)
    VALUES (v_app.candidate_id, 'onboarding', 'active', v_now);
  END IF;

  PERFORM public.initialize_onboarding(p_application_id, v_arrival);
  PERFORM public.initialize_followup(p_application_id, v_arrival);

  IF v_profile_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, body, type, metadata)
    VALUES (
      v_profile_id,
      'Welcome — you have arrived',
      'Arrival confirmed' ||
        CASE WHEN v_company_name IS NOT NULL THEN ' for ' || v_company_name ELSE '' END ||
        '. Onboarding and follow-up support are now underway.',
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
$function$;

-- Shared access check for followup RPCs
CREATE OR REPLACE FUNCTION public.can_access_followup_application(p_application_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    public.is_admin()
    OR public.employer_can_access_application(p_application_id)
    OR public.candidate_owns_application(p_application_id);
$function$;

GRANT EXECUTE ON FUNCTION public.can_access_followup_application(uuid) TO authenticated;

-- 2) Auth guards on SECURITY DEFINER mutators
CREATE OR REPLACE FUNCTION public.sync_followup_status(p_application_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_status text;
  v_has_flag boolean;
  v_has_watch boolean;
  v_at_risk boolean;
  v_complete boolean;
BEGIN
  IF NOT public.can_access_followup_application(p_application_id) THEN
    RAISE EXCEPTION 'not allowed';
  END IF;

  SELECT COALESCE(at_risk_retention, false) INTO v_at_risk
  FROM activation_records WHERE application_id = p_application_id;

  SELECT EXISTS (
    SELECT 1 FROM followup_meeting_logs
    WHERE application_id = p_application_id AND state = 'flag' AND logged_at IS NOT NULL
  ) INTO v_has_flag;

  SELECT EXISTS (
    SELECT 1 FROM followup_meeting_logs
    WHERE application_id = p_application_id AND state = 'watch' AND logged_at IS NOT NULL
  ) INTO v_has_watch;

  SELECT
    EXISTS (SELECT 1 FROM followup_touchpoints WHERE application_id = p_application_id AND month_number = 6)
    AND (
      SELECT count(*) FROM followup_meeting_logs ml
      JOIN followup_touchpoints tp ON tp.id = ml.touchpoint_id
      WHERE tp.application_id = p_application_id AND tp.month_number = 6 AND ml.logged_at IS NOT NULL
    ) >= 2
    AND (
      SELECT count(*) FROM followup_questionnaires
      WHERE application_id = p_application_id AND month_number = 6 AND status = 'submitted'
    ) >= 2
  INTO v_complete;

  IF v_at_risk THEN
    v_status := 'at_risk_retention';
  ELSIF v_complete THEN
    v_status := 'followup_complete';
  ELSIF v_has_flag THEN
    v_status := 'followup_flag';
  ELSIF v_has_watch THEN
    v_status := 'followup_watch';
  ELSE
    v_status := 'followup_active';
  END IF;

  UPDATE activation_records
  SET followup_status = v_status, updated_at = now()
  WHERE application_id = p_application_id;

  RETURN v_status;
END;
$function$;

CREATE OR REPLACE FUNCTION public.refresh_followup_questionnaires(p_application_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.can_access_followup_application(p_application_id) THEN
    RAISE EXCEPTION 'not allowed';
  END IF;

  UPDATE followup_questionnaires
  SET status = 'open', updated_at = now()
  WHERE application_id = p_application_id
    AND status = 'pending'
    AND opens_at IS NOT NULL
    AND opens_at <= CURRENT_DATE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.initialize_followup(p_application_id uuid, p_arrival_date date DEFAULT NULL::date)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_arrival date;
  v_tp1 uuid; v_tp2 uuid; v_tp3 uuid; v_tp6 uuid;
  v_candidate_id uuid;
BEGIN
  IF NOT public.can_access_followup_application(p_application_id) THEN
    RAISE EXCEPTION 'not allowed';
  END IF;

  SELECT COALESCE(p_arrival_date, ar.arrival_date, ar.planned_arrival_date, CURRENT_DATE)
  INTO v_arrival
  FROM activation_records ar WHERE ar.application_id = p_application_id;

  IF v_arrival IS NULL THEN v_arrival := CURRENT_DATE; END IF;

  UPDATE activation_records
  SET followup_status = COALESCE(followup_status, 'followup_active'), updated_at = now()
  WHERE application_id = p_application_id;

  INSERT INTO followup_touchpoints (application_id, month_number, title, focus, target_due_date, window_end, questionnaire_opens_at)
  VALUES
    (p_application_id, 1, '1 month — Settling in', 'Practical basics and daily life', v_arrival + 28, v_arrival + 35, NULL),
    (p_application_id, 2, '2 months — Work integration', 'Honeymoon ending; early friction', v_arrival + 56, v_arrival + 63, NULL),
    (p_application_id, 3, '3 months — First assessment', 'First real checkpoint', v_arrival + 84, v_arrival + 91, v_arrival + 77),
    (p_application_id, 6, '6 months — Integration review', 'Validate selection and integration', v_arrival + 168, v_arrival + 175, v_arrival + 161)
  ON CONFLICT (application_id, month_number) DO NOTHING;

  SELECT id INTO v_tp1 FROM followup_touchpoints WHERE application_id = p_application_id AND month_number = 1;
  SELECT id INTO v_tp2 FROM followup_touchpoints WHERE application_id = p_application_id AND month_number = 2;
  SELECT id INTO v_tp3 FROM followup_touchpoints WHERE application_id = p_application_id AND month_number = 3;
  SELECT id INTO v_tp6 FROM followup_touchpoints WHERE application_id = p_application_id AND month_number = 6;

  INSERT INTO followup_meeting_logs (touchpoint_id, application_id, party, state)
  VALUES
    (v_tp1, p_application_id, 'candidate', 'on_track'),
    (v_tp1, p_application_id, 'company', 'on_track'),
    (v_tp2, p_application_id, 'candidate', 'on_track'),
    (v_tp2, p_application_id, 'company', 'on_track'),
    (v_tp3, p_application_id, 'candidate', 'on_track'),
    (v_tp3, p_application_id, 'company', 'on_track'),
    (v_tp6, p_application_id, 'candidate', 'on_track'),
    (v_tp6, p_application_id, 'company', 'on_track')
  ON CONFLICT (touchpoint_id, party) DO NOTHING;

  INSERT INTO followup_questionnaires (application_id, touchpoint_id, month_number, party, status, opens_at)
  VALUES
    (p_application_id, v_tp3, 3, 'candidate', 'pending', v_arrival + 77),
    (p_application_id, v_tp3, 3, 'company', 'pending', v_arrival + 77),
    (p_application_id, v_tp6, 6, 'candidate', 'pending', v_arrival + 161),
    (p_application_id, v_tp6, 6, 'company', 'pending', v_arrival + 161)
  ON CONFLICT (application_id, month_number, party) DO NOTHING;

  UPDATE followup_questionnaires
  SET status = 'open', updated_at = now()
  WHERE application_id = p_application_id
    AND status = 'pending'
    AND opens_at IS NOT NULL
    AND opens_at <= CURRENT_DATE;

  SELECT candidate_id INTO v_candidate_id FROM applications WHERE id = p_application_id;
  IF v_candidate_id IS NOT NULL THEN
    UPDATE candidate_stage_progress
    SET status = CASE WHEN status = 'completed' THEN status ELSE 'active' END,
        started_at = COALESCE(started_at, now())
    WHERE candidate_id = v_candidate_id AND stage_id = 'followup';

    IF NOT FOUND THEN
      INSERT INTO candidate_stage_progress (candidate_id, stage_id, status, started_at)
      VALUES (v_candidate_id, 'followup', 'active', now())
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  PERFORM public.sync_followup_status(p_application_id);
END;
$function$;

CREATE OR REPLACE FUNCTION public.complete_followup_if_ready(p_application_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_record activation_records%ROWTYPE;
  v_app applications%ROWTYPE;
  v_now timestamptz := now();
  v_profile_id uuid;
  v_ready boolean;
BEGIN
  IF NOT public.can_access_followup_application(p_application_id) THEN
    RAISE EXCEPTION 'not allowed';
  END IF;

  PERFORM public.refresh_followup_questionnaires(p_application_id);
  PERFORM public.sync_followup_status(p_application_id);

  SELECT
    (SELECT count(*) FROM followup_meeting_logs ml
     JOIN followup_touchpoints tp ON tp.id = ml.touchpoint_id
     WHERE tp.application_id = p_application_id AND tp.month_number = 6 AND ml.logged_at IS NOT NULL) >= 2
    AND (SELECT count(*) FROM followup_questionnaires
         WHERE application_id = p_application_id AND month_number = 6 AND status = 'submitted') >= 2
  INTO v_ready;

  IF NOT v_ready THEN RETURN false; END IF;

  SELECT * INTO v_record FROM activation_records WHERE application_id = p_application_id;
  IF NOT FOUND OR v_record.followup_completed_at IS NOT NULL THEN RETURN false; END IF;

  SELECT * INTO v_app FROM applications WHERE id = p_application_id;
  IF NOT FOUND OR v_app.status NOT IN ('followup', 'onboarding') THEN RETURN false; END IF;

  SELECT c.profile_id INTO v_profile_id FROM candidates c WHERE c.id = v_app.candidate_id;

  UPDATE activation_records
  SET
    followup_completed_at = v_now,
    followup_status = CASE WHEN COALESCE(at_risk_retention, false) THEN 'at_risk_retention' ELSE 'followup_complete' END,
    updated_at = v_now
  WHERE application_id = p_application_id;

  UPDATE candidate_stage_progress
  SET status = 'completed', completed_at = v_now
  WHERE candidate_id = v_app.candidate_id AND stage_id = 'followup' AND status <> 'completed';

  UPDATE applications SET status = 'journey_complete', updated_at = v_now WHERE id = p_application_id;

  IF v_profile_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, body, type, metadata)
    VALUES (
      v_profile_id,
      'Follow-up period complete',
      'Your six-month follow-up with Nordic Ascent is complete. Your journey record remains available.',
      'followup_complete',
      jsonb_build_object('applicationId', p_application_id)
    );
  END IF;

  RETURN true;
END;
$function$;

-- 3) Tighten followup_answers write: no INSERT/UPDATE after submitted; admin-only DELETE
DROP POLICY IF EXISTS followup_answers_write ON public.followup_answers;
DROP POLICY IF EXISTS followup_answers_insert ON public.followup_answers;
DROP POLICY IF EXISTS followup_answers_update ON public.followup_answers;
CREATE POLICY followup_answers_insert ON public.followup_answers
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM followup_questionnaires q
      WHERE q.id = questionnaire_id
        AND q.party = 'company'
        AND public.employer_can_access_application(q.application_id)
        AND q.status IN ('open', 'pending')
    )
    OR EXISTS (
      SELECT 1 FROM followup_questionnaires q
      WHERE q.id = questionnaire_id
        AND q.party = 'candidate'
        AND public.candidate_owns_application(q.application_id)
        AND q.status IN ('open', 'pending')
    )
  );

CREATE POLICY followup_answers_update ON public.followup_answers
  FOR UPDATE TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM followup_questionnaires q
      WHERE q.id = questionnaire_id
        AND q.party = 'company'
        AND public.employer_can_access_application(q.application_id)
        AND q.status IN ('open', 'pending')
    )
    OR EXISTS (
      SELECT 1 FROM followup_questionnaires q
      WHERE q.id = questionnaire_id
        AND q.party = 'candidate'
        AND public.candidate_owns_application(q.application_id)
        AND q.status IN ('open', 'pending')
    )
  )
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM followup_questionnaires q
      WHERE q.id = questionnaire_id
        AND q.party = 'company'
        AND public.employer_can_access_application(q.application_id)
        AND q.status IN ('open', 'pending')
    )
    OR EXISTS (
      SELECT 1 FROM followup_questionnaires q
      WHERE q.id = questionnaire_id
        AND q.party = 'candidate'
        AND public.candidate_owns_application(q.application_id)
        AND q.status IN ('open', 'pending')
    )
  );

DROP POLICY IF EXISTS followup_answers_delete ON public.followup_answers;
CREATE POLICY followup_answers_delete ON public.followup_answers
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- 4) Protect followup internal fields: require access; non-admin cannot clear retention
CREATE OR REPLACE FUNCTION public.protect_followup_internal_fields()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF (
    NEW.followup_status IS DISTINCT FROM OLD.followup_status
    OR NEW.at_risk_retention IS DISTINCT FROM OLD.at_risk_retention
    OR NEW.at_risk_retention_at IS DISTINCT FROM OLD.at_risk_retention_at
    OR NEW.followup_completed_at IS DISTINCT FROM OLD.followup_completed_at
  ) AND NOT public.can_access_followup_application(NEW.application_id) THEN
    RAISE EXCEPTION 'not allowed to change followup internal fields';
  END IF;

  -- Non-admin with access may set retention risk, but not clear it
  IF COALESCE(OLD.at_risk_retention, false) IS TRUE
     AND COALESCE(NEW.at_risk_retention, false) IS NOT TRUE THEN
    RAISE EXCEPTION 'not allowed to clear at_risk_retention';
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_protect_followup_internal ON public.activation_records;
CREATE TRIGGER trg_protect_followup_internal
  BEFORE UPDATE ON public.activation_records
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_followup_internal_fields();

-- 5) Mask internal followup columns for non-admin SELECT
CREATE OR REPLACE FUNCTION public.get_activation_record_for_viewer(p_application_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_row activation_records%ROWTYPE;
  v_out jsonb;
BEGIN
  IF NOT (
    public.is_admin()
    OR public.employer_can_access_application(p_application_id)
    OR public.candidate_owns_application(p_application_id)
  ) THEN
    RAISE EXCEPTION 'not allowed';
  END IF;

  SELECT * INTO v_row FROM activation_records WHERE application_id = p_application_id;
  IF NOT FOUND THEN RETURN NULL; END IF;

  v_out := to_jsonb(v_row);

  IF NOT public.is_admin() THEN
    v_out := v_out - 'followup_status' - 'at_risk_retention' - 'at_risk_retention_at';
  END IF;

  RETURN v_out;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.get_activation_record_for_viewer(uuid) TO authenticated;

-- 6) Ensure followup CMS keys exist in platform_settings (code defaults fill empty objects)
UPDATE public.platform_settings
SET
  settings = COALESCE(settings, '{}'::jsonb)
    || CASE WHEN settings ? 'followupTopicsCms' THEN '{}'::jsonb
            ELSE jsonb_build_object('followupTopicsCms', '{}'::jsonb) END
    || CASE WHEN settings ? 'followupQuestionnaireCms' THEN '{}'::jsonb
            ELSE jsonb_build_object('followupQuestionnaireCms', '{}'::jsonb) END,
  updated_at = now()
WHERE id = 'default';
