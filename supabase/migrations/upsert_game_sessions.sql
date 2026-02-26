-- =============================================
-- Migration: Optimize game_sessions for upsert (personal best only)
-- Run this in your Supabase SQL Editor
-- =============================================

-- 1. Add game_mode column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'game_sessions'
      AND column_name = 'game_mode'
  ) THEN
    ALTER TABLE public.game_sessions ADD COLUMN game_mode text NOT NULL DEFAULT 'survival';
  END IF;
END $$;

-- 2. Clean up duplicate rows: keep only the best score per (user_id, difficulty, game_mode)
DELETE FROM public.game_sessions gs
WHERE gs.id NOT IN (
  SELECT DISTINCT ON (user_id, difficulty, game_mode) id
  FROM public.game_sessions
  ORDER BY user_id, difficulty, game_mode, score DESC, played_at DESC
);

-- 3. Add unique constraint on (user_id, difficulty, game_mode)
-- Drop if exists first to make this idempotent
ALTER TABLE public.game_sessions
  DROP CONSTRAINT IF EXISTS game_sessions_user_difficulty_mode_unique;

ALTER TABLE public.game_sessions
  ADD CONSTRAINT game_sessions_user_difficulty_mode_unique
  UNIQUE (user_id, difficulty, game_mode);

-- 4. Add UPDATE RLS policy so users can update their own rows
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'game_sessions'
      AND policyname = 'Users can update own game sessions'
  ) THEN
    CREATE POLICY "Users can update own game sessions"
      ON public.game_sessions FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- 5. Update survival leaderboard RPC to read directly (each row = best score)
CREATE OR REPLACE FUNCTION get_survival_leaderboard(
  p_difficulty TEXT,
  result_limit INT DEFAULT 50,
  result_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  best_score INT,
  rank BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    p.id,
    p.username,
    COALESCE(gs.score, 0) AS best_score,
    RANK() OVER (ORDER BY COALESCE(gs.score, 0) DESC, p.username ASC) AS rank
  FROM profiles p
  LEFT JOIN game_sessions gs
    ON gs.user_id = p.id
    AND gs.difficulty = p_difficulty
    AND gs.game_mode = 'survival'
  ORDER BY COALESCE(gs.score, 0) DESC, p.username ASC
  LIMIT result_limit
  OFFSET result_offset;
$$;
