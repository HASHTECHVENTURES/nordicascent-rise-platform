-- Appendix A · Data protection §5 — erasure across backup window.
--
-- Supabase PITR / daily backups are immutable binary snapshots. There is no API
-- to scrub one candidate out of a backup. The GDPR-compliant pattern is:
--   1. Delete from the live database + storage immediately (already done).
--   2. Persist an erasure ledger OUTSIDE the database (Storage bucket
--      `erasure-ledger` — Storage objects are NOT included in DB backups).
--   3. After any backup restore, re-apply deletions from that ledger so
--      resurrected candidate rows are deleted again.
--
-- This closes the "including backups" obligation for the backup retention window
-- (default 30 days) without claiming an impossible per-record PITR purge.

-- ─── 1. Erasure ledger bucket (survives DB restore) ───────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'erasure-ledger',
  'erasure-ledger',
  false,
  1048576,
  ARRAY['application/json']::text[]
)
ON CONFLICT (id) DO UPDATE
SET public = false,
    file_size_limit = 1048576,
    allowed_mime_types = ARRAY['application/json']::text[];

DROP POLICY IF EXISTS erasure_ledger_master_select ON storage.objects;
DROP POLICY IF EXISTS erasure_ledger_master_insert ON storage.objects;
DROP POLICY IF EXISTS erasure_ledger_master_update ON storage.objects;
DROP POLICY IF EXISTS erasure_ledger_master_delete ON storage.objects;

CREATE POLICY erasure_ledger_master_select ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'erasure-ledger' AND public.is_master_admin());

CREATE POLICY erasure_ledger_master_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'erasure-ledger' AND public.is_master_admin());

CREATE POLICY erasure_ledger_master_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'erasure-ledger' AND public.is_master_admin())
  WITH CHECK (bucket_id = 'erasure-ledger' AND public.is_master_admin());

CREATE POLICY erasure_ledger_master_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'erasure-ledger' AND public.is_master_admin());

-- ─── 2. Soft re-delete (for ledger replay after restore) ──────────────────────

CREATE OR REPLACE FUNCTION public.admin_redelete_candidate_if_present(p_candidate_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_master_admin() THEN
    RAISE EXCEPTION 'Master admin access required';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.candidates WHERE id = p_candidate_id) THEN
    RETURN jsonb_build_object(
      'deleted', false,
      'candidate_id', p_candidate_id,
      'reason', 'not_present'
    );
  END IF;

  RETURN public.admin_delete_candidate(p_candidate_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_redelete_candidate_if_present(uuid) TO authenticated;

-- ─── 3. Enrich delete return payload (backup window + ledger instruction) ─────

CREATE OR REPLACE FUNCTION public.admin_delete_candidate(p_candidate_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id UUID;
  v_email text;
  v_full_name text;
  v_storage_paths jsonb;
  v_backup_window_days integer := 30;
BEGIN
  IF NOT public.is_master_admin() THEN
    RAISE EXCEPTION 'Master admin access required';
  END IF;

  SELECT c.profile_id, p.email, COALESCE(c.full_name, p.full_name)
  INTO v_profile_id, v_email, v_full_name
  FROM public.candidates c
  LEFT JOIN public.profiles p ON p.id = c.profile_id
  WHERE c.id = p_candidate_id;

  IF v_profile_id IS NULL THEN
    RAISE EXCEPTION 'Candidate not found';
  END IF;

  SELECT COALESCE(jsonb_agg(DISTINCT path), '[]'::jsonb) INTO v_storage_paths
  FROM (
    SELECT c.cv_url AS path FROM public.candidates c WHERE c.id = p_candidate_id AND c.cv_url IS NOT NULL
    UNION ALL
    SELECT a.academic_transcript_path FROM public.applications a WHERE a.candidate_id = p_candidate_id AND a.academic_transcript_path IS NOT NULL
    UNION ALL
    SELECT a.project_descriptions_path FROM public.applications a WHERE a.candidate_id = p_candidate_id AND a.project_descriptions_path IS NOT NULL
    UNION ALL
    SELECT a.work_experience_path FROM public.applications a WHERE a.candidate_id = p_candidate_id AND a.work_experience_path IS NOT NULL
    UNION ALL
    SELECT a.portfolio_path FROM public.applications a WHERE a.candidate_id = p_candidate_id AND a.portfolio_path IS NOT NULL
    UNION ALL
    SELECT a.offee_report_path FROM public.applications a WHERE a.candidate_id = p_candidate_id AND a.offee_report_path IS NOT NULL
    UNION ALL
    SELECT ans.video_path FROM public.readiness_answers ans
    JOIN public.readiness_attempts ra ON ra.id = ans.attempt_id
    WHERE ra.candidate_id = p_candidate_id AND ans.video_path IS NOT NULL
  ) docs;

  PERFORM public.log_activity(
    'candidate.delete',
    'candidate',
    p_candidate_id,
    jsonb_build_object('storage_paths', v_storage_paths, 'backup_window_days', v_backup_window_days)
  );

  DELETE FROM public.candidate_task_progress WHERE candidate_id = p_candidate_id;
  DELETE FROM public.candidate_stage_progress WHERE candidate_id = p_candidate_id;
  DELETE FROM public.readiness_evaluations WHERE candidate_id = p_candidate_id;
  DELETE FROM public.readiness_attempts WHERE candidate_id = p_candidate_id;
  DELETE FROM public.applications WHERE candidate_id = p_candidate_id;
  DELETE FROM public.mentoring_sessions WHERE candidate_id = p_candidate_id;
  DELETE FROM public.issues WHERE candidate_id = p_candidate_id;
  DELETE FROM public.university_waitlist WHERE candidate_id = p_candidate_id;
  DELETE FROM public.candidates WHERE id = p_candidate_id;

  DELETE FROM public.messages WHERE sender_id = v_profile_id;
  DELETE FROM public.conversation_participants WHERE profile_id = v_profile_id;
  DELETE FROM public.notifications WHERE user_id = v_profile_id;
  DELETE FROM public.support_tickets WHERE user_id = v_profile_id;

  DELETE FROM public.profiles WHERE id = v_profile_id;
  DELETE FROM auth.users WHERE id = v_profile_id;

  RETURN jsonb_build_object(
    'deleted', true,
    'candidate_id', p_candidate_id,
    'profile_id', v_profile_id,
    'email', v_email,
    'full_name', v_full_name,
    'storage_paths', v_storage_paths,
    'backup_window_days', v_backup_window_days,
    'backup_expires_at', (CURRENT_DATE + (v_backup_window_days || ' days')::interval)::date,
    'backup_note',
      'Live database and Platform storage deleted. An erasure ledger entry must be written to the erasure-ledger Storage bucket (outside DB backups). After any Supabase backup restore within the backup window, run admin re-apply erasures so resurrected rows are deleted again. Immutable PITR snapshots cannot be scrubbed per record.'
  );
END;
$$;
