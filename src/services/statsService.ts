import { supabase } from '../lib/supabase'
import { StatsData } from '../domain/stats'
import { Guess } from '../domain/guess'
import { calculateDailyScore } from '../domain/scoring'
import { DateTime } from 'luxon'
import { DEFAULT_AVATAR_COLOR, DEFAULT_AVATAR_EMOJI } from '../domain/avatar'

export interface UserProfile {
  id: string
  username: string
  avatar_emoji: string
  avatar_color: string
  created_at: string
  updated_at: string
  avatarColumnsMissing?: boolean
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
  user_id: string
  username: string
  avatar_emoji: string
  avatar_color: string
  max_streak: number
  current_streak: number
  played: number
  win_ratio: number
  rank: number
}

export interface DailyResult {
  id: string
  user_id: string
  game_date: string
  guesses: Guess[]
  completed: boolean
  won: boolean
  tries_count: number | null
  best_distance: number | null
  shield_bonus: boolean
  map_bonus: boolean
  main_score: number
  bonus_score: number
  total_score: number
  created_at: string
  updated_at: string
}

export interface MonthlyLeaderboardEntry {
  user_id: string
  username: string
  avatar_emoji: string
  avatar_color: string
  total_score: number
  days_played: number
  wins: number
  bonus_score: number
  today_score: number
  today_main_score: number
  today_bonus_score: number
  rank: number
  previous_rank: number
  rank_delta: number
}

export const statsService = {
  async createUserProfile(userId: string, username: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([
        {
          id: userId,
          username,
          avatar_emoji: DEFAULT_AVATAR_EMOJI,
          avatar_color: DEFAULT_AVATAR_COLOR
        }
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
    const existingProfile = await statsService.getUserProfile(userId)
    return statsService.updateUserProfile(userId, {
      username: newUsername,
      avatar_emoji: existingProfile?.avatar_emoji ?? DEFAULT_AVATAR_EMOJI,
      avatar_color: existingProfile?.avatar_color ?? DEFAULT_AVATAR_COLOR
    })
  },

  async updateUserProfile(
    userId: string,
    updates: Pick<UserProfile, 'username' | 'avatar_emoji' | 'avatar_color'>
  ): Promise<UserProfile | null> {
    const updatedAt = new Date().toISOString()
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ 
        ...updates,
        updated_at: updatedAt
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST204' && error.message.includes('avatar_')) {
        const { data: usernameData, error: usernameError } = await supabase
          .from('user_profiles')
          .update({
            username: updates.username,
            updated_at: updatedAt
          })
          .eq('id', userId)
          .select()
          .single()

        if (usernameError) {
          console.error('Error updating username:', usernameError)
          return null
        }

        return {
          ...usernameData,
          avatar_emoji: DEFAULT_AVATAR_EMOJI,
          avatar_color: DEFAULT_AVATAR_COLOR,
          avatarColumnsMissing: true
        } as UserProfile
      }

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

  async syncDailyResultToSupabase(
    userId: string,
    gameDate: string,
    guesses: Guess[],
    guessedShield: boolean,
    guessedMap: boolean
  ): Promise<DailyResult | null> {
    const score = calculateDailyScore(guesses, guessedShield, guessedMap)

    if (!score.completed) {
      return null
    }

    const dailyResult = {
      user_id: userId,
      game_date: gameDate,
      guesses,
      completed: score.completed,
      won: score.won,
      tries_count: score.triesCount,
      best_distance: score.bestDistance,
      shield_bonus: score.won && guessedShield,
      map_bonus: score.won && guessedMap,
      main_score: score.mainScore,
      bonus_score: score.bonusScore,
      total_score: score.totalScore,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('daily_results')
      .upsert(dailyResult, { onConflict: 'user_id,game_date' })
      .select()
      .single()

    if (error) {
      console.error('Error syncing daily result:', error)
      return null
    }

    return data as DailyResult
  },

  async getMonthlyLeaderboard(dayString: string, limit = 100): Promise<MonthlyLeaderboardEntry[]> {
    const monthStart = DateTime.fromFormat(dayString, 'yyyy-MM-dd')
      .startOf('month')
      .toFormat('yyyy-MM-dd')

    const { data, error } = await supabase.rpc('get_monthly_leaderboard', {
      target_month_start: monthStart,
      target_today: dayString
    })

    if (error) {
      console.error('Error fetching monthly leaderboard:', error)
      return []
    }

    const rows = (data ?? []) as MonthlyLeaderboardEntry[]

    return rows.slice(0, limit).map((entry: MonthlyLeaderboardEntry) => ({
      user_id: entry.user_id,
      username: entry.username,
      avatar_emoji: entry.avatar_emoji ?? DEFAULT_AVATAR_EMOJI,
      avatar_color: entry.avatar_color ?? DEFAULT_AVATAR_COLOR,
      total_score: Number(entry.total_score),
      days_played: Number(entry.days_played),
      wins: Number(entry.wins),
      bonus_score: Number(entry.bonus_score),
      today_score: Number(entry.today_score),
      today_main_score: Number(entry.today_main_score),
      today_bonus_score: Number(entry.today_bonus_score),
      rank: Number(entry.rank),
      previous_rank: Number(entry.previous_rank),
      rank_delta: Number(entry.rank_delta)
    }))
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
            user_id: stat.user_id,
            username: profile.username,
            avatar_emoji: profile.avatar_emoji ?? DEFAULT_AVATAR_EMOJI,
            avatar_color: profile.avatar_color ?? DEFAULT_AVATAR_COLOR,
            max_streak: stat.max_streak,
            current_streak: stat.current_streak,
            played: stat.played,
            win_ratio: parseFloat(stat.win_ratio),
            rank: 0 // Will be set after sorting
          }
        })
        .filter((entry): entry is LeaderboardEntry => entry !== null)
        .sort((a, b) => {
          // Sort by max_streak desc, then current_streak desc, then win_ratio desc, then played desc
          if (a.max_streak !== b.max_streak) return b.max_streak - a.max_streak
          if (a.current_streak !== b.current_streak) return b.current_streak - a.current_streak
          if (a.win_ratio !== b.win_ratio) return b.win_ratio - a.win_ratio
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
