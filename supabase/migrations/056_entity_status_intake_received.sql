-- Company intake submit status (Module 1).
-- 1) intake_submitted_at works immediately (fallback if enum value missing).
-- 2) intake_received enum value is the canonical status once applied.

ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS intake_submitted_at timestamptz;

COMMENT ON COLUMN public.companies.intake_submitted_at IS
  'Set when employer completes registration submit; mirrors intake_received until status enum is updated.';

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'entity_status') THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'entity_status'
        AND e.enumlabel = 'intake_received'
    ) THEN
      ALTER TYPE public.entity_status ADD VALUE 'intake_received';
    END IF;
  END IF;
END $$;
