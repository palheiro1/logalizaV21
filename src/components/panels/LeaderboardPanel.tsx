import React, { useState } from 'react'
import { Panel } from './Panel'
import { Leaderboard } from '../Leaderboard'
import { MonthlyLeaderboard } from '../MonthlyLeaderboard'
import { useTranslation } from 'react-i18next'

interface LeaderboardPanelProps {
  isOpen: boolean
  close: () => void
}

export const LeaderboardPanel: React.FC<LeaderboardPanelProps> = ({ isOpen, close }) => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'month' | 'general'>('month')

  return (
    <Panel title={t('leaderboard.title')} isOpen={isOpen} close={close}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            className={`rounded px-3 py-2 text-sm font-bold ${
              activeTab === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
            }`}
            type="button"
            onClick={() => setActiveTab('month')}
          >
            {t('leaderboard.month')}
          </button>
          <button
            className={`rounded px-3 py-2 text-sm font-bold ${
              activeTab === 'general'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
            }`}
            type="button"
            onClick={() => setActiveTab('general')}
          >
            {t('leaderboard.general')}
          </button>
        </div>

        {activeTab === 'month' ? (
          <MonthlyLeaderboard />
        ) : (
          <Leaderboard />
        )}
      </div>
    </Panel>
  )
}
