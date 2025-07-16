const { createClient } = require('@supabase/supabase-js')

// Create Supabase client
const supabase = createClient(
  'https://klqazjpyzxvsehgnjdth.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtscWF6anB5enh2c2VoZ25qZHRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2ODczNDYsImV4cCI6MjA2ODI2MzM0Nn0.nuynZuXiyd2SLpv7ccdIDvoufmYpyRprps-NvkUDsMg'
)

async function testRegistrationFlow() {
  console.log('Testing full registration flow...')
  
  try {
    // Step 1: Register a new user
    const testEmail = 'testuser2@gmail.com'
    const testPassword = 'testpassword123'
    
    console.log('\n1. Attempting to register:', testEmail)
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    })
    
    if (signUpError) {
      console.log('❌ Sign up error:', signUpError.message)
      return
    }
    
    console.log('✅ Sign up successful')
    console.log('User ID:', signUpData.user?.id)
    console.log('Email:', signUpData.user?.email)
    console.log('Email confirmed:', signUpData.user?.email_confirmed_at)
    
    // Step 2: Try to create user profile
    if (signUpData.user) {
      console.log('\n2. Creating user profile...')
      const username = signUpData.user.email?.split('@')[0] || 'testuser'
      
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .insert([
          { id: signUpData.user.id, username }
        ])
        .select()
        .single()
      
      if (profileError) {
        console.log('❌ Profile creation error:', profileError.message)
        console.log('Error details:', profileError)
      } else {
        console.log('✅ Profile created successfully:', profileData)
      }
      
      // Step 3: Try to create user stats
      console.log('\n3. Creating user stats...')
      
      const { data: statsData, error: statsError } = await supabase
        .from('user_stats')
        .insert([
          {
            user_id: signUpData.user.id,
            current_streak: 0,
            max_streak: 0,
            played: 0,
            win_ratio: 0,
            average_best_distance: 0,
            guess_distribution: { "1": 0, "2": 0, "3": 0, "4": 0 }
          }
        ])
        .select()
        .single()
      
      if (statsError) {
        console.log('❌ Stats creation error:', statsError.message)
        console.log('Error details:', statsError)
      } else {
        console.log('✅ Stats created successfully:', statsData)
      }
    }
    
    // Step 4: Try to sign in
    console.log('\n4. Testing sign in...')
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    })
    
    if (signInError) {
      console.log('❌ Sign in error:', signInError.message)
    } else {
      console.log('✅ Sign in successful:', signInData.user?.email)
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message)
  }
}

testRegistrationFlow()
