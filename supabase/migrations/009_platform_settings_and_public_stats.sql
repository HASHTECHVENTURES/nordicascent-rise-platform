-- Platform settings (single-row JSON config)
CREATE TABLE IF NOT EXISTS platform_settings (
  id text PRIMARY KEY DEFAULT 'default',
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO platform_settings (id, settings)
VALUES (
  'default',
  '{
    "platformName": "Nordic Ascent",
    "supportEmail": "support@nordicascent.com",
    "defaultLanguage": "en",
    "timezone": "cet",
    "candidateRegistration": true,
    "employerRegistration": true,
    "maintenanceMode": false,
    "primaryColor": "#2E7DFF",
    "secondaryColor": "#1B1B1B"
  }'::jsonb
)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY platform_settings_admin_all ON platform_settings
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE OR REPLACE FUNCTION get_public_stats()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'candidates', (SELECT count(*)::int FROM candidates),
    'companies', (SELECT count(*)::int FROM companies),
    'openJobs', (SELECT count(*)::int FROM jobs WHERE status = 'open')
  );
$$;

REVOKE ALL ON FUNCTION get_public_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_public_stats() TO anon, authenticated;
