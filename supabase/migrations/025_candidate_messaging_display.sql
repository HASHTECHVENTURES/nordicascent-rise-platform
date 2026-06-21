-- Candidates can read employer profiles for companies they applied to (Messages, etc.).

DROP POLICY IF EXISTS profiles_select_candidate_employers ON public.profiles;
CREATE POLICY profiles_select_candidate_employers ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      INNER JOIN public.applications a ON a.candidate_id = c.id
      INNER JOIN public.jobs j ON j.id = a.job_id
      INNER JOIN public.employers e ON e.company_id = j.company_id
      WHERE c.profile_id = auth.uid()
        AND e.profile_id = profiles.id
    )
  );

-- Anyone can read profiles of people they share a conversation with.
DROP POLICY IF EXISTS profiles_select_conversation_partners ON public.profiles;
CREATE POLICY profiles_select_conversation_partners ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.conversation_participants cp1
      INNER JOIN public.conversation_participants cp2
        ON cp2.conversation_id = cp1.conversation_id
      WHERE cp1.profile_id = auth.uid()
        AND cp2.profile_id = profiles.id
    )
  );

-- Candidates can read employer rows for companies they applied to (company name + logo).
DROP POLICY IF EXISTS employers_select_candidate_applied ON public.employers;
CREATE POLICY employers_select_candidate_applied ON public.employers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      INNER JOIN public.applications a ON a.candidate_id = c.id
      INNER JOIN public.jobs j ON j.id = a.job_id
      WHERE c.profile_id = auth.uid()
        AND j.company_id = employers.company_id
    )
  );
