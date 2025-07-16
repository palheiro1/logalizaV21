-- Logaliza Database Setup Script
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/projects

-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
  tries_count INTEGER,
  best_distance DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, game_date)
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_results ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

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

CREATE POLICY "Users can insert own results" ON daily_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own results" ON daily_results
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function for user rank calculation
CREATE OR REPLACE FUNCTION get_user_rank(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  user_rank INTEGER;
BEGIN
  SELECT rank INTO user_rank
  FROM (
    SELECT 
      us.user_id,
      ROW_NUMBER() OVER (ORDER BY us.max_streak DESC, us.current_streak DESC, us.played DESC) as rank
    FROM user_stats us
    JOIN user_profiles up ON us.user_id = up.id
  ) ranked_users
  WHERE ranked_users.user_id = get_user_rank.user_id;
  
  RETURN COALESCE(user_rank, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_user_rank(UUID) TO authenticated;
