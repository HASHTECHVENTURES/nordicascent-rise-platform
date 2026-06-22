-- University visibility toggle + admin management
ALTER TABLE public.universities
  ADD COLUMN IF NOT EXISTS is_accessible BOOLEAN NOT NULL DEFAULT true;

UPDATE public.universities SET is_accessible = true WHERE is_accessible IS NULL;

DROP POLICY IF EXISTS universities_admin_write ON public.universities;
CREATE POLICY universities_admin_write ON public.universities
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS university_waitlist_admin_update ON public.university_waitlist;
CREATE POLICY university_waitlist_admin_update ON public.university_waitlist
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS university_waitlist_admin_select ON public.university_waitlist;
CREATE POLICY university_waitlist_admin_select ON public.university_waitlist
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR candidate_id IN (SELECT id FROM public.candidates WHERE profile_id = auth.uid())
  );
