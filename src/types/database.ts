export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          username: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
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
          guesses: any
          completed: boolean
          tries_count: number | null
          best_distance: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          game_date: string
          guesses: any
          completed?: boolean
          tries_count?: number | null
          best_distance?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          game_date?: string
          guesses?: any
          completed?: boolean
          tries_count?: number | null
          best_distance?: number | null
          created_at?: string
        }
      }
    }
  }
}
