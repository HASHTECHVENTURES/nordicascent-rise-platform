-- Store mentor meeting agendas as newline-separated bullets (rendered as lists in UI).
UPDATE public.mentor_meeting_themes SET theme_body = $b$
Background, motivation, and programme goals
Work and communication style preferences
What working in a Nordic company feels like
Prepare: be ready to talk openly — nothing to submit
$b$, updated_at = now() WHERE meeting_number = 1;

UPDATE public.mentor_meeting_themes SET theme_body = $b$
How you approached the Readiness scenarios
Your reasoning style, and where you felt confident vs. challenged
How you handle disagreement, uncertainty, and feedback
Prepare: think back over the Readiness scenarios and how you worked through them
$b$, updated_at = now() WHERE meeting_number = 2;

UPDATE public.mentor_meeting_themes SET theme_body = $b$
Assessment of readiness for the next phase
Ownership and initiative signals
Cultural self-awareness
Outlook on Activation / internship
Prepare: reflect on what Readiness showed you about how you work
$b$, updated_at = now() WHERE meeting_number = 3;

UPDATE public.mentor_meeting_themes SET theme_body = $b$
Initial feel of the internship
Clarity of tasks and expectations
First impressions of the team
Prepare: note what has been clear vs. confusing in week 1–2
$b$, updated_at = now() WHERE meeting_number = 4;

UPDATE public.mentor_meeting_themes SET theme_body = $b$
Handling real tasks mid-internship
Team communication in practice
Initiative vs waiting for direction
Prepare: bring one example of feedback you received and how you used it
$b$, updated_at = now() WHERE meeting_number = 5;

UPDATE public.mentor_meeting_themes SET theme_body = $b$
Overall internship experience
Strengths and challenges
Feelings about full employment
Prepare: be ready to summarise what you would keep doing and what you would change
$b$, updated_at = now() WHERE meeting_number = 6;
