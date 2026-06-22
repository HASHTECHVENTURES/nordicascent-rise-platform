-- =============================================================================
-- RESUME migration (run this if 036 failed on universities_name_type_unique)
-- Universities already exist — continues with mentoring + readiness + pipeline
-- =============================================================================

-- ─── Mentoring sessions (admin-scheduled) ───────────────────────────────────

CREATE TABLE IF NOT EXISTS public.mentoring_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes TEXT,
  meeting_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS mentoring_sessions_candidate_idx
  ON public.mentoring_sessions (candidate_id, scheduled_at);

CREATE INDEX IF NOT EXISTS mentoring_sessions_mentor_idx
  ON public.mentoring_sessions (mentor_id, scheduled_at);

ALTER TABLE public.mentoring_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS mentoring_sessions_select ON public.mentoring_sessions;
CREATE POLICY mentoring_sessions_select ON public.mentoring_sessions
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR mentor_id = auth.uid()
    OR candidate_id IN (SELECT id FROM public.candidates WHERE profile_id = auth.uid())
  );

DROP POLICY IF EXISTS mentoring_sessions_insert ON public.mentoring_sessions;
CREATE POLICY mentoring_sessions_insert ON public.mentoring_sessions
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() OR mentor_id = auth.uid());

DROP POLICY IF EXISTS mentoring_sessions_update ON public.mentoring_sessions;
CREATE POLICY mentoring_sessions_update ON public.mentoring_sessions
  FOR UPDATE TO authenticated
  USING (public.is_admin() OR mentor_id = auth.uid())
  WITH CHECK (public.is_admin() OR mentor_id = auth.uid());

DROP POLICY IF EXISTS mentoring_sessions_delete ON public.mentoring_sessions;
CREATE POLICY mentoring_sessions_delete ON public.mentoring_sessions
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- ─── Module 3: Readiness Q&A ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.readiness_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area TEXT NOT NULL CHECK (area IN ('cultural_social', 'technical')),
  level SMALLINT NOT NULL CHECK (level BETWEEN 1 AND 3),
  title TEXT NOT NULL,
  subtitle TEXT,
  intro_body TEXT,
  timer_minutes INT NOT NULL DEFAULT 60,
  timer_hard BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (area, level)
);

CREATE TABLE IF NOT EXISTS public.readiness_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES public.readiness_tests(id) ON DELETE CASCADE,
  scenario_label TEXT,
  prompt TEXT NOT NULL,
  answer_type TEXT NOT NULL DEFAULT 'long'
    CHECK (answer_type IN ('short', 'long', 'bullets', 'video')),
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS readiness_questions_test_idx ON public.readiness_questions (test_id, sort_order);

CREATE TABLE IF NOT EXISTS public.readiness_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  test_id UUID NOT NULL REFERENCES public.readiness_tests(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('in_progress', 'submitted', 'expired')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (candidate_id, test_id)
);

CREATE INDEX IF NOT EXISTS readiness_attempts_candidate_idx ON public.readiness_attempts (candidate_id);

CREATE TABLE IF NOT EXISTS public.readiness_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES public.readiness_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.readiness_questions(id) ON DELETE CASCADE,
  answer_text TEXT,
  video_path TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (attempt_id, question_id)
);

CREATE TABLE IF NOT EXISTS public.readiness_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE UNIQUE,
  cultural_signal TEXT CHECK (cultural_signal IN ('strong', 'acceptable', 'weak')),
  technical_signal TEXT CHECK (technical_signal IN ('strong', 'acceptable', 'weak')),
  red_flag BOOLEAN NOT NULL DEFAULT false,
  red_flag_note TEXT,
  evaluator_notes TEXT,
  evaluated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  evaluated_at TIMESTAMPTZ,
  approved_for_activation BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.readiness_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readiness_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readiness_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readiness_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readiness_evaluations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS readiness_tests_select ON public.readiness_tests;
CREATE POLICY readiness_tests_select ON public.readiness_tests
  FOR SELECT TO authenticated USING (active OR public.is_admin());

DROP POLICY IF EXISTS readiness_tests_admin ON public.readiness_tests;
CREATE POLICY readiness_tests_admin ON public.readiness_tests
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS readiness_questions_select ON public.readiness_questions;
CREATE POLICY readiness_questions_select ON public.readiness_questions
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS readiness_questions_admin ON public.readiness_questions;
CREATE POLICY readiness_questions_admin ON public.readiness_questions
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS readiness_attempts_select ON public.readiness_attempts;
CREATE POLICY readiness_attempts_select ON public.readiness_attempts
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR candidate_id IN (SELECT id FROM public.candidates WHERE profile_id = auth.uid())
  );

DROP POLICY IF EXISTS readiness_attempts_insert ON public.readiness_attempts;
CREATE POLICY readiness_attempts_insert ON public.readiness_attempts
  FOR INSERT TO authenticated
  WITH CHECK (
    candidate_id IN (SELECT id FROM public.candidates WHERE profile_id = auth.uid())
  );

DROP POLICY IF EXISTS readiness_attempts_update ON public.readiness_attempts;
CREATE POLICY readiness_attempts_update ON public.readiness_attempts
  FOR UPDATE TO authenticated
  USING (
    public.is_admin()
    OR (
      candidate_id IN (SELECT id FROM public.candidates WHERE profile_id = auth.uid())
      AND status = 'in_progress'
    )
  )
  WITH CHECK (
    public.is_admin()
    OR candidate_id IN (SELECT id FROM public.candidates WHERE profile_id = auth.uid())
  );

DROP POLICY IF EXISTS readiness_attempts_admin ON public.readiness_attempts;
CREATE POLICY readiness_attempts_admin ON public.readiness_attempts
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS readiness_answers_select ON public.readiness_answers;
CREATE POLICY readiness_answers_select ON public.readiness_answers
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR attempt_id IN (
      SELECT ra.id FROM public.readiness_attempts ra
      JOIN public.candidates c ON c.id = ra.candidate_id
      WHERE c.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS readiness_answers_write ON public.readiness_answers;
CREATE POLICY readiness_answers_write ON public.readiness_answers
  FOR INSERT TO authenticated
  WITH CHECK (
    attempt_id IN (
      SELECT ra.id FROM public.readiness_attempts ra
      JOIN public.candidates c ON c.id = ra.candidate_id
      WHERE c.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS readiness_answers_update ON public.readiness_answers;
CREATE POLICY readiness_answers_update ON public.readiness_answers
  FOR UPDATE TO authenticated
  USING (
    attempt_id IN (
      SELECT ra.id FROM public.readiness_attempts ra
      JOIN public.candidates c ON c.id = ra.candidate_id
      WHERE c.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS readiness_answers_admin ON public.readiness_answers;
CREATE POLICY readiness_answers_admin ON public.readiness_answers
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS readiness_evaluations_select ON public.readiness_evaluations;
CREATE POLICY readiness_evaluations_select ON public.readiness_evaluations
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR candidate_id IN (SELECT id FROM public.candidates WHERE profile_id = auth.uid())
  );

DROP POLICY IF EXISTS readiness_evaluations_admin ON public.readiness_evaluations;
CREATE POLICY readiness_evaluations_admin ON public.readiness_evaluations
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS documents_readiness_upload ON storage.objects;
CREATE POLICY documents_readiness_upload ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = 'readiness'
    AND (storage.foldername(name))[2] IN (
      SELECT id::text FROM public.candidates WHERE profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS documents_readiness_read ON storage.objects;
CREATE POLICY documents_readiness_read ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'documents'
    AND (
      public.is_admin()
      OR (storage.foldername(name))[1] = 'readiness'
        AND (storage.foldername(name))[2] IN (
          SELECT id::text FROM public.candidates WHERE profile_id = auth.uid()
        )
    )
  );

-- ─── Mentoring pipeline stage ────────────────────────────────────────────────

INSERT INTO public.pipeline_stages (id, name, sort_order, description)
SELECT
  'mentoring',
  'Mentoring',
  COALESCE((SELECT sort_order FROM public.pipeline_stages WHERE id = 'readiness'), 3) + 1,
  'Mentor support after Readiness validation'
WHERE NOT EXISTS (SELECT 1 FROM public.pipeline_stages WHERE id = 'mentoring');

UPDATE public.pipeline_stages
SET sort_order = COALESCE((SELECT sort_order FROM public.pipeline_stages WHERE id = 'mentoring'), 4) + 1
WHERE id = 'selection'
  AND EXISTS (SELECT 1 FROM public.pipeline_stages WHERE id = 'mentoring');
