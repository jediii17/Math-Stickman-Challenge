-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- Creates a server-side leaderboard function using RANK() window function

CREATE OR REPLACE FUNCTION get_leaderboard(result_limit INT DEFAULT 50, result_offset INT DEFAULT 0)
RETURNS TABLE (
  id UUID,
  username TEXT,
  coins INT,
  rank BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    p.id,
    p.username,
    p.coins,
    RANK() OVER (ORDER BY p.coins DESC, p.username ASC) AS rank
  FROM profiles p
  ORDER BY p.coins DESC, p.username ASC
  LIMIT result_limit
  OFFSET result_offset;
$$;
