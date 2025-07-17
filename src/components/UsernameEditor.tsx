import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { statsService } from '../services/statsService'
import { useAuth } from '../contexts/AuthContext'

interface UsernameEditorProps {
  currentUsername: string
  onUsernameUpdate: (newUsername: string) => void
  onCancel: () => void
}

export const UsernameEditor: React.FC<UsernameEditorProps> = ({
  currentUsername,
  onUsernameUpdate,
  onCancel
}) => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [newUsername, setNewUsername] = useState(currentUsername)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const trimmedUsername = newUsername.trim()
    
    if (trimmedUsername === currentUsername) {
      onCancel()
      return
    }

    if (trimmedUsername.length < 2) {
      setError(t('username.tooShort'))
      return
    }

    if (trimmedUsername.length > 20) {
      setError(t('username.tooLong'))
      return
    }

    // Basic validation - only allow alphanumeric, spaces, and common symbols
    const validUsernameRegex = /^[a-zA-Z0-9\s._-]+$/
    if (!validUsernameRegex.test(trimmedUsername)) {
      setError(t('username.invalidCharacters'))
      return
    }

    try {
      setIsUpdating(true)
      setError(null)
      
      const updatedProfile = await statsService.updateUsername(user.id, trimmedUsername)
      
      if (updatedProfile) {
        onUsernameUpdate(trimmedUsername)
      } else {
        setError(t('username.updateFailed'))
      }
    } catch (error) {
      console.error('Error updating username:', error)
      setError(t('username.updateFailed'))
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        {t('username.edit')}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('username.newUsername')}
          </label>
          <input
            id="username"
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder={t('username.placeholder')}
            maxLength={20}
            disabled={isUpdating}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t('username.requirements')}
          </p>
        </div>
        
        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
        
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isUpdating || newUsername.trim() === currentUsername}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUpdating ? t('username.updating') : t('username.save')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isUpdating}
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 disabled:opacity-50 transition-colors"
          >
            {t('username.cancel')}
          </button>
        </div>
      </form>
    </div>
  )
}
