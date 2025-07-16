// Simple test to verify the leaderboard is working
// Open browser console and paste this code to test

async function testLeaderboard() {
  try {
    console.log('Testing leaderboard in browser...')
    
    // Access the global supabase client if available
    const supabase = window.supabase || (await import('../lib/supabase')).supabase
    
    console.log('Testing direct query...')
    const { data, error } = await supabase
      .from('user_stats')
      .select(`
        max_streak,
        current_streak,
        played,
        win_ratio,
        user_profiles!inner(username)
      `)
      .order('max_streak', { ascending: false })
      .limit(5)
    
    if (error) {
      console.error('❌ Browser query failed:', error)
    } else {
      console.log('✅ Browser query success:', data)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testLeaderboard()
