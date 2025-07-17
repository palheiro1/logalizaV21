import React from 'react'
import { Twemoji } from 'react-emoji-render'
import { useAuth } from '../../contexts/AuthContext'
import { useTranslation } from 'react-i18next'

interface AuthButtonProps {
  onLoginClick: () => void
}

export const AuthButton: React.FC<AuthButtonProps> = ({ onLoginClick }) => {
  const { user, signOut } = useAuth()
  const { t } = useTranslation()

  if (user) {
    return (
      <button
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200 group relative"
        type="button"
        onClick={signOut}
        title={t('auth.signOut')}
      >
        <Twemoji text="👤" className="text-lg group-hover:scale-110 transition-transform duration-200" />
        {/* Optional: Add a small indicator for logged in state */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></div>
      </button>
    )
  }

  return (
    <button
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200 group"
      type="button"
      onClick={onLoginClick}
      title={t('auth.login')}
    >
      <Twemoji text="🔐" className="text-lg group-hover:scale-110 transition-transform duration-200" />
    </button>
  )
}
