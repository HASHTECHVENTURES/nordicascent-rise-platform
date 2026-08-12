-- Mentor setup: profile fields, session scheduling, updated meeting timing hints.

ALTER TABLE public.company_mentors
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS expertise_tags text[] NOT NULL DEFAULT '{}';

ALTER TABLE public.mentor_program_meetings
  ADD COLUMN IF NOT EXISTS scheduled_at timestamptz,
  ADD COLUMN IF NOT EXISTS meeting_url text;

UPDATE public.mentor_meeting_themes SET theme_body = CASE meeting_number
  WHEN 1 THEN E'Getting to know the candidate, work mindset, communication style, and expectations for Nordic collaboration.\nOpens before any Readiness tests (Pre-Readiness).'
  WHEN 2 THEN E'How they approached scenarios, reasoning style, confidence vs uncertainty, handling disagreement and feedback, cultural self-awareness.\nOpens after Readiness test 2 (both technical and cultural) and before starting the final 60-minute test 3.'
  WHEN 3 THEN E'Candidate self-assessment, mentor perception summary, open questions, alignment on next steps — before Go/No-Go.\nOpens after the Readiness phase is complete.'
  ELSE theme_body END,
updated_at = now()
WHERE meeting_number BETWEEN 1 AND 3;
