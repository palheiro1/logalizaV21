-- Logaliza Database Setup Script
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/projects

-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  avatar_emoji VARCHAR(16) DEFAULT '👤',
  avatar_color VARCHAR(20) DEFAULT 'blue',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS avatar_emoji VARCHAR(16) DEFAULT '👤';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS avatar_color VARCHAR(20) DEFAULT 'blue';

-- Create user_stats table
CREATE TABLE user_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  current_streak INTEGER DEFAULT 0,
  max_streak INTEGER DEFAULT 0,
  played INTEGER DEFAULT 0,
  win_ratio DECIMAL(5,4) DEFAULT 0,
  average_best_distance DECIMAL(10,2) DEFAULT 0,
  guess_distribution JSONB DEFAULT '{"1": 0, "2": 0, "3": 0, "4": 0}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_results table
CREATE TABLE daily_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  game_date DATE NOT NULL,
  guesses JSONB NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  won BOOLEAN DEFAULT FALSE,
  tries_count INTEGER,
  best_distance DECIMAL(10,2),
  shield_bonus BOOLEAN DEFAULT FALSE,
  map_bonus BOOLEAN DEFAULT FALSE,
  main_score INTEGER DEFAULT 0,
  bonus_score INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, game_date)
);

-- Existing installations: run these safely after the original setup.
ALTER TABLE daily_results ADD COLUMN IF NOT EXISTS won BOOLEAN DEFAULT FALSE;
ALTER TABLE daily_results ADD COLUMN IF NOT EXISTS shield_bonus BOOLEAN DEFAULT FALSE;
ALTER TABLE daily_results ADD COLUMN IF NOT EXISTS map_bonus BOOLEAN DEFAULT FALSE;
ALTER TABLE daily_results ADD COLUMN IF NOT EXISTS main_score INTEGER DEFAULT 0;
ALTER TABLE daily_results ADD COLUMN IF NOT EXISTS bonus_score INTEGER DEFAULT 0;
ALTER TABLE daily_results ADD COLUMN IF NOT EXISTS total_score INTEGER DEFAULT 0;
ALTER TABLE daily_results ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_daily_results_monthly_leaderboard
  ON daily_results (game_date, total_score DESC, user_id);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_results ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Anyone can view profiles for leaderboard" ON user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create policies for user_stats
CREATE POLICY "Users can view own stats" ON user_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats" ON user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON user_stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view stats for leaderboard" ON user_stats
  FOR SELECT USING (true);

-- Create policies for daily_results
CREATE POLICY "Users can view own results" ON daily_results
  FOR SELECT USING (auth.uid() = user_id);

-- Official daily results are written through submit_daily_result() so the
-- database, not the browser, derives scoring fields.

-- Create function for user rank calculation
CREATE OR REPLACE FUNCTION get_user_rank(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  user_rank INTEGER;
BEGIN
  WITH latest_stats AS (
    SELECT DISTINCT ON (user_id) *
    FROM user_stats
    ORDER BY user_id, updated_at DESC
  )
  SELECT rank INTO user_rank
  FROM (
    SELECT 
      us.user_id,
      ROW_NUMBER() OVER (ORDER BY us.max_streak DESC, us.current_streak DESC, us.win_ratio DESC, us.played DESC) as rank
    FROM latest_stats us
    JOIN user_profiles up ON us.user_id = up.id
  ) ranked_users
  WHERE ranked_users.user_id = get_user_rank.user_id;
  
  RETURN COALESCE(user_rank, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_user_rank(UUID) TO authenticated;

-- Create function for official daily result submission
CREATE OR REPLACE FUNCTION submit_daily_result(
  target_game_date DATE,
  submitted_guesses JSONB,
  submitted_shield_bonus BOOLEAN DEFAULT FALSE,
  submitted_map_bonus BOOLEAN DEFAULT FALSE
)
RETURNS daily_results AS $$
DECLARE
  requesting_user UUID := auth.uid();
  guess_count INTEGER;
  win_try INTEGER;
  completed_result BOOLEAN;
  best_distance_result NUMERIC;
  main_score_result INTEGER := 0;
  bonus_score_result INTEGER := 0;
  final_shield_bonus BOOLEAN := FALSE;
  final_map_bonus BOOLEAN := FALSE;
  existing_result daily_results;
  saved_result daily_results;
BEGIN
  IF requesting_user IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '28000';
  END IF;

  IF target_game_date IS NULL THEN
    RAISE EXCEPTION 'target_game_date is required' USING ERRCODE = '22023';
  END IF;

  IF submitted_guesses IS NULL OR jsonb_typeof(submitted_guesses) <> 'array' THEN
    RAISE EXCEPTION 'submitted_guesses must be an array' USING ERRCODE = '22023';
  END IF;

  guess_count := jsonb_array_length(submitted_guesses);
  IF guess_count < 1 OR guess_count > 4 THEN
    RAISE EXCEPTION 'submitted_guesses must contain 1 to 4 guesses' USING ERRCODE = '22023';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_array_elements(submitted_guesses) AS guess(value)
    WHERE jsonb_typeof(guess.value) <> 'object'
      OR NULLIF(BTRIM(guess.value ->> 'name'), '') IS NULL
      OR NULLIF(BTRIM(guess.value ->> 'direction'), '') IS NULL
      OR NULLIF(BTRIM(guess.value ->> 'distance'), '') IS NULL
      OR (guess.value ->> 'distance') !~ '^[0-9]+(\.[0-9]+)?$'
  ) THEN
    RAISE EXCEPTION 'submitted_guesses contains invalid guesses' USING ERRCODE = '22023';
  END IF;

  SELECT *
  INTO existing_result
  FROM daily_results
  WHERE user_id = requesting_user
    AND game_date = target_game_date;

  IF FOUND THEN
    final_shield_bonus := existing_result.shield_bonus OR (existing_result.won AND COALESCE(submitted_shield_bonus, FALSE));
    final_map_bonus := existing_result.map_bonus OR (existing_result.won AND COALESCE(submitted_map_bonus, FALSE));
    bonus_score_result :=
      CASE WHEN final_shield_bonus THEN 20 ELSE 0 END +
      CASE WHEN final_map_bonus THEN 20 ELSE 0 END;

    UPDATE daily_results
    SET
      shield_bonus = final_shield_bonus,
      map_bonus = final_map_bonus,
      bonus_score = bonus_score_result,
      total_score = existing_result.main_score + bonus_score_result,
      updated_at = NOW()
    WHERE id = existing_result.id
    RETURNING * INTO saved_result;

    RETURN saved_result;
  END IF;

  SELECT MIN(guess.ordinality)::INTEGER
  INTO win_try
  FROM jsonb_array_elements(submitted_guesses) WITH ORDINALITY AS guess(value, ordinality)
  WHERE (guess.value ->> 'distance') ~ '^[0-9]+(\.[0-9]+)?$'
    AND (guess.value ->> 'distance')::NUMERIC = 0;

  completed_result := win_try IS NOT NULL OR guess_count >= 4;
  IF NOT completed_result THEN
    RAISE EXCEPTION 'Cannot submit incomplete daily result' USING ERRCODE = '22023';
  END IF;

  SELECT MIN((guess.value ->> 'distance')::NUMERIC)
  INTO best_distance_result
  FROM jsonb_array_elements(submitted_guesses) WITH ORDINALITY AS guess(value, ordinality)
  WHERE (guess.value ->> 'distance') ~ '^[0-9]+(\.[0-9]+)?$';

  IF win_try IS NOT NULL THEN
    main_score_result := CASE win_try
      WHEN 1 THEN 100
      WHEN 2 THEN 75
      WHEN 3 THEN 50
      WHEN 4 THEN 25
      ELSE 0
    END;
    final_shield_bonus := COALESCE(submitted_shield_bonus, FALSE);
    final_map_bonus := COALESCE(submitted_map_bonus, FALSE);
    bonus_score_result :=
      CASE WHEN final_shield_bonus THEN 20 ELSE 0 END +
      CASE WHEN final_map_bonus THEN 20 ELSE 0 END;
  END IF;

  INSERT INTO daily_results (
    user_id,
    game_date,
    guesses,
    completed,
    won,
    tries_count,
    best_distance,
    shield_bonus,
    map_bonus,
    main_score,
    bonus_score,
    total_score,
    updated_at
  )
  VALUES (
    requesting_user,
    target_game_date,
    submitted_guesses,
    completed_result,
    win_try IS NOT NULL,
    CASE WHEN win_try IS NOT NULL THEN win_try ELSE guess_count END,
    best_distance_result,
    win_try IS NOT NULL AND final_shield_bonus,
    win_try IS NOT NULL AND final_map_bonus,
    main_score_result,
    bonus_score_result,
    main_score_result + bonus_score_result,
    NOW()
  )
  RETURNING * INTO saved_result;

  RETURN saved_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION submit_daily_result(DATE, JSONB, BOOLEAN, BOOLEAN) TO authenticated;

-- Create function for monthly championship leaderboard
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
