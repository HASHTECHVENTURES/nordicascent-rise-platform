-- Offee full test report path on applications + Final Clearance theme copy already in 074

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS offee_report_path text;
