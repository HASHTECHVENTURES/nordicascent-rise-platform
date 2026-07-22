-- Final Clearance → Relocation handoff must not silently stall:
-- employer cannot update candidate_stage_progress (RLS), and client-side
-- relocation_steps seed can fail after status is already set to relocation.

CREATE OR REPLACE FUNCTION public.initialize_relocation_after_clearance(
  p_application_id uuid,
  p_clearance_date date DEFAULT CURRENT_DATE
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_candidate_id uuid;
  v_app_status text;
  v_clearance date := COALESCE(p_clearance_date, CURRENT_DATE);
  v_now timestamptz := now();
  v_titles text[] := ARRAY[
    'Contract signed, process initiated',
    'Visa / immigration',
    'Norwegian A1 begins',
    'Pre-arrival preparation',
    'Housing',
    'Admin setup (D-number, tax, bank)',
    'Family support',
    'Buddy (INDONORD)',
    'Final prep + employer toolkit',
    'Arrival confirmed'
  ];
  v_owners text[] := ARRAY[
    'nordic_ascent',
    'relocation_partner',
    'language_partner',
    'relocation_partner',
    'real_estate',
    'relocation_partner',
    'nordic_ascent',
    'nordic_ascent',
    'nordic_ascent',
    'none'
  ];
  i int;
BEGIN
  IF NOT (
    public.is_admin()
    OR public.employer_can_access_application(p_application_id)
    OR public.candidate_owns_application(p_application_id)
  ) THEN
    RAISE EXCEPTION 'Not allowed to initialize relocation for this application';
  END IF;

  SELECT a.candidate_id, a.status
  INTO v_candidate_id, v_app_status
  FROM applications a
  WHERE a.id = p_application_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  -- Seed 10 steps (idempotent)
  FOR i IN 1..10 LOOP
    INSERT INTO relocation_steps (
      application_id, step_number, title, owner_layer, state, target_due_date
    )
    VALUES (
      p_application_id,
      i,
      v_titles[i],
      v_owners[i],
      'on_track',
      CASE
        WHEN i = 1 THEN v_clearance
        WHEN i IN (2, 4) THEN v_clearance + 21
        WHEN i = 3 THEN v_clearance + 14
        ELSE NULL
      END
    )
    ON CONFLICT (application_id, step_number) DO NOTHING;
  END LOOP;

  UPDATE activation_records
  SET
    status = CASE
      WHEN status IN ('cleared', 'rejected_activation') THEN status
      ELSE 'cleared'
    END,
    final_clearance_date = COALESCE(final_clearance_date, v_clearance),
    relocation_status = COALESCE(relocation_status, 'relocation_active'),
    updated_at = v_now
  WHERE application_id = p_application_id;

  IF NOT FOUND THEN
    INSERT INTO activation_records (
      application_id, status, final_clearance_date, relocation_status, updated_at
    )
    VALUES (
      p_application_id, 'cleared', v_clearance, 'relocation_active', v_now
    );
  END IF;

  -- Application journey status
  IF v_app_status IS DISTINCT FROM 'relocation'
     AND v_app_status IS DISTINCT FROM 'onboarding'
     AND v_app_status IS DISTINCT FROM 'followup'
     AND v_app_status IS DISTINCT FROM 'journey_complete' THEN
    UPDATE applications
    SET status = 'relocation', updated_at = v_now
    WHERE id = p_application_id;
  END IF;

  -- Stage progress: employers cannot update this under normal RLS
  UPDATE candidate_stage_progress
  SET status = 'completed', completed_at = COALESCE(completed_at, v_now)
  WHERE candidate_id = v_candidate_id
    AND stage_id IN ('internship', 'selection')
    AND status <> 'completed';

  -- Activation stays active until pre-arrival completes; if already done, complete it
  IF EXISTS (
    SELECT 1 FROM activation_records
    WHERE application_id = p_application_id
      AND pre_arrival_completed_at IS NOT NULL
  ) THEN
    UPDATE candidate_stage_progress
    SET status = 'completed', completed_at = COALESCE(completed_at, v_now)
    WHERE candidate_id = v_candidate_id
      AND stage_id = 'activation'
      AND status <> 'completed';

    IF NOT FOUND THEN
      INSERT INTO candidate_stage_progress (candidate_id, stage_id, status, started_at, completed_at)
      VALUES (v_candidate_id, 'activation', 'completed', v_now, v_now)
      ON CONFLICT (candidate_id, stage_id) DO UPDATE
      SET status = 'completed', completed_at = COALESCE(candidate_stage_progress.completed_at, v_now);
    END IF;

    UPDATE candidate_stage_progress
    SET status = 'active', started_at = COALESCE(started_at, v_now)
    WHERE candidate_id = v_candidate_id
      AND stage_id = 'relocation'
      AND status <> 'completed';

    IF NOT FOUND THEN
      INSERT INTO candidate_stage_progress (candidate_id, stage_id, status, started_at)
      VALUES (v_candidate_id, 'relocation', 'active', v_now)
      ON CONFLICT (candidate_id, stage_id) DO UPDATE
      SET status = 'active', started_at = COALESCE(candidate_stage_progress.started_at, v_now);
    END IF;
  ELSE
    UPDATE candidate_stage_progress
    SET status = 'active', started_at = COALESCE(started_at, v_now)
    WHERE candidate_id = v_candidate_id
      AND stage_id = 'activation'
      AND status = 'not_started';

    IF NOT FOUND THEN
      INSERT INTO candidate_stage_progress (candidate_id, stage_id, status, started_at)
      VALUES (v_candidate_id, 'activation', 'active', v_now)
      ON CONFLICT (candidate_id, stage_id) DO NOTHING;
    END IF;

    UPDATE candidate_stage_progress
    SET status = 'active', started_at = COALESCE(started_at, v_now)
    WHERE candidate_id = v_candidate_id
      AND stage_id = 'relocation'
      AND status = 'not_started';

    IF NOT FOUND THEN
      INSERT INTO candidate_stage_progress (candidate_id, stage_id, status, started_at)
      VALUES (v_candidate_id, 'relocation', 'active', v_now)
      ON CONFLICT (candidate_id, stage_id) DO NOTHING;
    END IF;
  END IF;

  PERFORM public.refresh_relocation_timeline(p_application_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.initialize_relocation_after_clearance(uuid, date) TO authenticated;

-- Heal cleared / relocation apps that never got steps or final_clearance_date
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT
      a.id AS application_id,
      COALESCE(
        ar.final_clearance_date,
        f.decision_date,
        (f.submitted_at AT TIME ZONE 'UTC')::date,
        CURRENT_DATE
      ) AS clearance_date
    FROM applications a
    JOIN activation_records ar ON ar.application_id = a.id
    LEFT JOIN final_clearance_decisions f ON f.application_id = a.id
    WHERE ar.status = 'cleared'
      AND (
        ar.final_clearance_date IS NULL
        OR NOT EXISTS (
          SELECT 1 FROM relocation_steps rs WHERE rs.application_id = a.id
        )
        OR EXISTS (
          SELECT 1 FROM candidate_stage_progress csp
          WHERE csp.candidate_id = a.candidate_id
            AND csp.stage_id = 'relocation'
            AND csp.status = 'not_started'
        )
      )
  LOOP
    UPDATE activation_records
    SET
      final_clearance_date = COALESCE(final_clearance_date, r.clearance_date),
      relocation_status = COALESCE(relocation_status, 'relocation_active'),
      updated_at = now()
    WHERE application_id = r.application_id;

    INSERT INTO relocation_steps (application_id, step_number, title, owner_layer, state, target_due_date)
    SELECT
      r.application_id,
      s.n,
      s.title,
      s.owner_layer,
      'on_track',
      CASE
        WHEN s.n = 1 THEN r.clearance_date
        WHEN s.n IN (2, 4) THEN r.clearance_date + 21
        WHEN s.n = 3 THEN r.clearance_date + 14
        ELSE NULL
      END
    FROM (VALUES
      (1, 'Contract signed, process initiated', 'nordic_ascent'),
      (2, 'Visa / immigration', 'relocation_partner'),
      (3, 'Norwegian A1 begins', 'language_partner'),
      (4, 'Pre-arrival preparation', 'relocation_partner'),
      (5, 'Housing', 'real_estate'),
      (6, 'Admin setup (D-number, tax, bank)', 'relocation_partner'),
      (7, 'Family support', 'nordic_ascent'),
      (8, 'Buddy (INDONORD)', 'nordic_ascent'),
      (9, 'Final prep + employer toolkit', 'nordic_ascent'),
      (10, 'Arrival confirmed', 'none')
    ) AS s(n, title, owner_layer)
    ON CONFLICT (application_id, step_number) DO NOTHING;

    UPDATE applications
    SET status = 'relocation', updated_at = now()
    WHERE id = r.application_id
      AND status NOT IN ('relocation', 'onboarding', 'followup', 'journey_complete');

    UPDATE candidate_stage_progress csp
    SET status = 'completed', completed_at = COALESCE(csp.completed_at, now())
    FROM applications a
    WHERE a.id = r.application_id
      AND csp.candidate_id = a.candidate_id
      AND csp.stage_id IN ('internship', 'selection')
      AND csp.status <> 'completed';

    -- If pre-arrival done → complete activation, activate relocation
    IF EXISTS (
      SELECT 1 FROM activation_records
      WHERE application_id = r.application_id AND pre_arrival_completed_at IS NOT NULL
    ) THEN
      UPDATE candidate_stage_progress csp
      SET status = 'completed', completed_at = COALESCE(csp.completed_at, now())
      FROM applications a
      WHERE a.id = r.application_id
        AND csp.candidate_id = a.candidate_id
        AND csp.stage_id = 'activation'
        AND csp.status <> 'completed';

      UPDATE candidate_stage_progress csp
      SET status = 'active', started_at = COALESCE(csp.started_at, now())
      FROM applications a
      WHERE a.id = r.application_id
        AND csp.candidate_id = a.candidate_id
        AND csp.stage_id = 'relocation'
        AND csp.status <> 'completed';
    ELSE
      UPDATE candidate_stage_progress csp
      SET status = 'active', started_at = COALESCE(csp.started_at, now())
      FROM applications a
      WHERE a.id = r.application_id
        AND csp.candidate_id = a.candidate_id
        AND csp.stage_id IN ('activation', 'relocation')
        AND csp.status = 'not_started';
    END IF;

    PERFORM public.refresh_relocation_timeline(r.application_id);
  END LOOP;
END;
$$;
