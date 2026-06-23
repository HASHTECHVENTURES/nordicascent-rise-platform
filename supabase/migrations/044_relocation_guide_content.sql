-- Relocation guide cards: hero image per task (admin-managed).

ALTER TABLE public.stage_tasks
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Seed dummy relocation guides (platform-wide, editable in Admin → Relocation).
INSERT INTO public.stage_tasks (
  stage_id, company_id, title, description, sort_order, task_type, image_url, content_body
)
SELECT * FROM (VALUES
  (
    'relocation',
    NULL::uuid,
    'Visa & documentation',
    'Complete visa requirements before you travel',
    1,
    'task',
    'https://images.unsplash.com/photo-1554224311-beee415c201f?w=1200&auto=format&fit=crop',
    'Visa and documentation

After your work permit is approved, complete any remaining visa steps.

Checklist
• Book biometrics appointment if required
• Submit passport photos and application fee
• Keep copies of all submitted documents
• Notify Nordic Ascent when your visa is stamped

Mark complete when your visa is approved.'
  ),
  (
    'relocation',
    NULL::uuid,
    'Housing in the Nordics',
    'Find temporary or permanent accommodation',
    2,
    'task',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop',
    'Housing in the Nordics

Plan where you will live for your first months.

Steps
1. Review housing options Nordic Ascent or your employer shared
2. Compare temporary vs permanent accommodation
3. Confirm move-in date and deposit terms
4. Share your address in Messages once confirmed

Mark complete when housing is booked.'
  ),
  (
    'relocation',
    NULL::uuid,
    'Travel & arrival',
    'Book flights and plan your arrival week',
    3,
    'task',
    'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&auto=format&fit=crop',
    'Travel and arrival

Get ready for your move to the Nordics.

Steps
• Book flights aligned with your start date
• Arrange airport pickup or public transport
• Pack essential documents in your carry-on
• Share travel itinerary with Nordic Ascent

Mark complete when travel is booked.'
  ),
  (
    'relocation',
    NULL::uuid,
    'Settling in guide',
    'Banking, SIM, and first-week essentials',
    4,
    'task',
    'https://images.unsplash.com/photo-1513622470522-26c3c8a084bc?w=1200&auto=format&fit=crop',
    'Settling in guide

Your first week checklist after landing.

• Open a local bank account
• Get a SIM card and register your address
• Register with local authorities if required
• Attend your employer welcome session

Mark complete after your first-week check-in.'
  )
) AS seed(stage_id, company_id, title, description, sort_order, task_type, image_url, content_body)
WHERE NOT EXISTS (
  SELECT 1 FROM public.stage_tasks WHERE stage_id = 'relocation' AND company_id IS NULL
);
