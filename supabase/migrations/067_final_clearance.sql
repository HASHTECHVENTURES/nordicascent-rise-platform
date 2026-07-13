-- Module 4 Phase 3: Final Clearance decisions

CREATE TABLE IF NOT EXISTS public.final_clearance_decisions (
  application_id uuid PRIMARY KEY REFERENCES public.applications(id) ON DELETE CASCADE,
  decision text NOT NULL CHECK (decision IN ('clear', 'hold')),
  decision_maker_name text NOT NULL,
  decision_date date NOT NULL,
  reasoning text NOT NULL,
  submitted_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.final_clearance_decisions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS final_clearance_decisions_select ON public.final_clearance_decisions;
CREATE POLICY final_clearance_decisions_select ON public.final_clearance_decisions
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR public.employer_can_access_application(application_id)
  );

DROP POLICY IF EXISTS final_clearance_decisions_write ON public.final_clearance_decisions;
CREATE POLICY final_clearance_decisions_write ON public.final_clearance_decisions
  FOR ALL TO authenticated
  USING (
    public.is_admin()
    OR public.employer_can_access_application(application_id)
  )
  WITH CHECK (
    public.is_admin()
    OR public.employer_can_access_application(application_id)
  );
