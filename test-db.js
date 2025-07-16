const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://klqazjpyzxvsehgnjdth.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtscWF6anB5enh2c2VoZ25qZHRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2ODczNDYsImV4cCI6MjA2ODI2MzM0Nn0.nuynZuXiyd2SLpv7ccdIDvoufmYpyRprps-NvkUDsMg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabase() {
  console.log('Testing database connection...');
  
  try {
    // Test 1: Check if tables exist
    console.log('\n1. Checking if user_profiles table exists...');
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('Error with user_profiles:', profilesError);
    } else {
      console.log('✅ user_profiles table exists, data:', profiles);
    }

    // Test 2: Check if user_stats table exists
    console.log('\n2. Checking if user_stats table exists...');
    const { data: stats, error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .limit(1);
    
    if (statsError) {
      console.error('Error with user_stats:', statsError);
    } else {
      console.log('✅ user_stats table exists, data:', stats);
    }

    // Test 3: Try the exact leaderboard query
    console.log('\n3. Testing leaderboard query...');
    const { data: leaderboard, error: leaderboardError } = await supabase
      .from('user_stats')
      .select(`
        max_streak,
        current_streak,
        played,
        win_ratio,
        user_profiles!inner(username)
      `)
      .order('max_streak', { ascending: false })
      .order('current_streak', { ascending: false })
      .order('played', { ascending: false })
      .limit(10);

    if (leaderboardError) {
      console.error('❌ Leaderboard query error:', leaderboardError);
    } else {
      console.log('✅ Leaderboard query successful:', leaderboard);
    }

    // Test 4: Check authentication
    console.log('\n4. Checking authentication...');
    const { data: user, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Auth error:', authError);
    } else {
      console.log('Auth status:', user);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testDatabase();
