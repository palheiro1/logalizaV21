export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          username: string
          avatar_emoji: string
          avatar_color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          avatar_emoji?: string
          avatar_color?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          avatar_emoji?: string
          avatar_color?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_stats: {
        Row: {
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
        Insert: {
          id?: string
          user_id: string
          current_streak?: number
          max_streak?: number
          played?: number
          win_ratio?: number
          average_best_distance?: number
          guess_distribution?: Record<string, number>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          current_streak?: number
          max_streak?: number
          played?: number
          win_ratio?: number
          average_best_distance?: number
          guess_distribution?: Record<string, number>
          created_at?: string
          updated_at?: string
        }
      }
      daily_results: {
        Row: {
          id: string
          user_id: string
          game_date: string
          guesses: Json
          completed: boolean
          won: boolean
          tries_count: number | null
          best_distance: number | null
          shield_bonus: boolean
          map_bonus: boolean
          municipalities_bonus: boolean
          main_score: number
          bonus_score: number
          total_score: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          game_date: string
          guesses: Json
          completed?: boolean
          won?: boolean
          tries_count?: number | null
          best_distance?: number | null
          shield_bonus?: boolean
          map_bonus?: boolean
          municipalities_bonus?: boolean
          main_score?: number
          bonus_score?: number
          total_score?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          game_date?: string
          guesses?: Json
          completed?: boolean
          won?: boolean
          tries_count?: number | null
          best_distance?: number | null
          shield_bonus?: boolean
          map_bonus?: boolean
          municipalities_bonus?: boolean
          main_score?: number
          bonus_score?: number
          total_score?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      get_user_rank: {
        Args: {
          user_id: string
        }
        Returns: number
      }
      get_monthly_leaderboard: {
        Args: {
          target_month_start: string
          target_today: string
        }
        Returns: {
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
        }[]
      }
      submit_daily_result: {
        Args: {
          target_game_date: string
          submitted_guesses: Json
          submitted_shield_bonus?: boolean
          submitted_map_bonus?: boolean
          submitted_municipalities_bonus?: boolean
        }
        Returns: {
          id: string
          user_id: string
          game_date: string
          guesses: Json
          completed: boolean
          won: boolean
          tries_count: number | null
          best_distance: number | null
          shield_bonus: boolean
          map_bonus: boolean
          municipalities_bonus: boolean
          main_score: number
          bonus_score: number
          total_score: number
          created_at: string
          updated_at: string
        }
      }
    }
  }
}
