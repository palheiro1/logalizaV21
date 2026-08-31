-- Monthly championship migration for existing Supabase projects.
-- Run this once in the Supabase SQL editor before deploying the frontend.

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS avatar_emoji VARCHAR(16) DEFAULT '👤';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS avatar_color VARCHAR(20) DEFAULT 'blue';

ALTER TABLE daily_results ADD COLUMN IF NOT EXISTS won BOOLEAN DEFAULT FALSE;
ALTER TABLE daily_results ADD COLUMN IF NOT EXISTS shield_bonus BOOLEAN DEFAULT FALSE;
ALTER TABLE daily_results ADD COLUMN IF NOT EXISTS map_bonus BOOLEAN DEFAULT FALSE;
ALTER TABLE daily_results ADD COLUMN IF NOT EXISTS municipalities_bonus BOOLEAN DEFAULT FALSE;
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

DROP POLICY IF EXISTS "Users can insert own results" ON daily_results;
DROP POLICY IF EXISTS "Users can update own results" ON daily_results;

DROP FUNCTION IF EXISTS public.submit_daily_result(DATE, JSONB, BOOLEAN, BOOLEAN);
DROP FUNCTION IF EXISTS public.submit_daily_result(DATE, JSONB, BOOLEAN, BOOLEAN, BOOLEAN);

CREATE OR REPLACE FUNCTION public.submit_daily_result(
  target_game_date DATE,
  submitted_guesses JSONB,
  submitted_shield_bonus BOOLEAN DEFAULT FALSE,
  submitted_map_bonus BOOLEAN DEFAULT FALSE,
  submitted_municipalities_bonus BOOLEAN DEFAULT FALSE
)
RETURNS public.daily_results AS $$
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
  final_municipalities_bonus BOOLEAN := FALSE;
  existing_needs_main_backfill BOOLEAN := FALSE;
  existing_result public.daily_results;
  saved_result public.daily_results;
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
  END IF;

  SELECT *
  INTO existing_result
  FROM public.daily_results
  WHERE user_id = requesting_user
    AND game_date = target_game_date;

  IF FOUND THEN
    existing_needs_main_backfill :=
      NOT COALESCE(existing_result.completed, FALSE)
      OR existing_result.tries_count IS NULL
      OR existing_result.best_distance IS NULL
      OR (
        NOT COALESCE(existing_result.won, FALSE)
        AND win_try IS NOT NULL
        AND COALESCE(existing_result.best_distance, 999999999)::NUMERIC = 0
      )
      OR (
        COALESCE(existing_result.won, FALSE)
        AND COALESCE(existing_result.main_score, 0) = 0
        AND win_try IS NOT NULL
      );

    final_shield_bonus :=
      COALESCE(existing_result.shield_bonus, FALSE)
      OR ((CASE WHEN existing_needs_main_backfill THEN win_try IS NOT NULL ELSE existing_result.won END) AND COALESCE(submitted_shield_bonus, FALSE));
    final_map_bonus :=
      COALESCE(existing_result.map_bonus, FALSE)
      OR ((CASE WHEN existing_needs_main_backfill THEN win_try IS NOT NULL ELSE existing_result.won END) AND COALESCE(submitted_map_bonus, FALSE));
    final_municipalities_bonus :=
      COALESCE(existing_result.municipalities_bonus, FALSE)
      OR COALESCE(submitted_municipalities_bonus, FALSE);
    bonus_score_result :=
      CASE WHEN final_shield_bonus THEN 20 ELSE 0 END +
      CASE WHEN final_map_bonus THEN 20 ELSE 0 END +
      CASE WHEN final_municipalities_bonus THEN 20 ELSE 0 END;

    IF existing_needs_main_backfill THEN
      UPDATE public.daily_results
      SET
        guesses = submitted_guesses,
        completed = completed_result,
        won = win_try IS NOT NULL,
        tries_count = CASE WHEN win_try IS NOT NULL THEN win_try ELSE guess_count END,
        best_distance = best_distance_result,
        shield_bonus = final_shield_bonus,
        map_bonus = final_map_bonus,
        municipalities_bonus = final_municipalities_bonus,
        main_score = main_score_result,
        bonus_score = bonus_score_result,
        total_score = main_score_result + bonus_score_result,
        updated_at = NOW()
      WHERE id = existing_result.id
      RETURNING * INTO saved_result;

      RETURN saved_result;
    END IF;

    UPDATE public.daily_results
    SET
      shield_bonus = final_shield_bonus,
      map_bonus = final_map_bonus,
      municipalities_bonus = final_municipalities_bonus,
      bonus_score = bonus_score_result,
      total_score = existing_result.main_score + bonus_score_result,
      updated_at = NOW()
    WHERE id = existing_result.id
    RETURNING * INTO saved_result;

    RETURN saved_result;
  END IF;

  IF win_try IS NOT NULL THEN
    final_shield_bonus := COALESCE(submitted_shield_bonus, FALSE);
    final_map_bonus := COALESCE(submitted_map_bonus, FALSE);
  END IF;
  final_municipalities_bonus := COALESCE(submitted_municipalities_bonus, FALSE);
  bonus_score_result :=
    CASE WHEN final_shield_bonus THEN 20 ELSE 0 END +
    CASE WHEN final_map_bonus THEN 20 ELSE 0 END +
    CASE WHEN final_municipalities_bonus THEN 20 ELSE 0 END;

  INSERT INTO public.daily_results (
    user_id,
    game_date,
    guesses,
    completed,
    won,
    tries_count,
    best_distance,
    shield_bonus,
    map_bonus,
    municipalities_bonus,
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
    final_municipalities_bonus,
    main_score_result,
    bonus_score_result,
    main_score_result + bonus_score_result,
    NOW()
  )
  RETURNING * INTO saved_result;

  RETURN saved_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

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
REVOKE ALL ON FUNCTION public.submit_daily_result(DATE, JSONB, BOOLEAN, BOOLEAN, BOOLEAN) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_daily_result(DATE, JSONB, BOOLEAN, BOOLEAN, BOOLEAN) TO authenticated;

NOTIFY pgrst, 'reload schema';
