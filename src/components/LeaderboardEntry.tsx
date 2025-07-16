import React from 'react'
import { LeaderboardEntry } from '../services/statsService'
import { useTranslation } from 'react-i18next'

interface LeaderboardEntryProps {
  entry: LeaderboardEntry
  isCurrentUser?: boolean
}

export const LeaderboardEntryComponent: React.FC<LeaderboardEntryProps> = ({ 
  entry, 
  isCurrentUser = false 
}) => {
  const { t } = useTranslation()
  
  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  return (
    <div className={`flex items-center p-3 rounded-lg ${
      isCurrentUser ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-50 dark:bg-gray-800'
    }`}>
      <div className="flex-shrink-0 w-12 text-center font-bold text-lg">
        {getRankEmoji(entry.rank)}
      </div>
      <div className="flex-1 ml-3">
        <div className="font-semibold text-gray-900 dark:text-gray-100">
          {entry.username}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {t('stats.played')}: {entry.played} | {t('stats.win')}: {Math.round(entry.win_ratio * 100)}%
        </div>
      </div>
      <div className="flex-shrink-0 text-right">
        <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {entry.max_streak}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {t('stats.maxStreak')}
        </div>
      </div>
      <div className="flex-shrink-0 text-right ml-4">
        <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
          {entry.current_streak}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {t('stats.currentStreak')}
        </div>
      </div>
    </div>
  )
}
