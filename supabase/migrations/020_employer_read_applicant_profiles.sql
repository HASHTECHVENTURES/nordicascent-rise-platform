-- Employers see applicant name and photo on Candidates.
-- Denormalize profile fields onto candidates (employers can already read candidates).

ALTER TABLE public.candidates
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS avatar_url text;

UPDATE public.candidates c
SET
  full_name = COALESCE(c.full_name, p.full_name),
  avatar_url = COALESCE(c.avatar_url, p.avatar_url)
FROM public.profiles p
WHERE p.id = c.profile_id;

CREATE OR REPLACE FUNCTION public.sync_candidate_profile_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.candidates
  SET
    full_name = NEW.full_name,
    avatar_url = NEW.avatar_url
  WHERE profile_id = NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_sync_candidate_display ON public.profiles;
CREATE TRIGGER profiles_sync_candidate_display
  AFTER INSERT OR UPDATE OF full_name, avatar_url ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_candidate_profile_fields();

DROP POLICY IF EXISTS profiles_select_employer_applicants ON public.profiles;
CREATE POLICY profiles_select_employer_applicants ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      INNER JOIN public.applications a ON a.candidate_id = c.id
      INNER JOIN public.jobs j ON j.id = a.job_id
      INNER JOIN public.employers e ON e.company_id = j.company_id
      WHERE c.profile_id = profiles.id
        AND e.profile_id = auth.uid()
    )
  );
