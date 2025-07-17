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

  async updateUsername(userId: string, newUsername: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ 
        username: newUsername,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating username:', error)
      return null
    }

    return data
  },

  async syncStatsToSupabase(userId: string, stats: StatsData): Promise<UserStats | null> {
    console.log('statsService: Syncing stats for user:', userId)
    
    // First check if user already has stats
    const { data: existing, error: fetchError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking existing stats:', fetchError)
      return null
    }

    const statsRecord = {
      user_id: userId,
      current_streak: stats.currentStreak,
      max_streak: stats.maxStreak,
      played: stats.played,
      win_ratio: stats.winRatio,
      average_best_distance: stats.averageBestDistance,
      guess_distribution: stats.guessDistribution,
      updated_at: new Date().toISOString()
    }

    let result;
    if (existing && existing.length > 0) {
      // Update existing record
      const { data, error } = await supabase
        .from('user_stats')
        .update(statsRecord)
        .eq('id', existing[0].id)
        .select()
        .single()

      if (error) {
        console.error('Error updating stats:', error)
        return null
      }
      result = data
    } else {
      // Create new record
      const { data, error } = await supabase
        .from('user_stats')
        .insert([statsRecord])
        .select()
        .single()

      if (error) {
        console.error('Error creating stats:', error)
        return null
      }
      result = data
    }

    console.log('statsService: Stats synced successfully:', result)
    return result
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
      // First, get all user stats with the latest record for each user
      const { data: statsData, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .order('updated_at', { ascending: false })

      if (statsError) {
        console.error('statsService: Stats query error:', statsError)
        throw statsError
      }

      console.log('statsService: Raw stats data:', statsData)

      if (!statsData || statsData.length === 0) {
        console.log('statsService: No stats data found')
        return []
      }

      // Get unique user stats (latest record per user)
      const userStatsMap = new Map()
      statsData.forEach(stat => {
        if (!userStatsMap.has(stat.user_id) || 
            new Date(stat.updated_at) > new Date(userStatsMap.get(stat.user_id).updated_at)) {
          userStatsMap.set(stat.user_id, stat)
        }
      })

      const uniqueStats = Array.from(userStatsMap.values())
      console.log('statsService: Unique stats:', uniqueStats)

      // Get user profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')

      if (profilesError) {
        console.error('statsService: Profiles query error:', profilesError)
        throw profilesError
      }

      console.log('statsService: Profiles data:', profilesData)

      if (!profilesData || profilesData.length === 0) {
        console.log('statsService: No profiles data found')
        return []
      }

      // Create profiles map for quick lookup
      const profilesMap = new Map()
      profilesData.forEach(profile => {
        profilesMap.set(profile.id, profile)
      })

      // Join data and create leaderboard
      const leaderboard = uniqueStats
        .map(stat => {
          const profile = profilesMap.get(stat.user_id)
          if (!profile) {
            console.warn('statsService: No profile found for user:', stat.user_id)
            return null
          }
          
          return {
            username: profile.username,
            max_streak: stat.max_streak,
            current_streak: stat.current_streak,
            played: stat.played,
            win_ratio: parseFloat(stat.win_ratio),
            rank: 0 // Will be set after sorting
          }
        })
        .filter((entry): entry is LeaderboardEntry => entry !== null)
        .sort((a, b) => {
          // Sort by max_streak desc, then current_streak desc, then played desc
          if (a.max_streak !== b.max_streak) return b.max_streak - a.max_streak
          if (a.current_streak !== b.current_streak) return b.current_streak - a.current_streak
          return b.played - a.played
        })
        .slice(0, limit)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1
        }))

      console.log('statsService: Final leaderboard:', leaderboard)
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
