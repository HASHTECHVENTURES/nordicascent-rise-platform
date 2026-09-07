-- Appendix A · Integrations §4 — pipeline-wide export.
-- Returns every application across all stages in one flat result so an admin can
-- export the whole pipeline as a single CSV (not just the candidate list).
-- Admin-only; SECURITY DEFINER so it can read across RLS-protected tables.

CREATE OR REPLACE FUNCTION public.admin_export_pipeline()
RETURNS TABLE (
  application_id   uuid,
  candidate_name   text,
  candidate_email  text,
  job_title        text,
  company_name     text,
  track            text,
  stage            text,
  status           text,
  selection_step   integer,
  applied_at       timestamptz,
  updated_at       timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin only';
  END IF;

  RETURN QUERY
  SELECT
    a.id,
    COALESCE(c.full_name, p.full_name),
    p.email,
    j.title,
    co.name,
    a.track,
    a.stage_id,
    a.status::text,
    a.selection_step,
    a.applied_at,
    a.updated_at
  FROM public.applications a
  LEFT JOIN public.candidates c ON c.id = a.candidate_id
  LEFT JOIN public.profiles   p ON p.id = c.profile_id
  LEFT JOIN public.jobs       j ON j.id = a.job_id
  LEFT JOIN public.companies  co ON co.id = j.company_id
  ORDER BY a.applied_at DESC NULLS LAST;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_export_pipeline() TO authenticated;
