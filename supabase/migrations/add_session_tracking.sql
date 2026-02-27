-- Add session tracking columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS session_key text,
ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;

-- Create an index for performance if needed
CREATE INDEX IF NOT EXISTS idx_profiles_last_seen ON public.profiles(last_seen_at);
