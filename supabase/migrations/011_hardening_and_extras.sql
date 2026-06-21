ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_status text NOT NULL DEFAULT 'active';
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new';

UPDATE platform_settings
SET settings = settings || '{"allowAdminSignup": false}'::jsonb
WHERE id = 'default';

-- See remote migration 011_hardening_and_extras for full handle_new_user and get_public_config updates.
