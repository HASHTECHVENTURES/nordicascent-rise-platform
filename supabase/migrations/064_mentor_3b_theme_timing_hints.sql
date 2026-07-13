-- Module 3B: meeting theme timing hints (CMS defaults)

UPDATE public.mentor_meeting_themes SET theme_body = CASE meeting_number
  WHEN 1 THEN 'Getting to know the candidate, work mindset, communication style, and expectations for Nordic collaboration. At the start of Readiness.'
  WHEN 2 THEN 'How they approached scenarios, reasoning style, confidence vs uncertainty, handling disagreement and feedback, cultural self-awareness. After the candidate completes at least one Readiness area.'
  WHEN 3 THEN 'Candidate self-assessment, mentor perception summary, open questions, alignment on next steps — before Go/No-Go.'
  WHEN 4 THEN 'Onboarding experience, clarity of tasks and expectations, first impressions of the team. Week 1–2 of internship (Entry track).'
  WHEN 5 THEN 'Handling real tasks, communication within the team, ownership vs waiting, handling feedback. Mid-internship, week 3–5 (Entry track).'
  WHEN 6 THEN 'Overall experience, strengths, challenges/risks, readiness for full employment — before Go/No-Go. End of internship (Entry track).'
  ELSE theme_body END,
updated_at = now()
WHERE meeting_number BETWEEN 1 AND 6;
