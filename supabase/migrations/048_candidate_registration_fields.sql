-- Candidate registration steps 1–3 and university city.

ALTER TABLE public.candidates
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS field_of_study text,
  ADD COLUMN IF NOT EXISTS degree_type text,
  ADD COLUMN IF NOT EXISTS gpa_or_standing text,
  ADD COLUMN IF NOT EXISTS nordics_motivation text,
  ADD COLUMN IF NOT EXISTS expected_graduation_date text,
  ADD COLUMN IF NOT EXISTS graduation_year text,
  ADD COLUMN IF NOT EXISTS current_employer text,
  ADD COLUMN IF NOT EXISTS current_role_title text;

ALTER TABLE public.universities
  ADD COLUMN IF NOT EXISTS city text;

ALTER TABLE public.university_waitlist
  ADD COLUMN IF NOT EXISTS city text;
