-- Post-selection application journey statuses (Modules 3–7 on APPLICATION object).

ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'mentor_assigned';
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'readiness_active';
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'readiness_complete';
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'internship';
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'go_no_go';
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'pre_arrival';
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'relocation';
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'onboarding';
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'followup';
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'journey_complete';
