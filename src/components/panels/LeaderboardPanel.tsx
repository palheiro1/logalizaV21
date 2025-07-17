import React, { useState, useEffect, useCallback } from 'react'
import { Panel } from './Panel'
import { Leaderboard } from '../Leaderboard'
import { UsernameEditor } from '../UsernameEditor'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { statsService, UserProfile } from '../../services/statsService'

interface LeaderboardPanelProps {
  isOpen: boolean
  close: () => void
}

export const LeaderboardPanel: React.FC<LeaderboardPanelProps> = ({ isOpen, close }) => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [currentUsername, setCurrentUsername] = useState<string>('')
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  const loadUserProfile = useCallback(async () => {
    if (!user) return
    
    try {
      const profile = await statsService.getUserProfile(user.id)
      if (profile) {
        setUserProfile(profile)
        setCurrentUsername(profile.username)
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }, [user])

  useEffect(() => {
    if (user && isOpen) {
      loadUserProfile()
    }
  }, [user, isOpen, loadUserProfile])

  const handleUsernameUpdate = (newUsername: string) => {
    setCurrentUsername(newUsername)
    setIsEditingUsername(false)
    // Trigger leaderboard refresh by updating the userProfile
    if (userProfile) {
      setUserProfile({ ...userProfile, username: newUsername })
    }
  }

  const handleEditUsernameClick = () => {
    setIsEditingUsername(true)
  }

  const handleCancelEdit = () => {
    setIsEditingUsername(false)
  }

  return (
    <Panel title={t('leaderboard.title')} isOpen={isOpen} close={close}>
      <div className="space-y-4">
        {/* Username section for authenticated users */}
        {user && userProfile && (
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            {isEditingUsername ? (
              <UsernameEditor
                currentUsername={currentUsername}
                onUsernameUpdate={handleUsernameUpdate}
                onCancel={handleCancelEdit}
              />
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('username.yourUsername')}:
                  </p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {currentUsername}
                  </p>
                </div>
                <button
                  onClick={handleEditUsernameClick}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  {t('username.edit')}
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Leaderboard */}
        <Leaderboard key={userProfile?.username} />
      </div>
    </Panel>
  )
}
