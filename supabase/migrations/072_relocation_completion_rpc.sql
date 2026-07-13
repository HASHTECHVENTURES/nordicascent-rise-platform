-- Complete relocation when all 6 checkpoints are done (security definer — bypasses RLS edge cases)

CREATE OR REPLACE FUNCTION public.complete_relocation_if_ready(p_application_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_done int;
  v_record activation_records%ROWTYPE;
  v_app applications%ROWTYPE;
  v_now timestamptz := now();
  v_profile_id uuid;
  v_job_title text;
  v_company_name text;
BEGIN
  SELECT count(*) INTO v_done
  FROM relocation_checkpoints
  WHERE application_id = p_application_id AND status = 'completed';

  IF v_done < 6 THEN
    RETURN false;
  END IF;

  SELECT * INTO v_record FROM activation_records WHERE application_id = p_application_id;
  IF NOT FOUND OR v_record.pre_arrival_completed_at IS NULL OR v_record.relocation_completed_at IS NOT NULL THEN
    RETURN false;
  END IF;

  SELECT * INTO v_app FROM applications WHERE id = p_application_id;
  IF NOT FOUND OR v_app.status <> 'relocation' THEN
    RETURN false;
  END IF;

  SELECT c.profile_id INTO v_profile_id
  FROM candidates c WHERE c.id = v_app.candidate_id;

  SELECT j.title, co.name INTO v_job_title, v_company_name
  FROM jobs j
  LEFT JOIN companies co ON co.id = j.company_id
  WHERE j.id = v_app.job_id;

  UPDATE activation_records
  SET relocation_completed_at = v_now, updated_at = v_now
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
      'Relocation complete',
      'All relocation steps are done' ||
        CASE WHEN v_company_name IS NOT NULL THEN ' for ' || v_company_name ELSE '' END ||
        '. Onboarding is next.',
      'relocation_complete',
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

GRANT EXECUTE ON FUNCTION public.complete_relocation_if_ready(uuid) TO authenticated;
