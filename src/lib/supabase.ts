import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database'

const supabaseUrl = 'https://klqazjpyzxvsehgnjdth.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtscWF6anB5enh2c2VoZ25qZHRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2ODczNDYsImV4cCI6MjA2ODI2MzM0Nn0.nuynZuXiyd2SLpv7ccdIDvoufmYpyRprps-NvkUDsMg'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
