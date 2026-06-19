import React, { useEffect, useState } from 'react'
import { LeaderboardEntry, statsService } from '../services/statsService'
import { LeaderboardEntryComponent } from './LeaderboardEntry'
import { useAuth } from '../contexts/AuthContext'
import { useTranslation } from 'react-i18next'

interface LeaderboardProps {
  isActive: boolean
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ isActive }) => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [userRank, setUserRank] = useState<number | null>(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!isActive) {
        return
      }
      try {
        setLoading(true)
        
        const data = await statsService.getLeaderboard(100)
        setLeaderboard(data)
        
        if (user) {
          const rank = await statsService.getUserRank(user.id)
          setUserRank(rank)
        }
      } catch (error) {
        console.error('Leaderboard: Error fetching leaderboard:', error)
        setLeaderboard([]) // Set empty array on error
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [isActive, user])

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
            key={entry.user_id}
            entry={entry}
            isCurrentUser={user?.id === entry.user_id}
          />
        ))}
      </div>
    </div>
  )
}
