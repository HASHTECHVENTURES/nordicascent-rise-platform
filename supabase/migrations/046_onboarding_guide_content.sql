-- Onboarding guide cards (platform-wide, editable in Admin → Onboarding).

INSERT INTO public.stage_tasks (
  stage_id, company_id, title, description, sort_order, task_type, image_url, content_body
)
SELECT * FROM (VALUES
  (
    'onboarding',
    NULL::uuid,
    'Arrival check-in',
    'Complete registration and first-week essentials',
    1,
    'task',
    'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&auto=format&fit=crop',
    'Arrival check-in

Welcome — complete these steps in your first week.

• Register your address with local authorities
• Collect your work ID badge from the employer
• Set up bank account (bring passport and employment contract)
• Attend the company orientation session

Mark complete after your first week check-in with Nordic Ascent.'
  ),
  (
    'onboarding',
    NULL::uuid,
    'Integration session',
    'Attend workplace integration with your team',
    2,
    'course',
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&auto=format&fit=crop',
    'Workplace integration session

A guided session with your team and Nordic Ascent mentor.

Covers
• Team introductions and role expectations
• IT setup and internal tools
• Buddy system and first-month goals

Attend the session, then mark this task complete.'
  ),
  (
    'onboarding',
    NULL::uuid,
    'Workplace setup',
    'IT access, tools, and day-one logistics',
    3,
    'task',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop',
    'Workplace setup

Get fully operational in your new role.

• Laptop, email, and internal systems access
• Security badge and building access
• Meet your buddy or line manager
• Review your first-week schedule

Mark complete when your setup is done.'
  ),
  (
    'onboarding',
    NULL::uuid,
    'First-month goals',
    'Align on expectations and milestones',
    4,
    'task',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&auto=format&fit=crop',
    'First-month goals

Set clear expectations with your manager.

• Review role responsibilities and success metrics
• Agree on 30/60/90-day milestones
• Schedule regular check-ins with your mentor
• Share any support needs with Nordic Ascent

Mark complete after your first-month goal review.'
  )
) AS seed(stage_id, company_id, title, description, sort_order, task_type, image_url, content_body)
WHERE NOT EXISTS (
  SELECT 1 FROM public.stage_tasks WHERE stage_id = 'onboarding' AND company_id IS NULL
);
