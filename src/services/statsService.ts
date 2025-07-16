import { supabase } from '../lib/supabase'
import { StatsData } from '../domain/stats'

export interface UserProfile {
  id: string
  username: string
  created_at: string
  updated_at: string
}

export interface UserStats {
  id: string
  user_id: string
  current_streak: number
  max_streak: number
  played: number
  win_ratio: number
  average_best_distance: number
  guess_distribution: Record<string, number>
  created_at: string
  updated_at: string
}

export interface LeaderboardEntry {
  username: string
  max_streak: number
  current_streak: number
  played: number
  win_ratio: number
  rank: number
}

export const statsService = {
  async createUserProfile(userId: string, username: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([
        { id: userId, username }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating user profile:', error)
      return null
    }

    return data
  },

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }

    return data
  },

  async syncStatsToSupabase(userId: string, stats: StatsData): Promise<UserStats | null> {
    const { data, error } = await supabase
      .from('user_stats')
      .upsert([
        {
          user_id: userId,
          current_streak: stats.currentStreak,
          max_streak: stats.maxStreak,
          played: stats.played,
          win_ratio: stats.winRatio,
          average_best_distance: stats.averageBestDistance,
          guess_distribution: stats.guessDistribution,
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error syncing stats to Supabase:', error)
      return null
    }

    return data
  },

  async loadStatsFromSupabase(userId: string): Promise<UserStats | null> {
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error loading stats from Supabase:', error)
      return null
    }

    return data
  },

  async getLeaderboard(limit = 100): Promise<LeaderboardEntry[]> {
    console.log('statsService: Fetching leaderboard...')
    
    try {
      // Use direct REST API call instead of Supabase client to avoid auth issues
      const supabaseUrl = 'https://klqazjpyzxvsehgnjdth.supabase.co'
      const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtscWF6anB5enh2c2VoZ25qZHRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2ODczNDYsImV4cCI6MjA2ODI2MzM0Nn0.nuynZuXiyd2SLpv7ccdIDvoufmYpyRprps-NvkUDsMg'
      
      // Build the query URL for the REST API
      const queryUrl = `${supabaseUrl}/rest/v1/user_stats?select=max_streak,current_streak,played,win_ratio,user_profiles!inner(username)&order=max_streak.desc,current_streak.desc,played.desc&limit=${limit}`
      
      console.log('statsService: Using direct REST API call...')
      console.log('statsService: Query URL:', queryUrl)
      
      const response = await fetch(queryUrl, {
        method: 'GET',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      })
      
      console.log('statsService: REST API response status:', response.status)
      console.log('statsService: REST API response ok:', response.ok)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('statsService: REST API error:', errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      
      const data = await response.json()
      console.log('statsService: REST API raw data:', data)
      
      if (!data || data.length === 0) {
        console.log('statsService: No data found')
        return []
      }
      
      const leaderboard = (data as any[]).map((entry, index) => ({
        username: entry.user_profiles.username,
        max_streak: entry.max_streak,
        current_streak: entry.current_streak,
        played: entry.played,
        win_ratio: entry.win_ratio,
        rank: index + 1
      }))
      
      console.log('statsService: Processed leaderboard:', leaderboard)
      return leaderboard
      
    } catch (error) {
      console.error('statsService: getLeaderboard failed:', error)
      return []
    }
  },

  async getUserRank(userId: string): Promise<number | null> {
    const { data, error } = await supabase
      .rpc('get_user_rank', { user_id: userId })

    if (error) {
      console.error('Error fetching user rank:', error)
      return null
    }

    return data
  }
}
