-- Job application form fields, candidate pool categories, and company mentors (Module 1).

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS motivation_statement text,
  ADD COLUMN IF NOT EXISTS track text CHECK (track IS NULL OR track IN ('entry', 'fast')),
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS academic_transcript_path text,
  ADD COLUMN IF NOT EXISTS project_descriptions_text text,
  ADD COLUMN IF NOT EXISTS project_descriptions_path text,
  ADD COLUMN IF NOT EXISTS work_experience_path text,
  ADD COLUMN IF NOT EXISTS portfolio_path text;

ALTER TABLE public.candidates
  ADD COLUMN IF NOT EXISTS pool_category text NOT NULL DEFAULT 'network'
    CHECK (pool_category IN ('active', 'waitlist', 'network', 'alumni'));

CREATE TABLE IF NOT EXISTS public.company_mentors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  role_title text,
  email text NOT NULL,
  phone text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, email)
);

CREATE INDEX IF NOT EXISTS company_mentors_company_idx ON public.company_mentors (company_id);

ALTER TABLE public.company_mentors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS company_mentors_employer_all ON public.company_mentors;
CREATE POLICY company_mentors_employer_all ON public.company_mentors
  FOR ALL TO authenticated
  USING (
    public.is_admin()
    OR company_id = public.get_my_company_id()
  )
  WITH CHECK (
    public.is_admin()
    OR company_id = public.get_my_company_id()
  );

DROP POLICY IF EXISTS company_mentors_admin_select ON public.company_mentors;
CREATE POLICY company_mentors_admin_select ON public.company_mentors
  FOR SELECT TO authenticated
  USING (public.is_admin());

COMMENT ON COLUMN public.candidates.pool_category IS 'active | waitlist | network | alumni — nobody is deleted';
COMMENT ON COLUMN public.applications.source IS 'apply | network | other';
