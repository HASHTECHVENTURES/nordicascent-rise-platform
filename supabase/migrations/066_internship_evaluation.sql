-- Module 4 Phase 2: company internship evaluation (checkpoint #6)
-- Separate from academic evaluation — never shown to candidates or universities.

CREATE TABLE IF NOT EXISTS public.internship_evaluations (
  application_id uuid PRIMARY KEY REFERENCES public.applications(id) ON DELETE CASCADE,
  technical_execution text NOT NULL,
  communication text NOT NULL,
  collaboration_team_fit text NOT NULL,
  overall_assessment text NOT NULL,
  concerns_risks text NOT NULL,
  submitted_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.internship_evaluations ENABLE ROW LEVEL SECURITY;

-- Company + admin only — candidates and universities cannot read
DROP POLICY IF EXISTS internship_evaluations_select ON public.internship_evaluations;
CREATE POLICY internship_evaluations_select ON public.internship_evaluations
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR public.employer_can_access_application(application_id)
  );

DROP POLICY IF EXISTS internship_evaluations_write ON public.internship_evaluations;
CREATE POLICY internship_evaluations_write ON public.internship_evaluations
  FOR ALL TO authenticated
  USING (
    public.is_admin()
    OR public.employer_can_access_application(application_id)
  )
  WITH CHECK (
    public.is_admin()
    OR public.employer_can_access_application(application_id)
  );
