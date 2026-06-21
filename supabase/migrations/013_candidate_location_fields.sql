-- Separate country, state, and city on candidate profiles.
ALTER TABLE public.candidates
  ADD COLUMN IF NOT EXISTS country text DEFAULT 'India',
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS city text;

UPDATE public.candidates
SET
  country = COALESCE(NULLIF(TRIM(country), ''), 'India'),
  city = COALESCE(NULLIF(TRIM(city), ''), NULLIF(TRIM(location), ''))
WHERE country IS NULL OR city IS NULL;

UPDATE public.candidates
SET location = TRIM(CONCAT_WS(', ', NULLIF(TRIM(city), ''), NULLIF(TRIM(state), ''), NULLIF(TRIM(country), '')))
WHERE (city IS NOT NULL OR state IS NOT NULL OR country IS NOT NULL)
  AND (location IS NULL OR location = '');
