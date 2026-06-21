-- Interview invite: DB columns + employer permissions for messaging & notifications.

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS interview_meet_url TEXT,
  ADD COLUMN IF NOT EXISTS interview_scheduled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS interview_notes TEXT;

-- Employers can notify candidates who applied to their jobs.
DROP POLICY IF EXISTS notifications_insert_employer_applicant ON public.notifications;
CREATE POLICY notifications_insert_employer_applicant ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin()
    OR user_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.candidates c
      INNER JOIN public.applications a ON a.candidate_id = c.id
      INNER JOIN public.jobs j ON j.id = a.job_id
      INNER JOIN public.employers e ON e.company_id = j.company_id
      WHERE c.profile_id = notifications.user_id
        AND e.profile_id = auth.uid()
    )
  );

-- Employers can add applicant profiles to conversations (no self-reference — avoids RLS recursion).
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
