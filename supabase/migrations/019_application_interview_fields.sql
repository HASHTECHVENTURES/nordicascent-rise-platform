-- Company → candidate interview scheduling (Google Meet link, etc.)
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS interview_meet_url TEXT,
  ADD COLUMN IF NOT EXISTS interview_scheduled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS interview_notes TEXT;
