-- Appendix A · Core §10 — unified internal notes.
-- Aggregates the internal (admin-only) notes that are scattered across the
-- selection, readiness, mentoring and follow-up workflow steps into a single
-- admin-only feed for the candidate record. Employer/candidate-facing views are
-- unaffected (this reads the raw tables, not the *_employer_safe views).

CREATE OR REPLACE FUNCTION public.admin_candidate_internal_notes(p_candidate_id uuid)
RETURNS TABLE (
  stage    text,
  label    text,
  note     text,
  noted_at timestamptz
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
  -- Selection notes (per application)
  SELECT 'Selection', 'Eligibility notes', a.eligibility_admin_notes,
         COALESCE(a.eligibility_decided_at, a.applied_at)
  FROM public.applications a
  WHERE a.candidate_id = p_candidate_id AND NULLIF(TRIM(a.eligibility_admin_notes), '') IS NOT NULL
  UNION ALL
  SELECT 'Selection', 'Offee notes', a.offee_notes,
         COALESCE(a.offee_decided_at, a.applied_at)
  FROM public.applications a
  WHERE a.candidate_id = p_candidate_id AND NULLIF(TRIM(a.offee_notes), '') IS NOT NULL
  UNION ALL
  SELECT 'Selection', 'Technical assessor notes', a.technical_assessor_notes,
         COALESCE(a.technical_decided_at, a.applied_at)
  FROM public.applications a
  WHERE a.candidate_id = p_candidate_id AND NULLIF(TRIM(a.technical_assessor_notes), '') IS NOT NULL
  UNION ALL
  SELECT 'Selection', 'Motivation notes', a.motivation_session_notes,
         COALESCE(a.motivation_decided_at, a.applied_at)
  FROM public.applications a
  WHERE a.candidate_id = p_candidate_id AND NULLIF(TRIM(a.motivation_session_notes), '') IS NOT NULL
  UNION ALL
  SELECT 'Selection', 'Board reason', a.board_admin_reason,
         COALESCE(a.board_decided_at, a.applied_at)
  FROM public.applications a
  WHERE a.candidate_id = p_candidate_id AND NULLIF(TRIM(a.board_admin_reason), '') IS NOT NULL
  UNION ALL
  -- Readiness notes (per candidate)
  SELECT 'Readiness', 'Evaluator notes', re.evaluator_notes, re.evaluated_at
  FROM public.readiness_evaluations re
  WHERE re.candidate_id = p_candidate_id AND NULLIF(TRIM(re.evaluator_notes), '') IS NOT NULL
  UNION ALL
  SELECT 'Readiness', 'Red flag', re.red_flag_note, re.evaluated_at
  FROM public.readiness_evaluations re
  WHERE re.candidate_id = p_candidate_id AND re.red_flag AND NULLIF(TRIM(re.red_flag_note), '') IS NOT NULL
  UNION ALL
  -- Mentoring signals (per application)
  SELECT 'Mentoring', 'Mentor red flag', ms.red_flag_note, ms.submitted_at
  FROM public.mentor_signal_notes ms
  JOIN public.applications a ON a.id = ms.application_id
  WHERE a.candidate_id = p_candidate_id AND NULLIF(TRIM(ms.red_flag_note), '') IS NOT NULL
  UNION ALL
  -- Follow-up notes (per application)
  SELECT 'Follow-up', 'Confidential notes', fl.confidential_notes, fl.logged_at
  FROM public.followup_meeting_logs fl
  JOIN public.applications a ON a.id = fl.application_id
  WHERE a.candidate_id = p_candidate_id AND NULLIF(TRIM(fl.confidential_notes), '') IS NOT NULL
  ORDER BY 4 DESC NULLS LAST;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_candidate_internal_notes(uuid) TO authenticated;
