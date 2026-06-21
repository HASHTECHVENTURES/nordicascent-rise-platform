-- Fix infinite recursion in conversation_participants INSERT policy (migration 022).

DROP POLICY IF EXISTS conversation_participants_insert_employer_applicant ON public.conversation_participants;

CREATE POLICY conversation_participants_insert_employer_applicant ON public.conversation_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    profile_id = auth.uid()
    OR public.is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.employers e
      INNER JOIN public.jobs j ON j.company_id = e.company_id
      INNER JOIN public.applications a ON a.job_id = j.id
      INNER JOIN public.candidates c ON c.id = a.candidate_id
      WHERE e.profile_id = auth.uid()
        AND c.profile_id = conversation_participants.profile_id
    )
  );
