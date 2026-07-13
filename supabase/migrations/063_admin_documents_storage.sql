-- Portal admins can read candidate documents in the documents bucket for eligibility review.

DROP POLICY IF EXISTS documents_admin_read ON storage.objects;
CREATE POLICY documents_admin_read ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
    )
  );
