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
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* User rank info - only show if logged in and has rank */}
      {user && userRank && (
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('leaderboard.yourRank', { rank: userRank })}
          </p>
        </div>
      )}
      
      <div className="overflow-y-auto space-y-2">
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
