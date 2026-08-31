-- GDPR cron schedule + consent/retention backfill for existing accounts.

-- ─── Internal retention runner (no auth — for pg_cron) ───────────────────────

CREATE OR REPLACE FUNCTION public.run_retention_processing()
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

  INSERT INTO public.activity_log (actor_id, action, entity_type, entity_id, metadata)
  VALUES (
    NULL,
    'retention.process',
    'system',
    NULL,
    jsonb_build_object('deleted', v_deleted, 'anonymized', v_anonymized, 'source', 'cron')
  );

  RETURN jsonb_build_object(
    'processed_at', now(),
    'deleted', v_deleted,
    'anonymized', v_anonymized,
    'source', 'cron'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.run_retention_processing() FROM PUBLIC;

-- Admin/manual trigger delegates to the same runner.
CREATE OR REPLACE FUNCTION public.process_expired_retention()
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

  v_result := public.run_retention_processing();

  UPDATE public.activity_log
  SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('source', 'admin_manual')
  WHERE id = (
    SELECT id FROM public.activity_log
    WHERE action = 'retention.process'
    ORDER BY created_at DESC
    LIMIT 1
  );

  RETURN v_result || jsonb_build_object('source', 'admin_manual');
END;
$$;

GRANT EXECUTE ON FUNCTION public.process_expired_retention() TO authenticated;

-- ─── Consent status helper ────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.needs_privacy_consent()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (
          p.privacy_consent_at IS NULL
          OR p.privacy_notice_version IS DISTINCT FROM (
            SELECT pn.version FROM public.privacy_notices pn WHERE pn.is_current LIMIT 1
          )
        )
    );
$$;

GRANT EXECUTE ON FUNCTION public.needs_privacy_consent() TO authenticated;

-- ─── Backfill existing accounts ───────────────────────────────────────────────

UPDATE public.profiles
SET
  privacy_consent_at = COALESCE(privacy_consent_at, created_at),
  privacy_notice_version = COALESCE(privacy_notice_version, '2026-01'),
  updated_at = now()
WHERE privacy_consent_at IS NULL
   OR privacy_notice_version IS NULL;

UPDATE public.candidates c
SET
  retention_date = public.suggest_retention_date(c.status::text),
  updated_at = now()
WHERE c.retention_date IS NULL;

INSERT INTO public.activity_log (actor_id, action, entity_type, entity_id, metadata)
SELECT
  NULL,
  'gdpr.backfill',
  'system',
  NULL,
  jsonb_build_object(
    'profiles_backfilled', (SELECT count(*) FROM public.profiles WHERE privacy_notice_version = '2026-01'),
    'candidates_retention_set', (SELECT count(*) FROM public.candidates WHERE retention_date IS NOT NULL)
  )
WHERE NOT EXISTS (
  SELECT 1 FROM public.activity_log WHERE action = 'gdpr.backfill'
);

-- ─── Daily retention cron (03:00 UTC) ─────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

DO $$
DECLARE
  v_job_id bigint;
BEGIN
  SELECT jobid INTO v_job_id FROM cron.job WHERE jobname = 'gdpr-retention-daily' LIMIT 1;
  IF v_job_id IS NOT NULL THEN
    PERFORM cron.unschedule(v_job_id);
  END IF;

  PERFORM cron.schedule(
    'gdpr-retention-daily',
    '0 3 * * *',
    $cron$SELECT public.run_retention_processing()$cron$
  );
END;
$$;

COMMENT ON FUNCTION public.run_retention_processing IS 'GDPR retention job entry point for pg_cron. Runs daily at 03:00 UTC.';
