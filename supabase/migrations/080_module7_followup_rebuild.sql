-- Module 7 — Follow-up: touchpoints, meeting logs, questionnaires, add-ons

ALTER TABLE public.activation_records
  ADD COLUMN IF NOT EXISTS followup_status text
    CHECK (followup_status IS NULL OR followup_status IN (
      'followup_active', 'followup_watch', 'followup_flag',
      'followup_complete', 'at_risk_retention'
    )),
  ADD COLUMN IF NOT EXISTS at_risk_retention boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS at_risk_retention_at timestamptz,
  ADD COLUMN IF NOT EXISTS followup_completed_at timestamptz;

-- 1 / 2 / 3 / 6 month touchpoints
CREATE TABLE IF NOT EXISTS public.followup_touchpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  month_number smallint NOT NULL CHECK (month_number IN (1, 2, 3, 6)),
  title text NOT NULL,
  focus text,
  target_due_date date NOT NULL,
  window_end date NOT NULL,
  questionnaire_opens_at date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (application_id, month_number)
);

CREATE INDEX IF NOT EXISTS followup_touchpoints_app_idx
  ON public.followup_touchpoints (application_id, month_number);

ALTER TABLE public.followup_touchpoints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS followup_touchpoints_select ON public.followup_touchpoints;
CREATE POLICY followup_touchpoints_select ON public.followup_touchpoints
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR public.employer_can_access_application(application_id)
    OR public.candidate_owns_application(application_id)
  );

DROP POLICY IF EXISTS followup_touchpoints_write ON public.followup_touchpoints;
CREATE POLICY followup_touchpoints_write ON public.followup_touchpoints
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Separate candidate + company meeting logs per touchpoint
CREATE TABLE IF NOT EXISTS public.followup_meeting_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  touchpoint_id uuid NOT NULL REFERENCES public.followup_touchpoints(id) ON DELETE CASCADE,
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  party text NOT NULL CHECK (party IN ('candidate', 'company')),
  state text NOT NULL DEFAULT 'on_track'
    CHECK (state IN ('on_track', 'watch', 'flag')),
  meeting_date date,
  notes text,
  confidential_notes text,
  follow_up_actions text,
  logged_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  logged_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (touchpoint_id, party)
);

CREATE INDEX IF NOT EXISTS followup_meeting_logs_app_idx
  ON public.followup_meeting_logs (application_id, party);

ALTER TABLE public.followup_meeting_logs ENABLE ROW LEVEL SECURITY;

-- Admin full; candidate/company cannot read meeting notes (RLS-hard)
DROP POLICY IF EXISTS followup_meeting_logs_select ON public.followup_meeting_logs;
CREATE POLICY followup_meeting_logs_select ON public.followup_meeting_logs
  FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS followup_meeting_logs_write ON public.followup_meeting_logs;
CREATE POLICY followup_meeting_logs_write ON public.followup_meeting_logs
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Questionnaire instances (3mo / 6mo × candidate / company)
CREATE TABLE IF NOT EXISTS public.followup_questionnaires (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  touchpoint_id uuid REFERENCES public.followup_touchpoints(id) ON DELETE SET NULL,
  month_number smallint NOT NULL CHECK (month_number IN (3, 6)),
  party text NOT NULL CHECK (party IN ('candidate', 'company')),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'open', 'submitted')),
  opens_at date,
  submitted_at timestamptz,
  submitted_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (application_id, month_number, party)
);

CREATE INDEX IF NOT EXISTS followup_questionnaires_app_idx
  ON public.followup_questionnaires (application_id, month_number, party);

ALTER TABLE public.followup_questionnaires ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS followup_questionnaires_select ON public.followup_questionnaires;
CREATE POLICY followup_questionnaires_select ON public.followup_questionnaires
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR (
      party = 'company'
      AND public.employer_can_access_application(application_id)
    )
    OR (
      party = 'candidate'
      AND public.candidate_owns_application(application_id)
    )
  );

DROP POLICY IF EXISTS followup_questionnaires_write ON public.followup_questionnaires;
CREATE POLICY followup_questionnaires_write ON public.followup_questionnaires
  FOR ALL TO authenticated
  USING (
    public.is_admin()
    OR (
      party = 'company'
      AND public.employer_can_access_application(application_id)
    )
    OR (
      party = 'candidate'
      AND public.candidate_owns_application(application_id)
    )
  )
  WITH CHECK (
    public.is_admin()
    OR (
      party = 'company'
      AND public.employer_can_access_application(application_id)
    )
    OR (
      party = 'candidate'
      AND public.candidate_owns_application(application_id)
    )
  );

-- Structured answers
CREATE TABLE IF NOT EXISTS public.followup_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  questionnaire_id uuid NOT NULL REFERENCES public.followup_questionnaires(id) ON DELETE CASCADE,
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  question_key text NOT NULL,
  readiness_dimension text,
  option_key text,
  score smallint,
  open_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (questionnaire_id, question_key)
);

CREATE INDEX IF NOT EXISTS followup_answers_app_idx
  ON public.followup_answers (application_id, readiness_dimension);

ALTER TABLE public.followup_answers ENABLE ROW LEVEL SECURITY;

-- Answers inherit questionnaire party visibility via join check
DROP POLICY IF EXISTS followup_answers_select ON public.followup_answers;
CREATE POLICY followup_answers_select ON public.followup_answers
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM followup_questionnaires q
      WHERE q.id = questionnaire_id
        AND q.party = 'company'
        AND public.employer_can_access_application(q.application_id)
    )
    OR EXISTS (
      SELECT 1 FROM followup_questionnaires q
      WHERE q.id = questionnaire_id
        AND q.party = 'candidate'
        AND public.candidate_owns_application(q.application_id)
    )
  );

DROP POLICY IF EXISTS followup_answers_write ON public.followup_answers;
CREATE POLICY followup_answers_write ON public.followup_answers
  FOR ALL TO authenticated
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
    )
    OR EXISTS (
      SELECT 1 FROM followup_questionnaires q
      WHERE q.id = questionnaire_id
        AND q.party = 'candidate'
        AND public.candidate_owns_application(q.application_id)
    )
  );

-- Company add-on requests
CREATE TABLE IF NOT EXISTS public.followup_addon_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  addon_key text NOT NULL CHECK (addon_key IN (
    'extended_family_support', 'extended_language', 'extended_followup', 'school_kindergarten'
  )),
  notes text,
  status text NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested', 'acknowledged', 'fulfilled', 'declined')),
  requested_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS followup_addon_app_idx
  ON public.followup_addon_requests (application_id);

ALTER TABLE public.followup_addon_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS followup_addon_select ON public.followup_addon_requests;
CREATE POLICY followup_addon_select ON public.followup_addon_requests
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR public.employer_can_access_application(application_id)
  );

DROP POLICY IF EXISTS followup_addon_write ON public.followup_addon_requests;
CREATE POLICY followup_addon_write ON public.followup_addon_requests
  FOR ALL TO authenticated
  USING (
    public.is_admin()
    OR public.employer_can_access_application(application_id)
  )
  WITH CHECK (
    public.is_admin()
    OR public.employer_can_access_application(application_id)
  );

-- Ad-hoc support log (complements Messages)
CREATE TABLE IF NOT EXISTS public.followup_adhoc_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  urgency text NOT NULL DEFAULT 'standard' CHECK (urgency IN ('urgent', 'standard')),
  subject text,
  body text,
  opened_by_role text NOT NULL CHECK (opened_by_role IN ('candidate', 'company', 'admin')),
  opened_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  conversation_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS followup_adhoc_app_idx
  ON public.followup_adhoc_logs (application_id, created_at DESC);

ALTER TABLE public.followup_adhoc_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS followup_adhoc_select ON public.followup_adhoc_logs;
CREATE POLICY followup_adhoc_select ON public.followup_adhoc_logs
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR public.employer_can_access_application(application_id)
    OR public.candidate_owns_application(application_id)
  );

DROP POLICY IF EXISTS followup_adhoc_write ON public.followup_adhoc_logs;
CREATE POLICY followup_adhoc_write ON public.followup_adhoc_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_admin()
    OR public.employer_can_access_application(application_id)
    OR public.candidate_owns_application(application_id)
  );

DROP POLICY IF EXISTS followup_adhoc_admin_update ON public.followup_adhoc_logs;
CREATE POLICY followup_adhoc_admin_update ON public.followup_adhoc_logs
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- RPCs

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
  SELECT COALESCE(at_risk_retention, false) INTO v_at_risk
  FROM activation_records WHERE application_id = p_application_id;

  SELECT EXISTS (
    SELECT 1 FROM followup_meeting_logs WHERE application_id = p_application_id AND state = 'flag' AND logged_at IS NOT NULL
  ) INTO v_has_flag;

  SELECT EXISTS (
    SELECT 1 FROM followup_meeting_logs WHERE application_id = p_application_id AND state = 'watch' AND logged_at IS NOT NULL
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

CREATE OR REPLACE FUNCTION public.get_followup_meeting_summaries(p_application_id uuid)
 RETURNS TABLE(touchpoint_id uuid, month_number smallint, party text, is_logged boolean, meeting_date date, state text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT (
    public.is_admin()
    OR public.employer_can_access_application(p_application_id)
    OR public.candidate_owns_application(p_application_id)
  ) THEN
    RAISE EXCEPTION 'not allowed';
  END IF;

  RETURN QUERY
  SELECT
    tp.id,
    tp.month_number,
    ml.party,
    (ml.logged_at IS NOT NULL),
    ml.meeting_date,
    CASE WHEN public.is_admin() THEN ml.state ELSE NULL::text END
  FROM followup_touchpoints tp
  JOIN followup_meeting_logs ml ON ml.touchpoint_id = tp.id
  WHERE tp.application_id = p_application_id
  ORDER BY tp.month_number, ml.party;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.initialize_followup(uuid, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_followup_status(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_followup_questionnaires(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_followup_if_ready(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_followup_meeting_summaries(uuid) TO authenticated;
