-- Monthly championship migration for existing Supabase projects.
-- Run this once in the Supabase SQL editor before deploying the frontend.

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS avatar_emoji VARCHAR(16) DEFAULT '👤';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS avatar_color VARCHAR(20) DEFAULT 'blue';

ALTER TABLE daily_results ADD COLUMN IF NOT EXISTS won BOOLEAN DEFAULT FALSE;
ALTER TABLE daily_results ADD COLUMN IF NOT EXISTS shield_bonus BOOLEAN DEFAULT FALSE;
ALTER TABLE daily_results ADD COLUMN IF NOT EXISTS map_bonus BOOLEAN DEFAULT FALSE;
ALTER TABLE daily_results ADD COLUMN IF NOT EXISTS main_score INTEGER DEFAULT 0;
ALTER TABLE daily_results ADD COLUMN IF NOT EXISTS bonus_score INTEGER DEFAULT 0;
ALTER TABLE daily_results ADD COLUMN IF NOT EXISTS total_score INTEGER DEFAULT 0;
ALTER TABLE daily_results ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_daily_results_monthly_leaderboard
  ON daily_results (game_date, total_score DESC, user_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_profiles'
      AND policyname = 'Anyone can view profiles for leaderboard'
  ) THEN
    CREATE POLICY "Anyone can view profiles for leaderboard" ON user_profiles
      FOR SELECT USING (true);
  END IF;
END $$;

DROP FUNCTION IF EXISTS get_monthly_leaderboard(DATE, DATE);

CREATE OR REPLACE FUNCTION get_monthly_leaderboard(
  target_month_start DATE,
  target_today DATE
)
RETURNS TABLE (
  user_id UUID,
  username VARCHAR,
  avatar_emoji VARCHAR,
  avatar_color VARCHAR,
  total_score INTEGER,
  days_played INTEGER,
  wins INTEGER,
  bonus_score INTEGER,
  today_score INTEGER,
  today_main_score INTEGER,
  today_bonus_score INTEGER,
  rank INTEGER,
  previous_rank INTEGER,
  rank_delta INTEGER
) AS $$
  WITH month_results AS (
    SELECT *
    FROM daily_results
    WHERE game_date >= target_month_start
      AND game_date < (target_month_start + INTERVAL '1 month')::DATE
  ),
  aggregated AS (
    SELECT
      up.id AS user_id,
      up.username AS username,
      up.avatar_emoji AS avatar_emoji,
      up.avatar_color AS avatar_color,
      COALESCE(SUM(mr.total_score), 0)::INTEGER AS total_score,
      COUNT(mr.id)::INTEGER AS days_played,
      COALESCE(SUM(CASE WHEN mr.won THEN 1 ELSE 0 END), 0)::INTEGER AS wins,
      COALESCE(SUM(mr.bonus_score), 0)::INTEGER AS bonus_score,
      COALESCE(SUM(CASE WHEN mr.game_date = target_today THEN mr.total_score ELSE 0 END), 0)::INTEGER AS today_score,
      COALESCE(SUM(CASE WHEN mr.game_date = target_today THEN mr.main_score ELSE 0 END), 0)::INTEGER AS today_main_score,
      COALESCE(SUM(CASE WHEN mr.game_date = target_today THEN mr.bonus_score ELSE 0 END), 0)::INTEGER AS today_bonus_score,
      COALESCE(SUM(CASE WHEN mr.game_date <> target_today THEN mr.total_score ELSE 0 END), 0)::INTEGER AS previous_score,
      COALESCE(SUM(CASE WHEN mr.game_date <> target_today AND mr.won THEN 1 ELSE 0 END), 0)::INTEGER AS previous_wins,
      COALESCE(SUM(CASE WHEN mr.game_date <> target_today THEN mr.bonus_score ELSE 0 END), 0)::INTEGER AS previous_bonus_score,
      COALESCE(SUM(CASE WHEN mr.game_date <> target_today THEN 1 ELSE 0 END), 0)::INTEGER AS previous_days_played
    FROM user_profiles up
    JOIN month_results mr ON mr.user_id = up.id
    GROUP BY up.id, up.username, up.avatar_emoji, up.avatar_color
  ),
  ranked_current AS (
    SELECT
      aggregated.*,
      ROW_NUMBER() OVER (
        ORDER BY total_score DESC, wins DESC, bonus_score DESC, days_played DESC, username ASC
      )::INTEGER AS current_rank
    FROM aggregated
  ),
  ranked_previous AS (
    SELECT
      aggregated.user_id,
      ROW_NUMBER() OVER (
        ORDER BY previous_score DESC, previous_wins DESC, previous_bonus_score DESC, previous_days_played DESC, username ASC
      )::INTEGER AS previous_rank
    FROM aggregated
  )
  SELECT
    rc.user_id,
    rc.username,
    rc.avatar_emoji,
    rc.avatar_color,
    rc.total_score,
    rc.days_played,
    rc.wins,
    rc.bonus_score,
    rc.today_score,
    rc.today_main_score,
    rc.today_bonus_score,
    rc.current_rank AS rank,
    rp.previous_rank,
    (rp.previous_rank - rc.current_rank)::INTEGER AS rank_delta
  FROM ranked_current rc
  JOIN ranked_previous rp ON rp.user_id = rc.user_id
  ORDER BY rc.current_rank ASC;
$$ LANGUAGE sql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_monthly_leaderboard(DATE, DATE) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
