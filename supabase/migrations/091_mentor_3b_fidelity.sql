-- Module 3B fidelity: available_at for overdue, mentor invite tracking, agenda/title polish.

ALTER TABLE public.company_mentors
  ADD COLUMN IF NOT EXISTS invite_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS invited_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.mentor_program_meetings
  ADD COLUMN IF NOT EXISTS available_at timestamptz;

-- Backfill: available meetings use updated_at/created_at as unlock time
UPDATE public.mentor_program_meetings
SET available_at = COALESCE(available_at, updated_at, created_at, now())
WHERE status = 'available' AND available_at IS NULL;

-- Align titles with Module 3B spec
UPDATE public.mentor_meeting_themes SET title = CASE meeting_number
  WHEN 1 THEN 'Introduction and mindset'
  WHEN 2 THEN 'Readiness reflection'
  WHEN 3 THEN 'Final reflection'
  WHEN 4 THEN 'Early experience'
  WHEN 5 THEN 'Work reflection'
  WHEN 6 THEN 'Final reflection'
  ELSE title
END;

UPDATE public.mentor_meeting_themes SET theme_body = CASE meeting_number
  WHEN 1 THEN $b$
Background, motivation, and goals for the programme
Work and communication style preferences
Expectations of working in a Nordic company
Prepare: Come ready to talk openly about yourself. Nothing to submit.
$b$
  WHEN 2 THEN $b$
Approach to the Readiness scenarios
Reasoning style; areas of confidence vs. challenge
Handling disagreement, uncertainty, and feedback
Prepare: Think back over the Readiness scenarios and how you worked through them.
$b$
  WHEN 3 THEN $b$
Personal assessment of the Readiness phase
Ownership, initiative, and cultural self-awareness
Open questions and feelings about next steps
Prepare: Reflect on what you learned about yourself during Readiness.
$b$
  WHEN 4 THEN $b$
How the start has felt
Whether the tasks and expectations are clear
First impressions of the team
Prepare: note anything unclear or that you need help with.
$b$
  WHEN 5 THEN $b$
How you are handling the real tasks
Communication within the team
Taking initiative vs. waiting for direction
Prepare: think about what has gone well and what has been harder.
$b$
  WHEN 6 THEN $b$
Your overall experience
What you did well and what was challenging
How you feel about moving into full employment
Prepare: reflect honestly on the whole internship, the good and the difficult.
$b$
  ELSE theme_body
END;
