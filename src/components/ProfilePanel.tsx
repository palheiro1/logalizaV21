import React, { useEffect, useState } from "react";
import { Twemoji } from "react-emoji-render";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import {
  AVATAR_COLORS,
  AVATAR_EMOJIS,
  getAvatarColorClass,
  normalizeAvatarColor,
  normalizeAvatarEmoji,
} from "../domain/avatar";
import { statsService, UserProfile } from "../services/statsService";
import { Panel } from "./panels/Panel";

interface ProfilePanelProps {
  isOpen: boolean;
  close: () => void;
}

export const ProfilePanel: React.FC<ProfilePanelProps> = ({ isOpen, close }) => {
  const { t } = useTranslation();
  const { user, signOut, refreshProfile } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [username, setUsername] = useState("");
  const [avatarEmoji, setAvatarEmoji] = useState("");
  const [avatarColor, setAvatarColor] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      if (!user || !isOpen) {
        return;
      }

      setLoading(true);
      setError(null);
      const loadedProfile = await statsService.getUserProfile(user.id);
      if (!cancelled) {
        setProfile(loadedProfile);
        setUsername(loadedProfile?.username ?? "");
        setAvatarEmoji(normalizeAvatarEmoji(loadedProfile?.avatar_emoji));
        setAvatarColor(normalizeAvatarColor(loadedProfile?.avatar_color));
        setLoading(false);
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [isOpen, user]);

  const hasChanges =
    profile != null &&
    (username.trim() !== profile.username ||
      avatarEmoji !== normalizeAvatarEmoji(profile.avatar_emoji) ||
      avatarColor !== normalizeAvatarColor(profile.avatar_color));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !profile) return;

    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 2) {
      setError(t("username.tooShort"));
      return;
    }

    if (trimmedUsername.length > 20) {
      setError(t("username.tooLong"));
      return;
    }

    const validUsernameRegex = /^[a-zA-Z0-9\s._-]+$/;
    if (!validUsernameRegex.test(trimmedUsername)) {
      setError(t("username.invalidCharacters"));
      return;
    }

    setSaving(true);
    setError(null);
    const updatedProfile = await statsService.updateUserProfile(user.id, {
      username: trimmedUsername,
      avatar_emoji: normalizeAvatarEmoji(avatarEmoji),
      avatar_color: normalizeAvatarColor(avatarColor),
    });
    setSaving(false);

    if (!updatedProfile) {
      setError(t("profile.updateFailed"));
      return;
    }

    setProfile(updatedProfile);
    setUsername(updatedProfile.username);
    setAvatarEmoji(normalizeAvatarEmoji(updatedProfile.avatar_emoji));
    setAvatarColor(normalizeAvatarColor(updatedProfile.avatar_color));
    await refreshProfile();
    if (updatedProfile.avatarColumnsMissing) {
      setError(t("profile.avatarMigrationNeeded"));
    }
  };

  const handleSignOut = async () => {
    await signOut();
    close();
  };

  return (
    <Panel title={t("profile.title")} isOpen={isOpen} close={close}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full text-3xl ${getAvatarColorClass(
                  avatarColor
                )}`}
              >
                <Twemoji text={normalizeAvatarEmoji(avatarEmoji)} />
              </div>
              <div className="min-w-0 flex-1">
                <label
                  htmlFor="profile-username"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {t("username.newUsername")}
                </label>
                <input
                  id="profile-username"
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  maxLength={20}
                  disabled={saving}
                />
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("profile.avatar")}
              </p>
              <div className="grid grid-cols-6 gap-2">
                {AVATAR_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={`flex h-10 items-center justify-center rounded border text-xl ${
                      avatarEmoji === emoji
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-900"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                    onClick={() => setAvatarEmoji(emoji)}
                    disabled={saving}
                  >
                    <Twemoji text={emoji} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("profile.color")}
              </p>
              <div className="grid grid-cols-7 gap-2">
                {AVATAR_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`h-9 rounded-full border-2 ${getAvatarColorClass(
                      color
                    )} ${
                      avatarColor === color
                        ? "border-gray-900 dark:border-white"
                        : "border-transparent"
                    }`}
                    onClick={() => setAvatarColor(color)}
                    disabled={saving}
                    aria-label={color}
                  />
                ))}
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                type="submit"
                disabled={!hasChanges || saving}
                className="rounded bg-blue-600 px-4 py-2 font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? t("username.updating") : t("username.save")}
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={saving}
                className="rounded bg-gray-200 px-4 py-2 font-bold text-gray-800 transition-colors hover:bg-gray-300 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
              >
                {t("auth.signOut")}
              </button>
            </div>
          </>
        )}
      </form>
    </Panel>
  );
};
