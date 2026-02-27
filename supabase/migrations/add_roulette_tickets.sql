-- Add roulette_tickets and claimed_ticket_levels to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS roulette_tickets integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS claimed_ticket_levels jsonb NOT NULL DEFAULT '[]'::jsonb;
