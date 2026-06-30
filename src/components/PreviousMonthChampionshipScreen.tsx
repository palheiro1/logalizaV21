import React from "react";
import { Twemoji } from "react-emoji-render";
import { useTranslation } from "react-i18next";
import { getAvatarColorClass, normalizeAvatarEmoji } from "../domain/avatar";
import { MonthlyLeaderboardEntry } from "../services/statsService";

interface PreviousMonthChampionshipScreenProps {
  leaderboard: MonthlyLeaderboardEntry[];
  currentUserId?: string;
  loading: boolean;
  monthLabel: string;
  onLoginClick?: () => void;
}

export function PreviousMonthChampionshipScreen({
  leaderboard,
  currentUserId,
  loading,
  monthLabel,
  onLoginClick,
}: PreviousMonthChampionshipScreenProps) {
  const { t } = useTranslation();
  const winner = leaderboard[0];
  const currentUserEntry = leaderboard.find(
    (entry) => entry.user_id === currentUserId
  );
  const topEntries = leaderboard.slice(0, 5);

  return (
    <section className="my-3 rounded border-2 border-amber-300 bg-amber-50 p-3 text-amber-950 dark:border-amber-700 dark:bg-slate-800 dark:text-amber-50">
      <div className="mb-3">
        <p className="text-xs font-bold uppercase tracking-wide opacity-75">
          {t("championship.previousMonth.kicker", { month: monthLabel })}
        </p>
        <h2 className="text-xl font-bold">
          {t("championship.previousMonth.title")}
        </h2>
        <p className="text-sm opacity-80">
          {t("championship.previousMonth.subtitle")}
        </p>
      </div>

      {loading ? (
        <div className="rounded bg-white p-4 text-center text-sm dark:bg-slate-900">
          {t("championship.previousMonth.loading")}
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="rounded bg-white p-4 text-center text-sm dark:bg-slate-900">
          {t("championship.previousMonth.noData")}
        </div>
      ) : (
        <>
          {winner && <WinnerCard winner={winner} />}

          {currentUserEntry && (
            <div className="mt-3 rounded bg-white p-3 dark:bg-slate-900">
              <p className="text-sm font-bold opacity-80">
                {t("championship.previousMonth.yourResult")}
              </p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <div>
                  <p className="text-2xl font-bold">#{currentUserEntry.rank}</p>
                  <p className="text-sm opacity-80">
                    {t("championship.previousMonth.yourResultStats", {
                      points: currentUserEntry.total_score,
                      days: currentUserEntry.days_played,
                      wins: currentUserEntry.wins,
                    })}
                  </p>
                </div>
                <div className="rounded bg-amber-100 px-3 py-2 text-right text-sm font-bold text-amber-900 dark:bg-amber-900 dark:text-amber-50">
                  {currentUserEntry.bonus_score > 0
                    ? `+${currentUserEntry.bonus_score} ${t(
                        "championship.bonus"
                      )}`
                    : t("championship.previousMonth.noBonus")}
                </div>
              </div>
            </div>
          )}

          <div className="mt-3 rounded bg-white p-3 dark:bg-slate-900">
            <p className="mb-2 text-sm font-bold opacity-80">
              {t("championship.previousMonth.topResults")}
            </p>
            <div className="space-y-1">
              {topEntries.map((entry) => (
                <ResultRow
                  key={entry.user_id}
                  entry={entry}
                  isCurrentUser={entry.user_id === currentUserId}
                />
              ))}
            </div>
          </div>
        </>
      )}

      <div className="mt-3 rounded bg-white p-3 text-center dark:bg-slate-900">
        <p className="text-sm">
          {currentUserId
            ? currentUserEntry
              ? t("championship.previousMonth.userEncouragement")
              : t("championship.previousMonth.noUserResultEncouragement")
            : t("championship.previousMonth.loginEncouragement")}
        </p>
        {!currentUserId && onLoginClick && (
          <button
            className="mt-3 rounded bg-amber-600 px-4 py-2 text-sm font-bold uppercase text-white hover:bg-amber-500 active:bg-amber-700"
            type="button"
            onClick={onLoginClick}
          >
            {t("championship.previousMonth.loginCta")}
          </button>
        )}
      </div>
    </section>
  );
}

function WinnerCard({ winner }: { winner: MonthlyLeaderboardEntry }) {
  const { t } = useTranslation();

  return (
    <div className="rounded bg-white p-4 text-center shadow-sm dark:bg-slate-900">
      <div className="mx-auto flex h-12 w-12 items-center justify-center text-4xl">
        <Twemoji text="👑" options={{ className: "inline-block" }} />
      </div>
      <div
        className={`mx-auto mt-2 flex h-14 w-14 items-center justify-center rounded-full text-2xl ${getAvatarColorClass(
          winner.avatar_color
        )}`}
      >
        <Twemoji text={normalizeAvatarEmoji(winner.avatar_emoji)} />
      </div>
      <p className="mt-2 text-sm font-bold uppercase opacity-75">
        {t("championship.previousMonth.winner")}
      </p>
      <p className="text-xl font-bold">{winner.username}</p>
      <p className="text-sm opacity-80">
        {winner.total_score} {t("championship.points")} | {winner.days_played}{" "}
        {t("championship.days")} | {winner.wins} {t("championship.wins")}
      </p>
    </div>
  );
}

function ResultRow({
  entry,
  isCurrentUser,
}: {
  entry: MonthlyLeaderboardEntry;
  isCurrentUser: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded px-2 py-2 text-sm ${
        isCurrentUser
          ? "bg-blue-700 font-bold text-white"
          : entry.rank === 1
          ? "bg-amber-100 text-amber-950 dark:bg-amber-900 dark:text-amber-50"
          : "bg-amber-50 dark:bg-slate-800"
      }`}
    >
      <span className="w-10 flex-shrink-0 font-bold">
        {entry.rank === 1 ? (
          <Twemoji text="👑" options={{ className: "inline-block" }} />
        ) : (
          `#${entry.rank}`
        )}
      </span>
      <span
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm ${getAvatarColorClass(
          entry.avatar_color
        )}`}
      >
        <Twemoji text={normalizeAvatarEmoji(entry.avatar_emoji)} />
      </span>
      <span className="min-w-0 flex-1 truncate">{entry.username}</span>
      <span className="ml-1 flex-shrink-0">{entry.total_score} pts</span>
    </div>
  );
}
