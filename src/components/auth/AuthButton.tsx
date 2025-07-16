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
        className="flex items-center text-xl hover:opacity-75 transition-opacity"
        type="button"
        onClick={signOut}
        title={t('auth.signOut')}
      >
        <Twemoji text="👤" />
      </button>
    )
  }

  return (
    <button
      className="flex items-center text-xl hover:opacity-75 transition-opacity"
      type="button"
      onClick={onLoginClick}
      title={t('auth.login')}
    >
      <Twemoji text="🔐" />
    </button>
  )
}
