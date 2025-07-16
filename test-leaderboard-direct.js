// Test the leaderboard query directly from the browser
// This will help us isolate if the issue is with the Supabase client configuration

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://klqazjpyzxvsehgnjdth.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtscWF6anB5enh2c2VoZ25qZHRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2ODczNDYsImV4cCI6MjA2ODI2MzM0Nn0.nuynZuXiyd2SLpv7ccdIDvoufmYpyRprps-NvkUDsMg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLeaderboardQuery() {
  console.log('Testing leaderboard query...');
  
  try {
    // Test 1: Simple query without join
    console.log('Test 1: Simple user_stats query');
    const { data: statsData, error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .limit(5);
    
    console.log('Stats data:', statsData);
    console.log('Stats error:', statsError);
    
    // Test 2: Simple user_profiles query
    console.log('\nTest 2: Simple user_profiles query');
    const { data: profilesData, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(5);
    
    console.log('Profiles data:', profilesData);
    console.log('Profiles error:', profilesError);
    
    // Test 3: The actual leaderboard query with JOIN
    console.log('\nTest 3: Full leaderboard query');
    const { data: leaderboardData, error: leaderboardError } = await supabase
      .from('user_stats')
      .select(`
        max_streak,
        current_streak,
        played,
        win_ratio,
        user_profiles!inner(username)
      `)
      .order('max_streak', { ascending: false })
      .limit(5);
    
    console.log('Leaderboard data:', leaderboardData);
    console.log('Leaderboard error:', leaderboardError);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testLeaderboardQuery();
