-- Admin pre-arrival contract upload + SECURITY DEFINER confirm (avoids silent RLS failures).

DROP POLICY IF EXISTS documents_admin_pre_arrival_insert ON storage.objects;
CREATE POLICY documents_admin_pre_arrival_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND public.is_admin()
    AND (storage.foldername(name))[1] = 'pre-arrival'
  );

CREATE OR REPLACE FUNCTION public.confirm_pre_arrival_checkpoint(
  p_checkpoint_id uuid,
  p_application_id uuid,
  p_event_date date,
  p_notes text DEFAULT NULL,
  p_attachment_path text DEFAULT NULL,
  p_confirmed_by uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status text;
BEGIN
  IF NOT (
    public.is_admin()
    OR public.employer_can_access_application(p_application_id)
    OR p_application_id IN (
      SELECT a.id FROM applications a
      JOIN candidates c ON c.id = a.candidate_id
      WHERE c.profile_id = auth.uid()
    )
  ) THEN
    RAISE EXCEPTION 'Not authorized to confirm this checkpoint';
  END IF;

  SELECT status INTO v_status
  FROM pre_arrival_checkpoints
  WHERE id = p_checkpoint_id
    AND application_id = p_application_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Checkpoint not found';
  END IF;

  IF v_status = 'locked' THEN
    RAISE EXCEPTION 'Checkpoint is still locked — complete previous steps first';
  END IF;

  UPDATE pre_arrival_checkpoints
  SET
    status = 'completed',
    event_date = p_event_date,
    notes = NULLIF(trim(p_notes), ''),
    attachment_path = CASE
      WHEN p_attachment_path IS NOT NULL THEN p_attachment_path
      ELSE attachment_path
    END,
    confirmed_by = COALESCE(p_confirmed_by, auth.uid()),
    completed_at = now(),
    updated_at = now()
  WHERE id = p_checkpoint_id
    AND application_id = p_application_id;

  PERFORM public.refresh_pre_arrival_checkpoint_unlocks(p_application_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.confirm_pre_arrival_checkpoint(uuid, uuid, date, text, text, uuid) TO authenticated;
