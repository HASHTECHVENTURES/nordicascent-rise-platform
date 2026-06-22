-- Universities directory + candidate selection / waitlist
CREATE TABLE IF NOT EXISTS public.universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  institution_type TEXT NOT NULL DEFAULT 'university'
    CHECK (institution_type IN ('university', 'institute')),
  country TEXT NOT NULL DEFAULT 'India',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.universities
  ADD CONSTRAINT universities_name_type_unique UNIQUE (name, institution_type);

ALTER TABLE public.candidates
  ADD COLUMN IF NOT EXISTS university_id UUID REFERENCES public.universities(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS university_waitlist_name TEXT;

CREATE TABLE IF NOT EXISTS public.university_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  university_name TEXT NOT NULL,
  institution_type TEXT NOT NULL DEFAULT 'university'
    CHECK (institution_type IN ('university', 'institute')),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS university_waitlist_candidate_idx
  ON public.university_waitlist (candidate_id);

ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.university_waitlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS universities_select ON public.universities;
CREATE POLICY universities_select ON public.universities
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS university_waitlist_select_own ON public.university_waitlist;
CREATE POLICY university_waitlist_select_own ON public.university_waitlist
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR candidate_id IN (SELECT id FROM public.candidates WHERE profile_id = auth.uid())
  );

DROP POLICY IF EXISTS university_waitlist_insert_own ON public.university_waitlist;
CREATE POLICY university_waitlist_insert_own ON public.university_waitlist
  FOR INSERT TO authenticated
  WITH CHECK (
    candidate_id IN (SELECT id FROM public.candidates WHERE profile_id = auth.uid())
  );

INSERT INTO public.universities (name, institution_type, country) VALUES
  ('University of Mumbai', 'university', 'India'),
  ('Savitribai Phule Pune University', 'university', 'India'),
  ('Anna University', 'university', 'India'),
  ('University of Delhi', 'university', 'India'),
  ('Mumbai University (MU)', 'university', 'India'),
  ('Gujarat Technological University', 'university', 'India'),
  ('Rajiv Gandhi Proudyogiki Vishwavidyalaya', 'university', 'India'),
  ('Visvesvaraya Technological University', 'university', 'India'),
  ('Jawaharlal Nehru Technological University', 'university', 'India'),
  ('IIT Bombay', 'university', 'India'),
  ('IIT Delhi', 'university', 'India'),
  ('IIT Madras', 'university', 'India'),
  ('IIT Kharagpur', 'university', 'India'),
  ('BITS Pilani', 'university', 'India'),
  ('Vellore Institute of Technology (VIT)', 'university', 'India'),
  ('Manipal Academy of Higher Education', 'university', 'India'),
  ('SRM Institute of Science and Technology', 'university', 'India'),
  ('Amity University', 'university', 'India'),
  ('Symbiosis International University', 'university', 'India'),
  ('Mumbai Educational Trust (MET)', 'institute', 'India'),
  ('Vidyalankar Institute of Technology', 'institute', 'India'),
  ('Thadomal Shahani Engineering College', 'institute', 'India'),
  ('K. J. Somaiya College of Engineering', 'institute', 'India'),
  ('Pillai College of Engineering', 'institute', 'India'),
  ('Don Bosco Institute of Technology', 'institute', 'India'),
  ('Fr. Conceicao Rodrigues College of Engineering', 'institute', 'India'),
  ('Xavier Institute of Engineering', 'institute', 'India'),
  ('Udacity', 'institute', 'Global'),
  ('Coursera Partner Network', 'institute', 'Global')
ON CONFLICT (name, institution_type) DO NOTHING;
