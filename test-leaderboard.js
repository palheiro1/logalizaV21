const { createClient } = require('@supabase/supabase-js')

// Create Supabase client
const supabase = createClient(
  'https://klqazjpyzxvsehgnjdth.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtscWF6anB5enh2c2VoZ25qZHRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2ODczNDYsImV4cCI6MjA2ODI2MzM0Nn0.nuynZuXiyd2SLpv7ccdIDvoufmYpyRprps-NvkUDsMg'
)

async function testLeaderboard() {
  console.log('Testing leaderboard query...')
  
  try {
    // Test the leaderboard query
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
      .order('current_streak', { ascending: false })
      .order('played', { ascending: false })
      .limit(10)
    
    if (error) {
      console.log('❌ Leaderboard query error:', error)
    } else {
      console.log('✅ Leaderboard query successful')
      console.log('Raw data:', JSON.stringify(data, null, 2))
      
      const leaderboard = data.map((entry, index) => ({
        rank: index + 1,
        username: entry.user_profiles.username,
        max_streak: entry.max_streak,
        current_streak: entry.current_streak,
        played: entry.played,
        win_ratio: entry.win_ratio
      }))
      
      console.log('\nFormatted leaderboard:')
      leaderboard.forEach(entry => {
        console.log(`${entry.rank}. ${entry.username} - Max: ${entry.max_streak}, Current: ${entry.current_streak}, Played: ${entry.played}`)
      })
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message)
  }
}

testLeaderboard()
