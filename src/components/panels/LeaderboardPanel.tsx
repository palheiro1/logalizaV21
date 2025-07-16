import React from 'react'
import { Panel } from './Panel'
import { Leaderboard } from '../Leaderboard'
import { useTranslation } from 'react-i18next'

interface LeaderboardPanelProps {
  isOpen: boolean
  close: () => void
}

export const LeaderboardPanel: React.FC<LeaderboardPanelProps> = ({ isOpen, close }) => {
  const { t } = useTranslation()

  return (
    <Panel title={t('leaderboard.title')} isOpen={isOpen} close={close}>
      <Leaderboard />
    </Panel>
  )
}
