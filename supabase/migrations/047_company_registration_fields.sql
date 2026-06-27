-- Company registration (Sections 1–3) and initial job posting (Section 4) fields.

ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS org_number text,
  ADD COLUMN IF NOT EXISTS postal_code text,
  ADD COLUMN IF NOT EXISTS contact_name text,
  ADD COLUMN IF NOT EXISTS contact_role text,
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS contact_phone text,
  ADD COLUMN IF NOT EXISTS hired_international_before boolean,
  ADD COLUMN IF NOT EXISTS international_hiring_challenge text,
  ADD COLUMN IF NOT EXISTS workplace_language text,
  ADD COLUMN IF NOT EXISTS relocation_support text,
  ADD COLUMN IF NOT EXISTS heard_about text,
  ADD COLUMN IF NOT EXISTS registration_notes text;

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS engineering_discipline text,
  ADD COLUMN IF NOT EXISTS discipline_other text,
  ADD COLUMN IF NOT EXISTS positions_count integer,
  ADD COLUMN IF NOT EXISTS experience_level text,
  ADD COLUMN IF NOT EXISTS target_track text CHECK (target_track IS NULL OR target_track IN ('entry', 'fast')),
  ADD COLUMN IF NOT EXISTS core_skills text,
  ADD COLUMN IF NOT EXISTS desired_start_window text;
