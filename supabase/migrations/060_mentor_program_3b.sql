-- Module 3B: structured mentor meetings, observations, signal & activation notes.

CREATE TABLE IF NOT EXISTS public.mentor_meeting_themes (
  meeting_number smallint PRIMARY KEY CHECK (meeting_number BETWEEN 1 AND 6),
  phase text NOT NULL CHECK (phase IN ('readiness', 'activation')),
  title text NOT NULL,
  theme_body text NOT NULL,
  sort_order smallint NOT NULL,
  active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mentor_program_meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  meeting_number smallint NOT NULL CHECK (meeting_number BETWEEN 1 AND 6),
  phase text NOT NULL CHECK (phase IN ('readiness', 'activation')),
  status text NOT NULL DEFAULT 'locked'
    CHECK (status IN ('locked', 'available', 'completed', 'not_applicable')),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (application_id, meeting_number)
);

CREATE INDEX IF NOT EXISTS mentor_program_meetings_app_idx
  ON public.mentor_program_meetings (application_id, meeting_number);

CREATE TABLE IF NOT EXISTS public.mentor_meeting_observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid NOT NULL REFERENCES public.mentor_program_meetings(id) ON DELETE CASCADE UNIQUE,
  meeting_date date NOT NULL,
  duration_minutes int NOT NULL CHECK (duration_minutes > 0),
  key_observations text NOT NULL,
  concerns text,
  submitted_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  submitted_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mentor_signal_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE UNIQUE,
  communication_clarity text NOT NULL,
  thinking_structure text NOT NULL,
  collaboration_readiness text NOT NULL,
  cultural_alignment_signals text NOT NULL,
  red_flag boolean NOT NULL DEFAULT false,
  red_flag_note text,
  submitted_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mentor_activation_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE UNIQUE,
  behavioural_observations text NOT NULL,
  communication_quality text NOT NULL,
  collaboration_signals text NOT NULL,
  perceived_strengths text NOT NULL,
  perceived_risks text NOT NULL,
  submitted_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Seed meeting themes (CMS defaults)
INSERT INTO public.mentor_meeting_themes (meeting_number, phase, title, theme_body, sort_order) VALUES
  (1, 'readiness', 'Introduction and mindset',
   'Getting to know the candidate, work mindset, communication style, and expectations for Nordic collaboration.',
   1),
  (2, 'readiness', 'Readiness & scenario reflection',
   'How they approached scenarios, reasoning style, confidence vs uncertainty, handling disagreement and feedback, cultural self-awareness.',
   2),
  (3, 'readiness', 'Final reflection',
   'Candidate self-assessment, mentor perception summary, open questions, alignment on next steps — before Go/No-Go.',
   3),
  (4, 'activation', 'Early experience',
   'Onboarding experience, clarity of tasks and expectations, first impressions of the team.',
   4),
  (5, 'activation', 'Work reflection',
   'Handling real tasks, communication within the team, ownership vs waiting, handling feedback.',
   5),
  (6, 'activation', 'Final reflection',
   'Overall experience, strengths, challenges/risks, readiness for full employment — before Go/No-Go.',
   6)
ON CONFLICT (meeting_number) DO UPDATE SET
  title = EXCLUDED.title,
  theme_body = EXCLUDED.theme_body,
  updated_at = now();

ALTER TABLE public.mentor_meeting_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_program_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_meeting_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_signal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_activation_notes ENABLE ROW LEVEL SECURITY;

-- Themes: readable by all authenticated
DROP POLICY IF EXISTS mentor_meeting_themes_read ON public.mentor_meeting_themes;
CREATE POLICY mentor_meeting_themes_read ON public.mentor_meeting_themes
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS mentor_meeting_themes_admin ON public.mentor_meeting_themes;
CREATE POLICY mentor_meeting_themes_admin ON public.mentor_meeting_themes
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Helper: employer can access application via job
CREATE OR REPLACE FUNCTION public.employer_can_access_application(p_application_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM applications a
    JOIN jobs j ON j.id = a.job_id
    JOIN employers e ON e.company_id = j.company_id
    WHERE a.id = p_application_id
      AND e.profile_id = auth.uid()
  );
$$;

-- Meetings
DROP POLICY IF EXISTS mentor_program_meetings_select ON public.mentor_program_meetings;
CREATE POLICY mentor_program_meetings_select ON public.mentor_program_meetings
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR public.employer_can_access_application(application_id)
    OR application_id IN (
      SELECT a.id FROM applications a
      JOIN candidates c ON c.id = a.candidate_id
      WHERE c.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS mentor_program_meetings_write ON public.mentor_program_meetings;
CREATE POLICY mentor_program_meetings_write ON public.mentor_program_meetings
  FOR ALL TO authenticated
  USING (public.is_admin() OR public.employer_can_access_application(application_id))
  WITH CHECK (public.is_admin() OR public.employer_can_access_application(application_id));

-- Observations (employer/admin write; candidate cannot read)
DROP POLICY IF EXISTS mentor_meeting_observations_select ON public.mentor_meeting_observations;
CREATE POLICY mentor_meeting_observations_select ON public.mentor_meeting_observations
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM mentor_program_meetings m
      WHERE m.id = meeting_id
        AND public.employer_can_access_application(m.application_id)
    )
  );

DROP POLICY IF EXISTS mentor_meeting_observations_write ON public.mentor_meeting_observations;
CREATE POLICY mentor_meeting_observations_write ON public.mentor_meeting_observations
  FOR ALL TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM mentor_program_meetings m
      WHERE m.id = meeting_id
        AND public.employer_can_access_application(m.application_id)
    )
  )
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM mentor_program_meetings m
      WHERE m.id = meeting_id
        AND public.employer_can_access_application(m.application_id)
    )
  );

-- Signal notes: admin + employer read; employer/admin write
DROP POLICY IF EXISTS mentor_signal_notes_select ON public.mentor_signal_notes;
CREATE POLICY mentor_signal_notes_select ON public.mentor_signal_notes
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR public.employer_can_access_application(application_id)
  );

DROP POLICY IF EXISTS mentor_signal_notes_write ON public.mentor_signal_notes;
CREATE POLICY mentor_signal_notes_write ON public.mentor_signal_notes
  FOR ALL TO authenticated
  USING (public.is_admin() OR public.employer_can_access_application(application_id))
  WITH CHECK (public.is_admin() OR public.employer_can_access_application(application_id));

-- Activation notes: same as signal
DROP POLICY IF EXISTS mentor_activation_notes_select ON public.mentor_activation_notes;
CREATE POLICY mentor_activation_notes_select ON public.mentor_activation_notes
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR public.employer_can_access_application(application_id)
  );

DROP POLICY IF EXISTS mentor_activation_notes_write ON public.mentor_activation_notes;
CREATE POLICY mentor_activation_notes_write ON public.mentor_activation_notes
  FOR ALL TO authenticated
  USING (public.is_admin() OR public.employer_can_access_application(application_id))
  WITH CHECK (public.is_admin() OR public.employer_can_access_application(application_id));

-- Employer can assign mentor on selected applications
DROP POLICY IF EXISTS applications_employer_assign_mentor ON public.applications;
CREATE POLICY applications_employer_assign_mentor ON public.applications
  FOR UPDATE TO authenticated
  USING (
    public.employer_can_access_application(id)
    AND status IN ('selected_for_readiness', 'readiness_active')
  )
  WITH CHECK (
    public.employer_can_access_application(id)
  );
