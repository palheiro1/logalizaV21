import React from "react";
import { Twemoji } from "react-emoji-render";
import { useTranslation } from "react-i18next";
import { DailyScore } from "../domain/scoring";
import { MonthlyLeaderboardEntry } from "../services/statsService";
import { getAvatarColorClass, normalizeAvatarEmoji } from "../domain/avatar";

interface MonthlyChampionshipSummaryProps {
  score: DailyScore;
  leaderboard: MonthlyLeaderboardEntry[];
  currentUserId?: string;
  loading: boolean;
  canPlayShieldBonus: boolean;
  canPlayMapBonus: boolean;
  canPlayMunicipalitiesBonus: boolean;
  onPlayShieldBonus: () => void;
  onPlayMapBonus: () => void;
  onPlayMunicipalitiesBonus: () => void;
  onLoginClick?: () => void;
}

export function MonthlyChampionshipSummary({
  score,
  leaderboard,
  currentUserId,
  loading,
  canPlayShieldBonus,
  canPlayMapBonus,
  canPlayMunicipalitiesBonus,
  onPlayShieldBonus,
  onPlayMapBonus,
  onPlayMunicipalitiesBonus,
  onLoginClick,
}: MonthlyChampionshipSummaryProps) {
  const { t } = useTranslation();
  const currentUserEntry = leaderboard.find(
    (entry) => entry.user_id === currentUserId
  );
  const visibleEntries = getVisibleEntries(leaderboard, currentUserEntry);
  const rankDelta = currentUserEntry?.rank_delta ?? 0;
  const hasLeaderboardEntries = visibleEntries.length > 0;

  return (
    <section className="my-3 rounded border-2 border-blue-200 bg-blue-50 p-3 text-blue-950 dark:border-blue-800 dark:bg-slate-800 dark:text-blue-50">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold">{t("championship.title")}</h2>
          <p className="text-sm opacity-80">{t("championship.subtitle")}</p>
        </div>
        <div className="animate-pop rounded bg-blue-700 px-3 py-1 text-xl font-bold text-white">
          +{score.totalScore}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-center">
        <ScoreTile label={t("championship.comarca")} value={score.mainScore} />
        <ScoreTile
          label={t("championship.shield")}
          value={score.shieldBonusScore}
        />
        <ScoreTile label={t("championship.map")} value={score.mapBonusScore} />
        <ScoreTile
          label={t("championship.municipalities")}
          value={score.municipalitiesBonusScore}
        />
      </div>

      {canPlayShieldBonus && (
        <button
          className="mt-3 w-full rounded bg-green-600 px-4 py-2 font-bold uppercase text-white hover:bg-green-500 active:bg-green-700"
          type="button"
          onClick={onPlayShieldBonus}
        >
          {t("championship.playShieldBonus")}
        </button>
      )}

      {canPlayMapBonus && (
        <button
          className="mt-3 w-full rounded bg-green-600 px-4 py-2 font-bold uppercase text-white hover:bg-green-500 active:bg-green-700"
          type="button"
          onClick={onPlayMapBonus}
        >
          {t("championship.playMapBonus")}
        </button>
      )}

      {canPlayMunicipalitiesBonus && (
        <button
          className="mt-3 w-full rounded bg-blue-700 px-4 py-2 font-bold uppercase text-white hover:bg-blue-600 active:bg-blue-800"
          type="button"
          onClick={onPlayMunicipalitiesBonus}
        >
          {t("championship.playMunicipalitiesBonus")}
        </button>
      )}

      {!score.won && (
        <p className="mt-3 text-center text-sm opacity-80">
          {t("championship.noBonusWithoutWin")}
        </p>
      )}

      {!currentUserId && (
        <div className="mt-3 rounded bg-white p-3 text-center dark:bg-slate-900">
          <p className="text-sm">{t("championship.loginPreview")}</p>
          {onLoginClick && (
            <button
              className="mt-2 rounded bg-blue-700 px-4 py-2 text-sm font-bold text-white hover:bg-blue-600"
              type="button"
              onClick={onLoginClick}
            >
              {t("championship.loginCta")}
            </button>
          )}
        </div>
      )}

      {(currentUserId || hasLeaderboardEntries || loading) && (
        <div className="mt-3 rounded bg-white p-3 dark:bg-slate-900">
          {loading ? (
            <p className="text-center text-sm">
              {t("championship.updating")}
            </p>
          ) : currentUserEntry ? (
            <>
              <div className="mb-2 flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm opacity-80">
                    {t("championship.yourPosition")}
                  </p>
                  <p className="text-xl font-bold">
                    #{currentUserEntry.previous_rank} {"->"} #
                    {currentUserEntry.rank}
                  </p>
                </div>
                <RankDeltaBadge delta={rankDelta} />
              </div>
              <LeaderboardSlice
                sections={visibleEntries}
                currentUserId={currentUserId}
              />
            </>
          ) : hasLeaderboardEntries ? (
            <>
              <p className="mb-2 text-sm font-bold opacity-80">
                {t("championship.topThisMonth")}
              </p>
              {currentUserId && (
                <p className="mb-2 text-sm opacity-80">
                  {t("championship.noMonthlyData")}
                </p>
              )}
              <LeaderboardSlice
                sections={visibleEntries}
                currentUserId={currentUserId}
              />
            </>
          ) : (
            <p className="text-center text-sm">
              {t("championship.noMonthlyData")}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function ScoreTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded bg-white p-2 dark:bg-slate-900">
      <div className="text-lg font-bold">+{value}</div>
      <div className="text-xs uppercase opacity-70">{label}</div>
    </div>
  );
}

function RankDeltaBadge({ delta }: { delta: number }) {
  const { t } = useTranslation();

  if (delta > 0) {
    return (
      <div className="rounded bg-green-100 px-2 py-1 text-sm font-bold text-green-800">
        +{delta} {t("championship.positions")}
      </div>
    );
  }

  if (delta < 0) {
    return (
      <div className="rounded bg-red-100 px-2 py-1 text-sm font-bold text-red-800">
        {delta} {t("championship.positions")}
      </div>
    );
  }

  return (
    <div className="rounded bg-gray-100 px-2 py-1 text-sm font-bold text-gray-700">
      {t("championship.samePosition")}
    </div>
  );
}

function LeaderboardSlice({
  sections,
  currentUserId,
}: {
  sections: Array<MonthlyLeaderboardEntry | "separator">;
  currentUserId?: string;
}) {
  return (
    <div className="space-y-1">
      {sections.map((entry, index) => {
        if (entry === "separator") {
          return (
            <div
              key={`separator-${index}`}
              className="py-1 text-center text-xs font-bold opacity-60"
            >
              ...
            </div>
          );
        }
        const isCurrentUser = currentUserId != null && entry.user_id === currentUserId;
        const movementClass =
          isCurrentUser && entry.rank_delta > 0
            ? "animate-rankUp"
            : isCurrentUser && entry.rank_delta < 0
            ? "animate-rankDown"
            : isCurrentUser
            ? "animate-pop"
            : "";
        return (
          <div
            key={entry.user_id}
            className={`flex items-center justify-between rounded px-2 py-1 text-sm ${movementClass} ${
              isCurrentUser
                ? "bg-blue-700 font-bold text-white"
                : "bg-blue-50 dark:bg-slate-800"
            }`}
          >
            <span className="w-10">#{entry.rank}</span>
            <span
              className={`mr-2 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-sm ${getAvatarColorClass(
                entry.avatar_color
              )}`}
            >
              <Twemoji text={normalizeAvatarEmoji(entry.avatar_emoji)} />
            </span>
            <span className="min-w-0 flex-1 truncate">{entry.username}</span>
            <span className="ml-2">{entry.total_score} pts</span>
          </div>
        );
      })}
    </div>
  );
}

function getVisibleEntries(
  leaderboard: MonthlyLeaderboardEntry[],
  currentUserEntry?: MonthlyLeaderboardEntry
): Array<MonthlyLeaderboardEntry | "separator"> {
  const topEntries = leaderboard.slice(0, 5);
  if (!currentUserEntry || currentUserEntry.rank <= 5) {
    return topEntries;
  }

  const currentIndex = leaderboard.findIndex(
    (entry) => entry.user_id === currentUserEntry.user_id
  );
  const aroundEntries = leaderboard.slice(
    Math.max(currentIndex - 2, 0),
    currentIndex + 3
  );
  const seen = new Set(topEntries.map((entry) => entry.user_id));

  const aroundOnly = aroundEntries.filter((entry) => !seen.has(entry.user_id));

  return [
    ...topEntries,
    ...(aroundOnly.length > 0 ? (["separator"] as const) : []),
    ...aroundOnly,
  ];
}
