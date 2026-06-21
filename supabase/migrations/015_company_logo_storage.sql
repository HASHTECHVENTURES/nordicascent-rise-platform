-- Employers upload company logos to avatars/companies/{company_id}/...
-- Existing policies only allow avatars/{auth.uid()}/...

CREATE POLICY avatars_company_upload ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = 'companies'
    AND (storage.foldername(name))[2] = get_my_company_id()::text
  );

CREATE POLICY avatars_company_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = 'companies'
    AND (storage.foldername(name))[2] = get_my_company_id()::text
  );

CREATE POLICY avatars_company_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = 'companies'
    AND (storage.foldername(name))[2] = get_my_company_id()::text
  );
