// Test script to isolate the browser authentication issue
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://klqazjpyzxvsehgnjdth.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtscWF6anB5enh2c2VoZ25qZHRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2ODczNDYsImV4cCI6MjA2ODI2MzM0Nn0.nuynZuXiyd2SLpv7ccdIDvoufmYpyRprps-NvkUDsMg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testBrowserContext() {
  console.log('Testing browser-like authentication context...');
  
  // Test 1: Query without authentication (like browser anonymous)
  console.log('\n1. Testing anonymous query (no auth)...');
  try {
    const { data, error } = await supabase
      .from('user_stats')
      .select(`
        max_streak,
        current_streak,
        played,
        win_ratio,
        user_profiles!inner(username)
      `)
      .limit(5);
    
    console.log('Anonymous query result:', data);
    console.log('Anonymous query error:', error);
  } catch (err) {
    console.error('Anonymous query exception:', err);
  }
  
  // Test 2: Sign in with the user we saw in the logs
  console.log('\n2. Testing with user authentication...');
  try {
    // This simulates what happens in the browser
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'wio08625@toaik.com',
      password: 'testpassword' // This will fail, but let's see what happens
    });
    
    console.log('Sign in result:', authData);
    console.log('Sign in error:', authError);
    
    // Now try the query with authentication
    const { data, error } = await supabase
      .from('user_stats')
      .select(`
        max_streak,
        current_streak,
        played,
        win_ratio,
        user_profiles!inner(username)
      `)
      .limit(5);
    
    console.log('Authenticated query result:', data);
    console.log('Authenticated query error:', error);
  } catch (err) {
    console.error('Authenticated query exception:', err);
  }
  
  // Test 3: Check current auth state
  console.log('\n3. Checking current auth state...');
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    console.log('Current user:', user);
    console.log('Auth error:', error);
  } catch (err) {
    console.error('Auth state exception:', err);
  }
}

testBrowserContext();
