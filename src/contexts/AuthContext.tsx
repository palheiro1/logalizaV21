import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { statsService, statsDataFromUserStats, UserProfile } from '../services/statsService'
import { calculateStatsData, loadStatsBaseline, saveStatsBaseline } from '../domain/stats'
import { loadAllGuesses } from '../domain/guess'
import { claimGuestGame, gameStorageKey } from '../domain/gameStorage'
import { DateTime } from 'luxon'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  historyReady: boolean
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
  const [historyReady, setHistoryReady] = useState(false)

  const activeUserId = useRef<string | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    let receivedAuthEvent = false

    const updateSession = (nextSession: Session | null) => {
      if (cancelled) return
      const nextUserId = nextSession?.user.id
      if (activeUserId.current !== nextUserId) {
        activeUserId.current = nextUserId
        setProfile(null)
        setHistoryReady(false)
        setLoading(Boolean(nextUserId))
      }
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      if (!nextUserId) setLoading(false)
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        receivedAuthEvent = true
        updateSession(nextSession)
      }
    )
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!receivedAuthEvent) updateSession(session)
    }).catch(error => {
      console.error('AuthContext: Error loading session:', error)
      if (!receivedAuthEvent) updateSession(null)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  const userId = user?.id
  useEffect(() => {
    if (!userId || !user) return
    let cancelled = false
    const signedInUser = user
    const accountId = userId
    const isCurrentAccount = () => !cancelled && activeUserId.current === accountId

    async function loadAccount() {
      try {
        const [existingProfile, history] = await Promise.all([
          statsService.getUserProfile(accountId),
          statsService.loadAccountHistory(accountId)
        ])
        if (!isCurrentAccount()) return

        const previousBaseline = loadStatsBaseline(accountId)
        // If the statistics write failed after a daily result was saved, that
        // result must still count as new relative to our acknowledged snapshot.
        const baselineGuesses = previousBaseline && previousBaseline.updatedAt === history.stats?.updated_at
          ? previousBaseline.guesses : history.guesses
        saveStatsBaseline(accountId, {
          stats: history.stats ? statsDataFromUserStats(history.stats) : calculateStatsData(baselineGuesses),
          guesses: baselineGuesses,
          updatedAt: history.stats?.updated_at ?? ''
        })
        localStorage.setItem(gameStorageKey('guesses', accountId), JSON.stringify({
          ...loadAllGuesses(accountId), ...history.guesses
        }))
        claimGuestGame(accountId, DateTime.now().setZone("Europe/Madrid").toISODate())
        setHistoryReady(true)

        let accountProfile = existingProfile
        if (!accountProfile) {
          const username = signedInUser.email?.split('@')[0] || `user_${accountId.slice(0, 8)}`
          accountProfile = await statsService.createUserProfile(accountId, username)
        }
        if (isCurrentAccount()) setProfile(accountProfile)
      } catch (error) {
        console.error('AuthContext: Error loading account:', error)
      } finally {
        if (isCurrentAccount()) setLoading(false)
      }
    }

    // Supabase API calls must run outside onAuthStateChange's auth lock.
    const timer = setTimeout(loadAccount, 0)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [userId])

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
    if (activeUserId.current !== user.id) return null
    setProfile(refreshedProfile)
    return refreshedProfile
  }

  const value = {
    user,
    session,
    profile,
    loading,
    historyReady,
    signOut,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
