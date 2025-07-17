import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { statsService } from '../services/statsService'
import { getStatsData } from '../domain/stats'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const createUserProfile = useCallback(async (user: User) => {
    console.log('AuthContext: Creating user profile for:', user.id, user.email)
    try {
      // Use email as username initially
      const username = user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`
      
      console.log('AuthContext: Creating profile with username:', username)
      const profile = await statsService.createUserProfile(user.id, username)
      console.log('AuthContext: Profile created:', profile)
      
      // Sync existing local stats or initialize with defaults
      console.log('AuthContext: Syncing local stats to Supabase...')
      const localStats = getStatsData()
      console.log('AuthContext: Local stats found:', localStats)
      
      const stats = await statsService.syncStatsToSupabase(user.id, localStats)
      console.log('AuthContext: Stats synced:', stats)
    } catch (error) {
      console.error('AuthContext: Error creating user profile:', error)
    }
  }, [])

  const handleUserSignIn = useCallback(async (user: User) => {
    // Check if user profile exists, create if not
    try {
      console.log('AuthContext: Checking if user profile exists...')
      const profile = await statsService.getUserProfile(user.id)
      console.log('AuthContext: Profile check result:', profile)
      if (!profile) {
        console.log('AuthContext: No profile found, creating new one...')
        await createUserProfile(user)
      } else {
        console.log('AuthContext: Profile exists, syncing current local stats...')
        // Sync current local stats to Supabase for existing users
        const localStats = getStatsData()
        console.log('AuthContext: Syncing local stats:', localStats)
        await statsService.syncStatsToSupabase(user.id, localStats)
      }
    } catch (error) {
      console.error('AuthContext: Error checking/creating user profile:', error)
    }
  }, [createUserProfile])

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext: Auth state changed:', event, session?.user?.email)
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        // IMPORTANT: Do NOT make API calls here due to supabase-js deadlock bug
        // Schedule profile creation for next tick to avoid deadlock
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(() => {
            handleUserSignIn(session.user)
          }, 0)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [handleUserSignIn])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = {
    user,
    session,
    loading,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
