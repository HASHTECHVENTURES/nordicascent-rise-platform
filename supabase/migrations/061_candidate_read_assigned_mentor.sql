-- Candidates can read basic info for their assigned mentor (Module 3B banner).

DROP POLICY IF EXISTS company_mentors_candidate_assigned ON public.company_mentors;
CREATE POLICY company_mentors_candidate_assigned ON public.company_mentors
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM applications a
      JOIN candidates c ON c.id = a.candidate_id
      WHERE a.assigned_mentor_id = company_mentors.id
        AND c.profile_id = auth.uid()
    )
  );
