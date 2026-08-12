-- University portal enum (must commit before use in functions/policies).
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'university';
