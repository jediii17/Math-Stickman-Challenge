-- Add classic_level to public.profiles

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS classic_level integer NOT NULL DEFAULT 1;
