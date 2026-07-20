-- Replace Go/No-Go wording in mentor meeting theme CMS with Final Clearance

UPDATE public.mentor_meeting_themes
SET theme_body = replace(theme_body, 'Go/No-Go', 'Final Clearance'),
    updated_at = now()
WHERE theme_body ILIKE '%Go/No-Go%';

UPDATE public.mentor_meeting_themes
SET theme_body = replace(theme_body, 'Go / No-Go', 'Final Clearance'),
    updated_at = now()
WHERE theme_body ILIKE '%Go / No-Go%';

UPDATE public.mentor_meeting_themes
SET theme_body = replace(theme_body, 'go/no-go', 'Final Clearance'),
    updated_at = now()
WHERE theme_body ILIKE '%go/no-go%';
