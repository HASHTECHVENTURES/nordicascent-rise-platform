CREATE OR REPLACE FUNCTION get_public_config()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'candidateRegistration', COALESCE((settings->>'candidateRegistration')::boolean, true),
    'employerRegistration', COALESCE((settings->>'employerRegistration')::boolean, true),
    'maintenanceMode', COALESCE((settings->>'maintenanceMode')::boolean, false),
    'platformName', COALESCE(settings->>'platformName', 'Nordic Ascent')
  )
  FROM platform_settings
  WHERE id = 'default';
$$;

REVOKE ALL ON FUNCTION get_public_config() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_public_config() TO anon, authenticated;
