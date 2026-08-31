-- GDPR foundation: consent, retention, audit, export, delete, employer isolation, retention processing.

-- ─── 1. Privacy notice versioning & consent ───────────────────────────────────

CREATE TABLE IF NOT EXISTS public.privacy_notices (
  version text PRIMARY KEY,
  title text NOT NULL DEFAULT 'Privacy Notice',
  summary text,
  published_at timestamptz NOT NULL DEFAULT now(),
  is_current boolean NOT NULL DEFAULT false
);

ALTER TABLE public.privacy_notices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS privacy_notices_public_read ON public.privacy_notices;
CREATE POLICY privacy_notices_public_read ON public.privacy_notices
  FOR SELECT TO authenticated, anon
  USING (true);

DROP POLICY IF EXISTS privacy_notices_admin_write ON public.privacy_notices;
CREATE POLICY privacy_notices_admin_write ON public.privacy_notices
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

INSERT INTO public.privacy_notices (version, title, summary, is_current)
VALUES (
  '2026-01',
  'Nordic Ascent Privacy Notice',
  'How we collect, use, and protect personal data for candidates and companies on the Nordic Ascent platform.',
  true
)
ON CONFLICT (version) DO UPDATE SET is_current = EXCLUDED.is_current;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS privacy_consent_at timestamptz,
  ADD COLUMN IF NOT EXISTS privacy_notice_version text;

COMMENT ON COLUMN public.profiles.privacy_consent_at IS 'When the user accepted the privacy notice at registration.';
COMMENT ON COLUMN public.profiles.privacy_notice_version IS 'Version of the privacy notice shown at consent.';

-- ─── 2. Retention date on candidates ──────────────────────────────────────────

ALTER TABLE public.candidates
  ADD COLUMN IF NOT EXISTS retention_date date;

COMMENT ON COLUMN public.candidates.retention_date IS 'GDPR retention deadline; admin-editable. Suggested from status via suggest_retention_date().';

CREATE OR REPLACE FUNCTION public.suggest_retention_date(p_status text)
RETURNS date
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_status IN ('rejected', 'selection_rejected', 'withdrawn') THEN (CURRENT_DATE + INTERVAL '2 years')::date
    WHEN p_status IN ('journey_complete', 'alumni') THEN (CURRENT_DATE + INTERVAL '7 years')::date
    WHEN p_status IN ('applied', 'application_complete', 'pool') THEN (CURRENT_DATE + INTERVAL '1 year')::date
    ELSE (CURRENT_DATE + INTERVAL '5 years')::date
  END;
$$;

GRANT EXECUTE ON FUNCTION public.suggest_retention_date(text) TO authenticated;

-- ─── 3. Activity logging & access anomaly flags ───────────────────────────────

CREATE TABLE IF NOT EXISTS public.access_anomaly_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  anomaly_type text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  resolved boolean NOT NULL DEFAULT false,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS access_anomaly_flags_unresolved_idx
  ON public.access_anomaly_flags (created_at DESC)
  WHERE NOT resolved;

ALTER TABLE public.access_anomaly_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS access_anomaly_flags_admin ON public.access_anomaly_flags;
CREATE POLICY access_anomaly_flags_admin ON public.access_anomaly_flags
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE OR REPLACE FUNCTION public.log_activity(
  p_action text,
  p_entity_type text,
  p_entity_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO public.activity_log (actor_id, action, entity_type, entity_id, metadata)
  VALUES (auth.uid(), p_action, p_entity_type, p_entity_id, p_metadata);

  IF p_action = 'candidate.view' AND p_entity_type = 'candidate' AND p_entity_id IS NOT NULL THEN
    PERFORM public.check_access_anomalies(auth.uid());
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_access_anomalies(p_actor_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_view_count integer;
  v_distinct_candidates integer;
BEGIN
  SELECT count(*)::integer INTO v_view_count
  FROM public.activity_log
  WHERE actor_id = p_actor_id
    AND action = 'candidate.view'
    AND created_at > now() - interval '1 hour';

  IF v_view_count >= 25 THEN
    INSERT INTO public.access_anomaly_flags (actor_id, anomaly_type, details)
    SELECT p_actor_id, 'high_volume_candidate_views', jsonb_build_object(
      'views_last_hour', v_view_count,
      'threshold', 25
    )
    WHERE NOT EXISTS (
      SELECT 1 FROM public.access_anomaly_flags
      WHERE actor_id = p_actor_id
        AND anomaly_type = 'high_volume_candidate_views'
        AND NOT resolved
        AND created_at > now() - interval '24 hours'
    );
  END IF;

  SELECT count(DISTINCT entity_id)::integer INTO v_distinct_candidates
  FROM public.activity_log
  WHERE actor_id = p_actor_id
    AND action = 'candidate.view'
    AND created_at > now() - interval '24 hours';

  IF v_distinct_candidates >= 50 THEN
    INSERT INTO public.access_anomaly_flags (actor_id, anomaly_type, details)
    SELECT p_actor_id, 'broad_candidate_sweep', jsonb_build_object(
      'distinct_candidates_24h', v_distinct_candidates,
      'threshold', 50
    )
    WHERE NOT EXISTS (
      SELECT 1 FROM public.access_anomaly_flags
      WHERE actor_id = p_actor_id
        AND anomaly_type = 'broad_candidate_sweep'
        AND NOT resolved
        AND created_at > now() - interval '24 hours'
    );
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.record_privacy_consent(p_version text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.privacy_notices WHERE version = p_version) THEN
    RAISE EXCEPTION 'Unknown privacy notice version';
  END IF;

  UPDATE public.profiles
  SET
    privacy_consent_at = now(),
    privacy_notice_version = p_version,
    updated_at = now()
  WHERE id = auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION public.get_current_privacy_notice_version()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT version FROM public.privacy_notices WHERE is_current LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.log_activity(text, text, uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_privacy_consent(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_privacy_notice_version() TO authenticated, anon;

-- ─── 4. Employer-safe application view (no internal admin notes) ──────────────

CREATE OR REPLACE VIEW public.applications_employer_safe AS
SELECT
  a.id,
  a.candidate_id,
  a.job_id,
  a.status,
  a.stage_id,
  a.match_score,
  a.needs_action,
  a.applied_at,
  a.updated_at,
  a.interview_meet_url,
  a.interview_scheduled_at,
  a.motivation_statement,
  a.track,
  a.source,
  a.academic_transcript_path,
  a.project_descriptions_text,
  a.project_descriptions_path,
  a.work_experience_path,
  a.portfolio_path,
  a.selection_step,
  a.selection_step_entered_at,
  a.eligibility_auto_checks,
  a.eligibility_decided_at,
  a.offee_technical_score,
  a.offee_open_mindedness_score,
  a.offee_assessed_at,
  a.offee_report_path,
  a.offee_decided_at,
  a.technical_digital_date,
  a.technical_digital_notes,
  a.technical_f2f_date,
  a.technical_f2f_format,
  a.technical_company_participated,
  a.technical_score,
  a.technical_cognitive_score,
  a.technical_company_feedback,
  a.technical_decided_at,
  a.motivation_session_date,
  a.motivation_format,
  a.motivation_company_participated,
  a.motivation_score,
  a.motivation_company_feedback,
  a.motivation_decided_at,
  a.board_company_decision,
  a.board_decided_at,
  a.assigned_mentor_id,
  a.readiness_unlocked_at,
  a.hold_activated_at
FROM public.applications a;

GRANT SELECT ON public.applications_employer_safe TO authenticated;

CREATE OR REPLACE VIEW public.readiness_evaluations_employer_safe AS
SELECT
  id,
  candidate_id,
  cultural_signal,
  technical_signal,
  red_flag,
  approved_for_activation,
  evaluated_at,
  created_at,
  updated_at
FROM public.readiness_evaluations;

GRANT SELECT ON public.readiness_evaluations_employer_safe TO authenticated;

-- ─── 5. Admin: correct candidate details ──────────────────────────────────────

CREATE OR REPLACE FUNCTION public.admin_correct_candidate(
  p_candidate_id uuid,
  p_profile jsonb DEFAULT '{}'::jsonb,
  p_candidate jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id uuid;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  SELECT profile_id INTO v_profile_id FROM public.candidates WHERE id = p_candidate_id;
  IF v_profile_id IS NULL THEN
    RAISE EXCEPTION 'Candidate not found';
  END IF;

  IF p_profile ? 'full_name' THEN
    UPDATE public.profiles SET full_name = NULLIF(trim(p_profile->>'full_name'), ''), updated_at = now()
    WHERE id = v_profile_id;
  END IF;
  IF p_profile ? 'email' THEN
    UPDATE public.profiles SET email = NULLIF(trim(p_profile->>'email'), ''), updated_at = now()
    WHERE id = v_profile_id;
  END IF;
  IF p_profile ? 'phone' THEN
    UPDATE public.profiles SET phone = NULLIF(trim(p_profile->>'phone'), ''), updated_at = now()
    WHERE id = v_profile_id;
  END IF;

  UPDATE public.candidates SET
    full_name = CASE WHEN p_candidate ? 'full_name' THEN NULLIF(trim(p_candidate->>'full_name'), '') ELSE full_name END,
    title = CASE WHEN p_candidate ? 'title' THEN NULLIF(trim(p_candidate->>'title'), '') ELSE title END,
    location = CASE WHEN p_candidate ? 'location' THEN NULLIF(trim(p_candidate->>'location'), '') ELSE location END,
    country = CASE WHEN p_candidate ? 'country' THEN NULLIF(trim(p_candidate->>'country'), '') ELSE country END,
    state = CASE WHEN p_candidate ? 'state' THEN NULLIF(trim(p_candidate->>'state'), '') ELSE state END,
    city = CASE WHEN p_candidate ? 'city' THEN NULLIF(trim(p_candidate->>'city'), '') ELSE city END,
    linkedin_url = CASE WHEN p_candidate ? 'linkedin_url' THEN NULLIF(trim(p_candidate->>'linkedin_url'), '') ELSE linkedin_url END,
    bio = CASE WHEN p_candidate ? 'bio' THEN NULLIF(trim(p_candidate->>'bio'), '') ELSE bio END,
    education = CASE WHEN p_candidate ? 'education' THEN NULLIF(trim(p_candidate->>'education'), '') ELSE education END,
    field_of_study = CASE WHEN p_candidate ? 'field_of_study' THEN NULLIF(trim(p_candidate->>'field_of_study'), '') ELSE field_of_study END,
    degree_type = CASE WHEN p_candidate ? 'degree_type' THEN NULLIF(trim(p_candidate->>'degree_type'), '') ELSE degree_type END,
    gpa_or_standing = CASE WHEN p_candidate ? 'gpa_or_standing' THEN NULLIF(trim(p_candidate->>'gpa_or_standing'), '') ELSE gpa_or_standing END,
    nordics_motivation = CASE WHEN p_candidate ? 'nordics_motivation' THEN NULLIF(trim(p_candidate->>'nordics_motivation'), '') ELSE nordics_motivation END,
    current_employer = CASE WHEN p_candidate ? 'current_employer' THEN NULLIF(trim(p_candidate->>'current_employer'), '') ELSE current_employer END,
    current_role_title = CASE WHEN p_candidate ? 'current_role_title' THEN NULLIF(trim(p_candidate->>'current_role_title'), '') ELSE current_role_title END,
    retention_date = CASE
      WHEN p_candidate ? 'retention_date' AND NULLIF(trim(p_candidate->>'retention_date'), '') IS NOT NULL
      THEN (p_candidate->>'retention_date')::date
      WHEN p_candidate ? 'retention_date' THEN NULL
      ELSE retention_date
    END,
    updated_at = now()
  WHERE id = p_candidate_id;

  PERFORM public.log_activity(
    'candidate.correct',
    'candidate',
    p_candidate_id,
    jsonb_build_object('fields_updated', p_profile || p_candidate)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_correct_candidate(uuid, jsonb, jsonb) TO authenticated;

-- ─── 6. Admin: full candidate export (JSON) ─────────────────────────────────────

CREATE OR REPLACE FUNCTION public.admin_export_candidate(p_candidate_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.candidates WHERE id = p_candidate_id) THEN
    RAISE EXCEPTION 'Candidate not found';
  END IF;

  SELECT jsonb_build_object(
    'exported_at', now(),
    'profile', (
      SELECT to_jsonb(p.*) FROM public.profiles p
      JOIN public.candidates c ON c.profile_id = p.id
      WHERE c.id = p_candidate_id
    ),
    'candidate', (SELECT to_jsonb(c.*) FROM public.candidates c WHERE c.id = p_candidate_id),
    'applications', COALESCE((
      SELECT jsonb_agg(to_jsonb(a.*) ORDER BY a.applied_at)
      FROM public.applications a WHERE a.candidate_id = p_candidate_id
    ), '[]'::jsonb),
    'stage_progress', COALESCE((
      SELECT jsonb_agg(to_jsonb(sp.*) ORDER BY sp.stage_id)
      FROM public.candidate_stage_progress sp WHERE sp.candidate_id = p_candidate_id
    ), '[]'::jsonb),
    'task_progress', COALESCE((
      SELECT jsonb_agg(to_jsonb(tp.*))
      FROM public.candidate_task_progress tp WHERE tp.candidate_id = p_candidate_id
    ), '[]'::jsonb),
    'readiness_attempts', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'attempt', to_jsonb(ra.*),
        'answers', COALESCE((
          SELECT jsonb_agg(to_jsonb(ans.*))
          FROM public.readiness_answers ans WHERE ans.attempt_id = ra.id
        ), '[]'::jsonb)
      ) ORDER BY ra.started_at)
      FROM public.readiness_attempts ra WHERE ra.candidate_id = p_candidate_id
    ), '[]'::jsonb),
    'readiness_evaluation', (
      SELECT to_jsonb(re.*) FROM public.readiness_evaluations re
      WHERE re.candidate_id = p_candidate_id
    ),
    'mentoring_sessions', COALESCE((
      SELECT jsonb_agg(to_jsonb(ms.*) ORDER BY ms.scheduled_at)
      FROM public.mentoring_sessions ms WHERE ms.candidate_id = p_candidate_id
    ), '[]'::jsonb),
    'issues', COALESCE((
      SELECT jsonb_agg(to_jsonb(i.*) ORDER BY i.created_at)
      FROM public.issues i WHERE i.candidate_id = p_candidate_id
    ), '[]'::jsonb),
    'followup', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'application_id', a.id,
        'touchpoints', COALESCE((
          SELECT jsonb_agg(to_jsonb(t.*) ORDER BY t.month_number)
          FROM public.followup_touchpoints t WHERE t.application_id = a.id
        ), '[]'::jsonb),
        'meeting_logs', COALESCE((
          SELECT jsonb_agg(to_jsonb(ml.*))
          FROM public.followup_meeting_logs ml WHERE ml.application_id = a.id
        ), '[]'::jsonb),
        'questionnaires', COALESCE((
          SELECT jsonb_agg(jsonb_build_object(
            'questionnaire', to_jsonb(q.*),
            'answers', COALESCE((
              SELECT jsonb_agg(to_jsonb(fa.*))
              FROM public.followup_answers fa WHERE fa.questionnaire_id = q.id
            ), '[]'::jsonb)
          ))
          FROM public.followup_questionnaires q WHERE q.application_id = a.id
        ), '[]'::jsonb)
      ))
      FROM public.applications a WHERE a.candidate_id = p_candidate_id
    ), '[]'::jsonb),
    'access_log', COALESCE((
      SELECT jsonb_agg(to_jsonb(al.*) ORDER BY al.created_at DESC)
      FROM public.activity_log al
      WHERE al.entity_type = 'candidate' AND al.entity_id = p_candidate_id
      LIMIT 500
    ), '[]'::jsonb),
    'document_paths', COALESCE((
      SELECT jsonb_agg(DISTINCT path)
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
      ) docs
    ), '[]'::jsonb)
  ) INTO v_result;

  PERFORM public.log_activity(
    'candidate.export',
    'candidate',
    p_candidate_id,
    jsonb_build_object('format', 'json')
  );

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_export_candidate(uuid) TO authenticated;

-- ─── 7. Enhanced delete (more related records + storage path list) ─────────────

DROP FUNCTION IF EXISTS public.admin_delete_candidate(uuid);

CREATE OR REPLACE FUNCTION public.admin_delete_candidate(p_candidate_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id UUID;
  v_storage_paths jsonb;
BEGIN
  IF NOT public.is_master_admin() THEN
    RAISE EXCEPTION 'Master admin access required';
  END IF;

  SELECT profile_id INTO v_profile_id
  FROM public.candidates
  WHERE id = p_candidate_id;

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
    jsonb_build_object('storage_paths', v_storage_paths)
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
    'storage_paths', v_storage_paths,
    'backup_note', 'Database rows removed. Supabase point-in-time backups are managed separately — contact ops to purge backup retention if required.'
  );
END;
$$;

-- ─── 8. Retention processing (scheduled job entry point) ──────────────────────

CREATE OR REPLACE FUNCTION public.anonymize_readiness_for_candidate(p_candidate_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.readiness_answers ans
  SET
    answer_text = NULL,
    video_path = NULL,
    updated_at = now()
  FROM public.readiness_attempts ra
  WHERE ra.id = ans.attempt_id AND ra.candidate_id = p_candidate_id;

  UPDATE public.readiness_evaluations
  SET
    evaluator_notes = NULL,
    red_flag_note = NULL,
    updated_at = now()
  WHERE candidate_id = p_candidate_id;

  UPDATE public.candidates
  SET
    full_name = 'Anonymized',
    bio = NULL,
    linkedin_url = NULL,
    cv_url = NULL,
    avatar_url = NULL,
    updated_at = now()
  WHERE id = p_candidate_id;

  UPDATE public.profiles p
  SET
    full_name = 'Anonymized',
    email = concat('anonymized+', p_candidate_id::text, '@deleted.nordicascent.local'),
    phone = NULL,
    avatar_url = NULL,
    updated_at = now()
  FROM public.candidates c
  WHERE c.profile_id = p.id AND c.id = p_candidate_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.process_expired_retention()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r record;
  v_deleted integer := 0;
  v_anonymized integer := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  FOR r IN
    SELECT c.id, c.status, c.retention_date
    FROM public.candidates c
    WHERE c.retention_date IS NOT NULL
      AND c.retention_date < CURRENT_DATE
  LOOP
    IF r.status IN ('journey_complete', 'alumni') THEN
      PERFORM public.anonymize_readiness_for_candidate(r.id);
      v_anonymized := v_anonymized + 1;
    ELSE
      PERFORM public.admin_delete_candidate(r.id);
      v_deleted := v_deleted + 1;
    END IF;
  END LOOP;

  PERFORM public.log_activity(
    'retention.process',
    'system',
    NULL,
    jsonb_build_object('deleted', v_deleted, 'anonymized', v_anonymized)
  );

  RETURN jsonb_build_object(
    'processed_at', now(),
    'deleted', v_deleted,
    'anonymized', v_anonymized
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.process_expired_retention() TO authenticated;
