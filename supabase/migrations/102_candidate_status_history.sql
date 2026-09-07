-- Appendix A · Core §3 — Candidate status history.
-- Records every status transition (from, to, actor, timestamp) so the admin
-- can see a "status changed from X to Y on <date> by <user>" timeline, rather
-- than only the current status.

-- ─── 1. History table ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.candidate_status_history (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  from_status  text,
  to_status    text NOT NULL,
  changed_by   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  changed_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_candidate_status_history_candidate
  ON public.candidate_status_history (candidate_id, changed_at DESC);

COMMENT ON TABLE public.candidate_status_history IS
  'Appendix A Core §3 — append-only log of candidate status transitions for the admin timeline.';

-- ─── 2. RLS (admins read; writes only via trigger) ────────────────────────────

ALTER TABLE public.candidate_status_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS candidate_status_history_admin_read ON public.candidate_status_history;
CREATE POLICY candidate_status_history_admin_read ON public.candidate_status_history
  FOR SELECT
  USING (public.is_admin());

GRANT SELECT ON public.candidate_status_history TO authenticated;

-- ─── 3. Trigger to capture transitions ────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.record_candidate_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.candidate_status_history (candidate_id, from_status, to_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_candidate_status_change ON public.candidates;
CREATE TRIGGER trg_candidate_status_change
  AFTER UPDATE OF status ON public.candidates
  FOR EACH ROW
  EXECUTE FUNCTION public.record_candidate_status_change();

-- ─── 4. Backfill a baseline entry for existing candidates ─────────────────────
-- Seeds one "current status" row per candidate so the timeline is not empty for
-- records that existed before this feature. Uses the candidate's created_at.

INSERT INTO public.candidate_status_history (candidate_id, from_status, to_status, changed_by, changed_at)
SELECT c.id, NULL, c.status, NULL, c.created_at
FROM public.candidates c
WHERE NOT EXISTS (
  SELECT 1 FROM public.candidate_status_history h WHERE h.candidate_id = c.id
);
