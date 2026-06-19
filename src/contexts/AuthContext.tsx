import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { statsService, UserProfile } from '../services/statsService'
import { getStatsData } from '../domain/stats'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<UserProfile | null>
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
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const createUserProfile = useCallback(async (user: User) => {
    try {
      // Use email as username initially
      const username = user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`
      
      const createdProfile = await statsService.createUserProfile(user.id, username)
      setProfile(createdProfile)
      
      // Sync existing local stats or initialize with defaults
      const localStats = getStatsData()
      await statsService.syncStatsToSupabase(user.id, localStats)

      return createdProfile
    } catch (error) {
      console.error('AuthContext: Error creating user profile:', error)
      return null
    }
  }, [])

  const handleUserSignIn = useCallback(async (user: User) => {
    // Check if user profile exists, create if not
    try {
      const existingProfile = await statsService.getUserProfile(user.id)
      if (!existingProfile) {
        await createUserProfile(user)
      } else {
        setProfile(existingProfile)
        // Sync current local stats to Supabase for existing users
        const localStats = getStatsData()
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
      if (session?.user) {
        handleUserSignIn(session.user)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (!session?.user) {
          setProfile(null)
        }
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
    setProfile(null)
  }

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null)
      return null
    }

    const refreshedProfile = await statsService.getUserProfile(user.id)
    setProfile(refreshedProfile)
    return refreshedProfile
  }

  const value = {
    user,
    session,
    profile,
    loading,
    signOut,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
