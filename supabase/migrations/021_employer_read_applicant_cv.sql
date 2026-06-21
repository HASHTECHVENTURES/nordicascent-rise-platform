-- Employers can download CVs for candidates who applied to their jobs.

DROP POLICY IF EXISTS documents_employer_read_applicant ON storage.objects;
CREATE POLICY documents_employer_read_applicant ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND EXISTS (
      SELECT 1
      FROM public.candidates c
      INNER JOIN public.applications a ON a.candidate_id = c.id
      INNER JOIN public.jobs j ON j.id = a.job_id
      INNER JOIN public.employers e ON e.company_id = j.company_id
      WHERE e.profile_id = auth.uid()
        AND c.profile_id::text = (storage.foldername(name))[1]
    )
  );
