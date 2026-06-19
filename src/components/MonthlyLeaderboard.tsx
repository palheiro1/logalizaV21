import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getDayString } from "../hooks/useTodays";
import { useAuth } from "../contexts/AuthContext";
import {
  MonthlyLeaderboardEntry,
  statsService,
} from "../services/statsService";
import { Twemoji } from "react-emoji-render";
import { getAvatarColorClass, normalizeAvatarEmoji } from "../domain/avatar";

interface MonthlyLeaderboardProps {
  isActive: boolean;
}

export const MonthlyLeaderboard: React.FC<MonthlyLeaderboardProps> = ({ isActive }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<MonthlyLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchLeaderboard() {
      if (!isActive) {
        return;
      }
      setLoading(true);
      const data = await statsService.getMonthlyLeaderboard(getDayString(), 100);
      if (!cancelled) {
        setLeaderboard(data);
        setLoading(false);
      }
    }

    fetchLeaderboard();

    return () => {
      cancelled = true;
    };
  }, [isActive]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="py-8 text-center text-gray-600 dark:text-gray-400">
        <p>{t("leaderboard.noData")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {leaderboard.map((entry) => (
        <MonthlyLeaderboardRow
          key={entry.user_id}
          entry={entry}
          isCurrentUser={user?.id === entry.user_id}
        />
      ))}
    </div>
  );
};

function MonthlyLeaderboardRow({
  entry,
  isCurrentUser,
}: {
  entry: MonthlyLeaderboardEntry;
  isCurrentUser: boolean;
}) {
  const { t } = useTranslation();

  return (
    <div
      className={`flex items-center rounded-lg p-3 ${
        isCurrentUser
          ? "bg-blue-100 dark:bg-blue-900"
          : "bg-gray-50 dark:bg-gray-800"
      }`}
    >
      <div className="w-12 flex-shrink-0 text-center text-lg font-bold">
        #{entry.rank}
      </div>
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg ${getAvatarColorClass(
          entry.avatar_color
        )}`}
      >
        <Twemoji text={normalizeAvatarEmoji(entry.avatar_emoji)} />
      </div>
      <div className="ml-3 min-w-0 flex-1">
        <div className="truncate font-semibold text-gray-900 dark:text-gray-100">
          {entry.username}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {entry.days_played} {t("championship.days")} | {entry.wins}{" "}
          {t("championship.wins")} | +{entry.bonus_score}{" "}
          {t("championship.bonus")}
        </div>
      </div>
      <div className="flex-shrink-0 text-right">
        <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {entry.total_score}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {t("championship.points")}
        </div>
      </div>
      <div className="ml-3 w-12 flex-shrink-0 text-right text-sm font-bold">
        {entry.rank_delta > 0 && (
          <span className="text-green-600">+{entry.rank_delta}</span>
        )}
        {entry.rank_delta < 0 && (
          <span className="text-red-600">{entry.rank_delta}</span>
        )}
        {entry.rank_delta === 0 && (
          <span className="text-gray-500">=</span>
        )}
      </div>
    </div>
  );
}
