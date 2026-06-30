-- Module 2 — Selection pipeline fields on applications (single object, no extra tables).

-- Extend application_status enum for selection pipeline (idempotent per value).
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'application_complete';
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'eligibility_review';
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'eligibility_pass';
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'offee_review';
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'offee_pass';
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'step3_review';
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'step3_pass';
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'step4_review';
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'step4_pass';
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'selected_for_readiness';
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'selection_hold';
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'selection_rejected';

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS selection_step integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS selection_step_entered_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS eligibility_auto_checks jsonb,
  ADD COLUMN IF NOT EXISTS eligibility_admin_notes text,
  ADD COLUMN IF NOT EXISTS eligibility_decided_at timestamptz,
  ADD COLUMN IF NOT EXISTS offee_technical_score numeric,
  ADD COLUMN IF NOT EXISTS offee_open_mindedness_score numeric,
  ADD COLUMN IF NOT EXISTS offee_assessed_at date,
  ADD COLUMN IF NOT EXISTS offee_notes text,
  ADD COLUMN IF NOT EXISTS offee_decided_at timestamptz,
  ADD COLUMN IF NOT EXISTS technical_digital_date date,
  ADD COLUMN IF NOT EXISTS technical_digital_notes text,
  ADD COLUMN IF NOT EXISTS technical_f2f_date date,
  ADD COLUMN IF NOT EXISTS technical_f2f_format text,
  ADD COLUMN IF NOT EXISTS technical_company_participated boolean,
  ADD COLUMN IF NOT EXISTS technical_score numeric,
  ADD COLUMN IF NOT EXISTS technical_cognitive_score numeric,
  ADD COLUMN IF NOT EXISTS technical_assessor_notes text,
  ADD COLUMN IF NOT EXISTS technical_company_feedback text,
  ADD COLUMN IF NOT EXISTS technical_decided_at timestamptz,
  ADD COLUMN IF NOT EXISTS motivation_session_date date,
  ADD COLUMN IF NOT EXISTS motivation_format text,
  ADD COLUMN IF NOT EXISTS motivation_company_participated boolean,
  ADD COLUMN IF NOT EXISTS motivation_score numeric,
  ADD COLUMN IF NOT EXISTS motivation_session_notes text,
  ADD COLUMN IF NOT EXISTS motivation_company_feedback text,
  ADD COLUMN IF NOT EXISTS motivation_decided_at timestamptz,
  ADD COLUMN IF NOT EXISTS board_admin_recommendation text
    CHECK (board_admin_recommendation IS NULL OR board_admin_recommendation IN ('recommended', 'not_recommended')),
  ADD COLUMN IF NOT EXISTS board_admin_reason text,
  ADD COLUMN IF NOT EXISTS board_company_decision text
    CHECK (board_company_decision IS NULL OR board_company_decision IN ('selected', 'hold', 'rejected')),
  ADD COLUMN IF NOT EXISTS board_decided_at timestamptz,
  ADD COLUMN IF NOT EXISTS assigned_mentor_id uuid REFERENCES public.company_mentors(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS readiness_unlocked_at timestamptz,
  ADD COLUMN IF NOT EXISTS hold_activated_at timestamptz;

CREATE INDEX IF NOT EXISTS applications_selection_step_idx ON public.applications (selection_step);
CREATE INDEX IF NOT EXISTS applications_status_selection_idx ON public.applications (status, job_id);

COMMENT ON COLUMN public.applications.selection_step IS '1=Eligibility, 2=Offee, 3=Technical, 4=Motivation, 5=Board';
COMMENT ON COLUMN public.applications.eligibility_auto_checks IS 'Auto-check snapshot: university, track, english, documents';
COMMENT ON COLUMN public.applications.readiness_unlocked_at IS 'Set when mentor assigned after board Selected';

-- Backfill step entry time for existing application_complete rows
UPDATE public.applications
SET selection_step = 1,
    selection_step_entered_at = COALESCE(applied_at, now())
WHERE status::text = 'application_complete';
