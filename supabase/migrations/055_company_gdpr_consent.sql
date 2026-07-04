-- Company GDPR consent + intake status alignment (Module 1 spec).
-- GDPR consent checkbox is required at company registration submit.
-- On completed submit, company status becomes 'intake_received' and admins are notified.

ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS gdpr_consent boolean NOT NULL DEFAULT false;

ALTER TABLE public.companies
  ADD CONSTRAINT companies_gdpr_consent_required_for_intake
    CHECK (gdpr_consent = false OR gdpr_consent = true);

COMMENT ON COLUMN public.companies.gdpr_consent IS 'True when the contact accepted the GDPR consent checkbox at registration submit.';

-- Grandfather companies that already completed registration before the consent checkbox existed.
UPDATE public.companies
  SET gdpr_consent = true
  WHERE status IN ('active', 'verified') AND gdpr_consent = false;

-- 'intake_received' is the post-submit, pre-admin-verification status.
-- Existing approved companies keep their current status; only pending companies
-- will move to 'intake_received' on their next completed submit.
