-- Module 4 Phase 6: In-person visit, academic workflow (7 steps), activation CMS keys

CREATE TABLE IF NOT EXISTS public.activation_in_person_visits (
  application_id uuid PRIMARY KEY REFERENCES public.applications(id) ON DELETE CASCADE,
  visit_chosen boolean,
  visit_format text CHECK (visit_format IN ('in_person', 'video', 'none')),
  visit_date date,
  notes text,
  confirmed_at timestamptz,
  confirmed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  candidate_notified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.academic_workflow_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  step_number smallint NOT NULL CHECK (step_number BETWEEN 1 AND 7),
  title text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  notes text,
  completed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (application_id, step_number)
);

CREATE INDEX IF NOT EXISTS academic_workflow_steps_app_idx
  ON public.academic_workflow_steps (application_id, step_number);

ALTER TABLE public.activation_in_person_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_workflow_steps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS activation_in_person_visits_select ON public.activation_in_person_visits;
CREATE POLICY activation_in_person_visits_select ON public.activation_in_person_visits
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR public.employer_can_access_application(application_id)
    OR application_id IN (
      SELECT a.id FROM applications a
      JOIN candidates c ON c.id = a.candidate_id
      WHERE c.profile_id = auth.uid()
        AND candidate_notified_at IS NOT NULL
    )
  );

DROP POLICY IF EXISTS activation_in_person_visits_write ON public.activation_in_person_visits;
CREATE POLICY activation_in_person_visits_write ON public.activation_in_person_visits
  FOR ALL TO authenticated
  USING (public.is_admin() OR public.employer_can_access_application(application_id))
  WITH CHECK (public.is_admin() OR public.employer_can_access_application(application_id));

DROP POLICY IF EXISTS academic_workflow_steps_select ON public.academic_workflow_steps;
CREATE POLICY academic_workflow_steps_select ON public.academic_workflow_steps
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR public.employer_can_access_application(application_id)
  );

DROP POLICY IF EXISTS academic_workflow_steps_write ON public.academic_workflow_steps;
CREATE POLICY academic_workflow_steps_write ON public.academic_workflow_steps
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE OR REPLACE FUNCTION public.sync_academic_unlock_from_workflow(p_application_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_required boolean;
  v_all_done boolean;
BEGIN
  SELECT university_credit_required INTO v_required
  FROM activation_records
  WHERE application_id = p_application_id;

  IF NOT COALESCE(v_required, false) THEN
    RETURN;
  END IF;

  SELECT NOT EXISTS (
    SELECT 1 FROM academic_workflow_steps
    WHERE application_id = p_application_id AND status <> 'completed'
  ) AND EXISTS (
    SELECT 1 FROM academic_workflow_steps WHERE application_id = p_application_id
  ) INTO v_all_done;

  IF v_all_done THEN
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

GRANT EXECUTE ON FUNCTION public.sync_academic_unlock_from_workflow(uuid) TO authenticated;

-- Seed activation CMS keys into platform_settings
UPDATE public.platform_settings
SET settings = COALESCE(settings, '{}'::jsonb) || jsonb_build_object(
  'activationCms', jsonb_build_object(
    'clearance_screen_note',
    'This is a red-flag check, not a new hiring decision. The candidate has already been validated through Selection, Readiness, and (for Entry track) the internship. Proceeding is the expected outcome — choose Hold only for a genuine red flag.',
    'visit_confirmed',
    'Your visit with {companyName} is confirmed for {visitDate}. Format: {visitFormat}. {notes}',
    'pre_internship_presentation',
    'Your internship is about to begin. Review the programme expectations below, then confirm your acceptance to unlock internship checkpoints.

You will work remotely with your company mentor through the internship phase, with Nordic Ascent support throughout.'
  )
),
updated_at = now()
WHERE id = 'default';

CREATE OR REPLACE FUNCTION public.get_activation_cms()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(settings->'activationCms', '{}'::jsonb)
  FROM platform_settings
  WHERE id = 'default';
$$;

GRANT EXECUTE ON FUNCTION public.get_activation_cms() TO authenticated;
