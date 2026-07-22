-- Admin can reschedule / force-open follow-up questionnaires for pilot testing.

CREATE OR REPLACE FUNCTION public.admin_set_followup_questionnaire_opens_at(
  p_questionnaire_id uuid,
  p_opens_at date,
  p_force_open boolean DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_app_id uuid;
  v_month smallint;
  v_status text;
  v_new_status text;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admin can change questionnaire open dates';
  END IF;

  SELECT application_id, month_number, status
  INTO v_app_id, v_month, v_status
  FROM followup_questionnaires
  WHERE id = p_questionnaire_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Questionnaire not found';
  END IF;

  IF v_status = 'submitted' THEN
    RAISE EXCEPTION 'Cannot change date on a submitted questionnaire';
  END IF;

  IF p_force_open OR p_opens_at <= CURRENT_DATE THEN
    v_new_status := 'open';
  ELSE
    v_new_status := 'pending';
  END IF;

  UPDATE followup_questionnaires
  SET
    opens_at = p_opens_at,
    status = v_new_status,
    updated_at = now()
  WHERE id = p_questionnaire_id;

  UPDATE followup_touchpoints
  SET
    questionnaire_opens_at = p_opens_at,
    updated_at = now()
  WHERE application_id = v_app_id
    AND month_number = v_month;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_set_followup_questionnaire_opens_at(uuid, date, boolean)
  TO authenticated;

-- Open a whole month's questionnaires now (candidate + company), or all months if null
CREATE OR REPLACE FUNCTION public.admin_open_followup_questionnaires_now(
  p_application_id uuid,
  p_month_number smallint DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admin can open questionnaires early';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM applications WHERE id = p_application_id) THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  UPDATE followup_questionnaires
  SET
    opens_at = CURRENT_DATE,
    status = CASE WHEN status = 'submitted' THEN status ELSE 'open' END,
    updated_at = now()
  WHERE application_id = p_application_id
    AND status <> 'submitted'
    AND (p_month_number IS NULL OR month_number = p_month_number);

  UPDATE followup_touchpoints
  SET
    questionnaire_opens_at = CURRENT_DATE,
    updated_at = now()
  WHERE application_id = p_application_id
    AND month_number IN (3, 6)
    AND (p_month_number IS NULL OR month_number = p_month_number);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_open_followup_questionnaires_now(uuid, smallint)
  TO authenticated;
