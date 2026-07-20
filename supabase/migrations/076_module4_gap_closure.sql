-- Module 4 gap closure: academic unlock on step 1, complete gated on step 7,
-- internship completion diploma, expanded activation CMS keys.

ALTER TABLE public.activation_records
  ADD COLUMN IF NOT EXISTS internship_completion_issued_at timestamptz,
  ADD COLUMN IF NOT EXISTS internship_completion_doc_path text;

-- Align academic step titles to Lars Module 4 spec
UPDATE public.academic_workflow_steps SET title = 'University + company approve internship project; supervisor assigned', updated_at = now()
WHERE step_number = 1;
UPDATE public.academic_workflow_steps SET title = 'Learning Agreement signed (objectives, hours, credit)', updated_at = now()
WHERE step_number = 2;
UPDATE public.academic_workflow_steps SET title = 'Student logs hours, weekly journal, and deliverables', updated_at = now()
WHERE step_number = 3;
UPDATE public.academic_workflow_steps SET title = 'University supervisor monitors (parallel to mentor)', updated_at = now()
WHERE step_number = 4;
UPDATE public.academic_workflow_steps SET title = 'Student submits final report and presentation', updated_at = now()
WHERE step_number = 5;
UPDATE public.academic_workflow_steps SET title = 'Company academic evaluation sent to university (learning only)', updated_at = now()
WHERE step_number = 6;
UPDATE public.academic_workflow_steps SET title = 'University awards credit and certificate', updated_at = now()
WHERE step_number = 7;

-- Unlock internship start after academic step 1 (not all 7)
CREATE OR REPLACE FUNCTION public.sync_academic_unlock_from_workflow(p_application_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_required boolean;
  v_step1_done boolean;
BEGIN
  SELECT university_credit_required INTO v_required
  FROM activation_records
  WHERE application_id = p_application_id;

  IF NOT COALESCE(v_required, false) THEN
    RETURN;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM academic_workflow_steps
    WHERE application_id = p_application_id
      AND step_number = 1
      AND status = 'completed'
  ) INTO v_step1_done;

  IF v_step1_done THEN
    UPDATE activation_records
    SET
      academic_unlocked_at = COALESCE(academic_unlocked_at, now()),
      updated_at = now()
    WHERE application_id = p_application_id
      AND academic_unlocked_at IS NULL;

    PERFORM public.refresh_internship_checkpoint_unlocks(p_application_id);
  END IF;
END;
$$;

-- Gate internship_complete on academic step 7 when credit required; issue diploma
CREATE OR REPLACE FUNCTION public.refresh_internship_checkpoint_unlocks(p_application_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r record;
  v_prev_done boolean;
  v_gate_ok boolean;
  v_credit boolean;
  v_academic_credit_done boolean;
  v_all_cps_done boolean;
BEGIN
  v_gate_ok := public.is_pre_internship_gate_complete(p_application_id);

  SELECT COALESCE(university_credit_required, false) INTO v_credit
  FROM activation_records
  WHERE application_id = p_application_id;

  IF COALESCE(v_credit, false) THEN
    SELECT EXISTS (
      SELECT 1 FROM academic_workflow_steps
      WHERE application_id = p_application_id
        AND step_number = 7
        AND status = 'completed'
    ) INTO v_academic_credit_done;
  ELSE
    v_academic_credit_done := true;
  END IF;

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

    IF r.checkpoint_number = 1 AND NOT v_gate_ok THEN
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

  IF EXISTS (
    SELECT 1 FROM internship_checkpoints
    WHERE application_id = p_application_id AND checkpoint_number = 1 AND status = 'completed'
  ) THEN
    UPDATE activation_records
    SET status = 'internship_active', updated_at = now()
    WHERE application_id = p_application_id
      AND status = 'ready_for_activation';
  END IF;

  SELECT NOT EXISTS (
    SELECT 1 FROM internship_checkpoints
    WHERE application_id = p_application_id AND status <> 'completed'
  ) AND EXISTS (
    SELECT 1 FROM internship_checkpoints WHERE application_id = p_application_id
  ) INTO v_all_cps_done;

  IF v_all_cps_done AND v_academic_credit_done THEN
    UPDATE activation_records
    SET
      status = 'internship_complete',
      internship_completion_issued_at = COALESCE(internship_completion_issued_at, now()),
      updated_at = now()
    WHERE application_id = p_application_id
      AND status IN ('ready_for_activation', 'internship_active');
  END IF;
END;
$$;

-- Candidates can read their own academic workflow progress
DROP POLICY IF EXISTS academic_workflow_steps_select ON public.academic_workflow_steps;
CREATE POLICY academic_workflow_steps_select ON public.academic_workflow_steps
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR public.employer_can_access_application(application_id)
    OR public.candidate_owns_application(application_id)
  );

-- Admin or employer can update academic checklist (common form)
DROP POLICY IF EXISTS academic_workflow_steps_write ON public.academic_workflow_steps;
CREATE POLICY academic_workflow_steps_write ON public.academic_workflow_steps
  FOR ALL TO authenticated
  USING (
    public.is_admin()
    OR public.employer_can_access_application(application_id)
  )
  WITH CHECK (
    public.is_admin()
    OR public.employer_can_access_application(application_id)
  );

-- Expand activation CMS templates
UPDATE public.platform_settings
SET settings = COALESCE(settings, '{}'::jsonb) || jsonb_build_object(
  'activationCms',
  COALESCE(settings->'activationCms', '{}'::jsonb) || jsonb_build_object(
    'clearance_cleared',
    'Congratulations — you''ve been cleared to move forward. You''ve completed your internship and come through every stage of the process. {companyName} is ready to take the next step with you toward employment in Norway. We''ll be in touch shortly about relocation and onboarding.',
    'clearance_hold',
    'Thank you for everything you''ve put into this process. This opportunity will not move forward to employment. That does not take away from what you achieved — your completed internship, and its documentation, remain yours to keep and build on. Decisions at this stage depend on many factors, and we''re grateful for your effort. We wish you every success ahead.',
    'clearance_company_cleared',
    'Clearance recorded. Pre-arrival employment is now unlocked for this candidate.',
    'clearance_company_hold',
    'Hold recorded. The candidate has been moved to alumni. Their internship completion document remains available.'
  )
),
updated_at = now()
WHERE id = 'default';
