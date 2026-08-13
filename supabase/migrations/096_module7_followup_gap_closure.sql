-- Module 7 gap closure: harden rollup writes, calendar months, open+notify questionnaires, Flag→issues

-- Allow SECURITY DEFINER followup writers to bypass field protect via GUC
CREATE OR REPLACE FUNCTION public.protect_followup_internal_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF current_setting('app.followup_internal_write', true) = '1' THEN
    RETURN NEW;
  END IF;

  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  -- Rollup status + completion are automatic only (never employer/candidate manual)
  IF NEW.followup_status IS DISTINCT FROM OLD.followup_status
     OR NEW.followup_completed_at IS DISTINCT FROM OLD.followup_completed_at THEN
    RAISE EXCEPTION 'followup_status is rolled up automatically — not editable';
  END IF;

  -- Non-admin may set retention risk true, but never clear it
  IF COALESCE(OLD.at_risk_retention, false) IS TRUE
     AND COALESCE(NEW.at_risk_retention, false) IS NOT TRUE THEN
    RAISE EXCEPTION 'not allowed to clear at_risk_retention';
  END IF;

  IF NEW.at_risk_retention_at IS DISTINCT FROM OLD.at_risk_retention_at
     AND NOT COALESCE(NEW.at_risk_retention, false) THEN
    RAISE EXCEPTION 'not allowed to clear at_risk_retention_at';
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public._followup_allow_internal_write()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM set_config('app.followup_internal_write', '1', true);
END;
$$;

-- Patch sync / complete / refresh to set the GUC first
CREATE OR REPLACE FUNCTION public.sync_followup_status(p_application_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_status text := 'followup_active';
  v_at_risk boolean;
  v_has_flag boolean;
  v_has_watch boolean;
  v_complete boolean;
BEGIN
  PERFORM public._followup_allow_internal_write();

  SELECT COALESCE(at_risk_retention, false) INTO v_at_risk
  FROM activation_records WHERE application_id = p_application_id;

  IF v_at_risk THEN
    v_status := 'at_risk_retention';
  ELSE
    SELECT EXISTS (
      SELECT 1 FROM followup_meeting_logs
      WHERE application_id = p_application_id AND logged_at IS NOT NULL AND state = 'flag'
    ) INTO v_has_flag;
    SELECT EXISTS (
      SELECT 1 FROM followup_meeting_logs
      WHERE application_id = p_application_id AND logged_at IS NOT NULL AND state = 'watch'
    ) INTO v_has_watch;

    IF v_has_flag THEN
      v_status := 'followup_flag';
    ELSIF v_has_watch THEN
      v_status := 'followup_watch';
    ELSE
      v_status := 'followup_active';
    END IF;
  END IF;

  SELECT followup_completed_at IS NOT NULL INTO v_complete
  FROM activation_records WHERE application_id = p_application_id;

  IF v_complete AND NOT v_at_risk THEN
    v_status := 'followup_complete';
  ELSIF v_complete AND v_at_risk THEN
    v_status := 'at_risk_retention';
  END IF;

  UPDATE activation_records
  SET followup_status = v_status, updated_at = now()
  WHERE application_id = p_application_id;

  RETURN v_status;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_at_risk_retention(p_application_id uuid, p_value boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT (
    public.is_admin()
    OR public.can_access_followup_application(p_application_id)
  ) THEN
    RAISE EXCEPTION 'not allowed';
  END IF;

  -- Only admin may clear
  IF p_value IS NOT TRUE AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'not allowed to clear at_risk_retention';
  END IF;

  PERFORM public._followup_allow_internal_write();

  UPDATE activation_records
  SET
    at_risk_retention = COALESCE(p_value, false),
    at_risk_retention_at = CASE WHEN p_value THEN COALESCE(at_risk_retention_at, now()) ELSE NULL END,
    updated_at = now()
  WHERE application_id = p_application_id;

  PERFORM public.sync_followup_status(p_application_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_at_risk_retention(uuid, boolean) TO authenticated;

-- Calendar months for touchpoint schedule + questionnaire open (1 week before 3/6)
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
  v_m1 date; v_m2 date; v_m3 date; v_m6 date;
BEGIN
  IF NOT public.can_access_followup_application(p_application_id) THEN
    RAISE EXCEPTION 'not allowed';
  END IF;

  PERFORM public._followup_allow_internal_write();

  SELECT COALESCE(p_arrival_date, ar.arrival_date, ar.planned_arrival_date, CURRENT_DATE)
  INTO v_arrival
  FROM activation_records ar WHERE ar.application_id = p_application_id;

  IF v_arrival IS NULL THEN v_arrival := CURRENT_DATE; END IF;

  v_m1 := (v_arrival + interval '1 month')::date;
  v_m2 := (v_arrival + interval '2 months')::date;
  v_m3 := (v_arrival + interval '3 months')::date;
  v_m6 := (v_arrival + interval '6 months')::date;

  UPDATE activation_records
  SET followup_status = COALESCE(followup_status, 'followup_active'), updated_at = now()
  WHERE application_id = p_application_id;

  INSERT INTO followup_touchpoints (application_id, month_number, title, focus, target_due_date, window_end, questionnaire_opens_at)
  VALUES
    (p_application_id, 1, '1 month — Settling in', 'Practical basics and daily life', v_m1, v_m1 + 7, NULL),
    (p_application_id, 2, '2 months — Work integration', 'Honeymoon ending; early friction', v_m2, v_m2 + 7, NULL),
    (p_application_id, 3, '3 months — First assessment', 'First real checkpoint', v_m3, v_m3 + 7, v_m3 - 7),
    (p_application_id, 6, '6 months — Integration review', 'Validate selection and integration', v_m6, v_m6 + 7, v_m6 - 7)
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
    (p_application_id, v_tp3, 3, 'candidate', 'pending', v_m3 - 7),
    (p_application_id, v_tp3, 3, 'company', 'pending', v_m3 - 7),
    (p_application_id, v_tp6, 6, 'candidate', 'pending', v_m6 - 7),
    (p_application_id, v_tp6, 6, 'company', 'pending', v_m6 - 7)
  ON CONFLICT (application_id, month_number, party) DO NOTHING;

  PERFORM public.refresh_followup_questionnaires(p_application_id);

  SELECT candidate_id INTO v_candidate_id FROM applications WHERE id = p_application_id;
  IF v_candidate_id IS NOT NULL THEN
    UPDATE candidate_stage_progress
    SET status = CASE WHEN status = 'completed' THEN status ELSE 'active' END,
        started_at = COALESCE(started_at, now())
    WHERE candidate_id = v_candidate_id AND stage_id = 'followup';

    IF NOT FOUND THEN
      INSERT INTO candidate_stage_progress (candidate_id, stage_id, status, started_at)
      VALUES (v_candidate_id, 'followup', 'active', now())
      ON CONFLICT (candidate_id, stage_id) DO UPDATE
      SET status = CASE WHEN candidate_stage_progress.status = 'completed' THEN candidate_stage_progress.status ELSE 'active' END,
          started_at = COALESCE(candidate_stage_progress.started_at, now());
    END IF;
  END IF;

  UPDATE applications
  SET status = 'followup', updated_at = now()
  WHERE id = p_application_id
    AND status IS DISTINCT FROM 'followup'
    AND status IS DISTINCT FROM 'journey_complete';

  PERFORM public.sync_followup_status(p_application_id);
END;
$function$;

-- Open due questionnaires + notify parties (in-app). Returns opened count.
CREATE OR REPLACE FUNCTION public.refresh_followup_questionnaires(p_application_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  r record;
  v_candidate_profile uuid;
  v_employer_profile uuid;
  v_job_title text;
BEGIN
  IF NOT public.is_admin()
     AND NOT public.can_access_followup_application(p_application_id) THEN
    RAISE EXCEPTION 'not allowed';
  END IF;

  FOR r IN
    SELECT q.id, q.party, q.month_number
    FROM followup_questionnaires q
    WHERE q.application_id = p_application_id
      AND q.status = 'pending'
      AND q.opens_at IS NOT NULL
      AND q.opens_at <= CURRENT_DATE
  LOOP
    UPDATE followup_questionnaires
    SET status = 'open', updated_at = now()
    WHERE id = r.id;

    SELECT c.profile_id, j.title
    INTO v_candidate_profile, v_job_title
    FROM applications a
    JOIN candidates c ON c.id = a.candidate_id
    LEFT JOIN jobs j ON j.id = a.job_id
    WHERE a.id = p_application_id;

    IF r.party = 'candidate' AND v_candidate_profile IS NOT NULL THEN
      INSERT INTO notifications (user_id, title, body, type, metadata)
      VALUES (
        v_candidate_profile,
        format('%s-month follow-up questionnaire', r.month_number),
        format('Please complete your %s-month questionnaire for %s. It helps us improve support for you and future candidates.', r.month_number, COALESCE(v_job_title, 'your role')),
        'followup_questionnaire_open',
        jsonb_build_object('applicationId', p_application_id, 'month', r.month_number, 'party', 'candidate')
      );
    ELSIF r.party = 'company' THEN
      SELECT e.profile_id INTO v_employer_profile
      FROM applications a
      JOIN jobs j ON j.id = a.job_id
      JOIN employers e ON e.company_id = j.company_id
      WHERE a.id = p_application_id
      LIMIT 1;

      IF v_employer_profile IS NOT NULL THEN
        INSERT INTO notifications (user_id, title, body, type, metadata)
        VALUES (
          v_employer_profile,
          format('%s-month follow-up questionnaire', r.month_number),
          format('Please complete the company %s-month questionnaire. Your answers calibrate selection and Readiness.', r.month_number),
          'followup_questionnaire_open',
          jsonb_build_object('applicationId', p_application_id, 'month', r.month_number, 'party', 'company')
        );
      END IF;
    END IF;
  END LOOP;
END;
$function$;

-- Admin/cron: open all due questionnaires across programmes
CREATE OR REPLACE FUNCTION public.open_due_followup_questionnaires()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  r record;
  v_count int := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'admin only';
  END IF;

  FOR r IN
    SELECT DISTINCT application_id
    FROM followup_questionnaires
    WHERE status = 'pending'
      AND opens_at IS NOT NULL
      AND opens_at <= CURRENT_DATE
  LOOP
    PERFORM public.refresh_followup_questionnaires(r.application_id);
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.open_due_followup_questionnaires() TO authenticated;
GRANT EXECUTE ON FUNCTION public.open_due_followup_questionnaires() TO service_role;

-- Flag meeting → open admin issue (idempotent per touchpoint/party)
CREATE OR REPLACE FUNCTION public.create_followup_flag_issue(
  p_application_id uuid,
  p_touchpoint_id uuid,
  p_party text,
  p_month_number int,
  p_notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_candidate_id uuid;
  v_title text;
  v_issue_id uuid;
  v_marker text;
BEGIN
  IF NOT (
    public.is_admin()
    OR public.can_access_followup_application(p_application_id)
  ) THEN
    RAISE EXCEPTION 'not allowed';
  END IF;

  SELECT candidate_id INTO v_candidate_id FROM applications WHERE id = p_application_id;
  v_marker := format('followup_flag:%s:%s', p_touchpoint_id, p_party);
  v_title := format('Follow-up Flag — month %s (%s)', p_month_number, p_party);

  SELECT id INTO v_issue_id
  FROM issues
  WHERE candidate_id = v_candidate_id
    AND status = 'open'
    AND description LIKE '%' || v_marker || '%'
  LIMIT 1;

  IF v_issue_id IS NOT NULL THEN
    RETURN v_issue_id;
  END IF;

  INSERT INTO issues (title, description, candidate_id, reporter_id, status, priority)
  VALUES (
    v_title,
    format(
      E'%s\n\nContact may be needed before the next scheduled touchpoint.\nMarker: %s\n\nNotes:\n%s',
      v_title,
      v_marker,
      COALESCE(p_notes, '(none)')
    ),
    v_candidate_id,
    auth.uid(),
    'open',
    'high'
  )
  RETURNING id INTO v_issue_id;

  -- Notify all admins
  INSERT INTO notifications (user_id, title, body, type, metadata)
  SELECT
    p.id,
    v_title,
    format('A follow-up meeting was Flagged at month %s (%s). Review and contact if needed before the next touchpoint.', p_month_number, p_party),
    'followup_flag',
    jsonb_build_object(
      'applicationId', p_application_id,
      'issueId', v_issue_id,
      'month', p_month_number,
      'party', p_party
    )
  FROM profiles p
  WHERE p.role = 'admin' AND p.account_status = 'active';

  RETURN v_issue_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_followup_flag_issue(uuid, uuid, text, int, text) TO authenticated;

-- Ensure complete_followup_if_ready can write status
CREATE OR REPLACE FUNCTION public.complete_followup_if_ready(p_application_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_m6 uuid;
  v_cand_logged boolean;
  v_co_logged boolean;
  v_cand_q boolean;
  v_co_q boolean;
  v_at_risk boolean;
BEGIN
  IF NOT public.can_access_followup_application(p_application_id) THEN
    RAISE EXCEPTION 'not allowed';
  END IF;

  PERFORM public._followup_allow_internal_write();

  SELECT id INTO v_m6
  FROM followup_touchpoints
  WHERE application_id = p_application_id AND month_number = 6;

  IF v_m6 IS NULL THEN
    RETURN false;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM followup_meeting_logs
    WHERE touchpoint_id = v_m6 AND party = 'candidate' AND logged_at IS NOT NULL
  ) INTO v_cand_logged;

  SELECT EXISTS (
    SELECT 1 FROM followup_meeting_logs
    WHERE touchpoint_id = v_m6 AND party = 'company' AND logged_at IS NOT NULL
  ) INTO v_co_logged;

  SELECT EXISTS (
    SELECT 1 FROM followup_questionnaires
    WHERE application_id = p_application_id AND month_number = 6 AND party = 'candidate' AND status = 'submitted'
  ) INTO v_cand_q;

  SELECT EXISTS (
    SELECT 1 FROM followup_questionnaires
    WHERE application_id = p_application_id AND month_number = 6 AND party = 'company' AND status = 'submitted'
  ) INTO v_co_q;

  IF NOT (v_cand_logged AND v_co_logged AND v_cand_q AND v_co_q) THEN
    RETURN false;
  END IF;

  SELECT COALESCE(at_risk_retention, false) INTO v_at_risk
  FROM activation_records WHERE application_id = p_application_id;

  UPDATE activation_records
  SET
    followup_completed_at = COALESCE(followup_completed_at, now()),
    followup_status = CASE WHEN v_at_risk THEN 'at_risk_retention' ELSE 'followup_complete' END,
    updated_at = now()
  WHERE application_id = p_application_id;

  UPDATE candidate_stage_progress csp
  SET status = 'completed', completed_at = COALESCE(completed_at, now())
  FROM applications a
  WHERE a.id = p_application_id
    AND csp.candidate_id = a.candidate_id
    AND csp.stage_id = 'followup'
    AND csp.status <> 'completed';

  RETURN true;
END;
$function$;
