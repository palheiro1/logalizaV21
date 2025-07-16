import React, { useEffect, useState } from 'react'
import { LeaderboardEntry, statsService } from '../services/statsService'
import { LeaderboardEntryComponent } from './LeaderboardEntry'
import { useAuth } from '../contexts/AuthContext'
import { useTranslation } from 'react-i18next'

export const Leaderboard: React.FC = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [userRank, setUserRank] = useState<number | null>(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true)
        console.log('Leaderboard: Starting fetch...')
        
        const startTime = Date.now()
        const data = await statsService.getLeaderboard(100)
        const endTime = Date.now()
        
        console.log(`Leaderboard: Data received in ${endTime - startTime}ms:`, data)
        setLeaderboard(data)
        
        if (user) {
          console.log('Leaderboard: Fetching user rank for:', user.id)
          const rank = await statsService.getUserRank(user.id)
          console.log('Leaderboard: User rank:', rank)
          setUserRank(rank)
        }
      } catch (error) {
        console.error('Leaderboard: Error fetching leaderboard:', error)
        setLeaderboard([]) // Set empty array on error
      } finally {
        console.log('Leaderboard: Fetch complete, setting loading to false')
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [user])

  const handleRefresh = async () => {
    try {
      setLoading(true)
      console.log('Leaderboard: Manual refresh...')
      const data = await statsService.getLeaderboard(100)
      console.log('Leaderboard: Refresh data received:', data)
      setLeaderboard(data)
      
      if (user) {
        const rank = await statsService.getUserRank(user.id)
        console.log('Leaderboard: Refresh user rank:', rank)
        setUserRank(rank)
      }
    } catch (error) {
      console.error('Leaderboard: Error refreshing leaderboard:', error)
      setLeaderboard([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (leaderboard.length === 0) {
    return (
      <div className="text-center text-gray-600 dark:text-gray-400 py-8">
        <p>{t('leaderboard.noData')}</p>
        <button
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {t('leaderboard.refresh')}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t('leaderboard.title')}
        </h3>
        {user && userRank && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('leaderboard.yourRank', { rank: userRank })}
          </p>
        )}
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="mt-2 px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
        >
          {loading ? t('leaderboard.refreshing') : t('leaderboard.refresh')}
        </button>
      </div>
      
      <div className="max-h-96 overflow-y-auto space-y-2">
        {leaderboard.map((entry) => (
          <LeaderboardEntryComponent
            key={entry.username}
            entry={entry}
            isCurrentUser={user?.email === entry.username}
          />
        ))}
      </div>
    </div>
  )
}
