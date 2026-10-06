import { DateTime } from "luxon";
import { Guess, loadAllGuesses } from "./guess";
import { gameStorageKey } from "./gameStorage";

export interface StatsData {
  currentStreak: number;
  maxStreak: number;
  played: number;
  winRatio: number;
  guessDistribution: Record<1 | 2 | 3 | 4, number>;
  averageBestDistance: number;
}

export interface StatsBaseline {
  stats: StatsData;
  guesses: Record<string, Guess[]>;
  updatedAt: string;
}

export function loadStatsBaseline(userId: string): StatsBaseline | null {
  const stored = localStorage.getItem(gameStorageKey("statsBaseline", userId));
  return stored ? JSON.parse(stored) : null;
}

export function saveStatsBaseline(userId: string, baseline: StatsBaseline): void {
  localStorage.setItem(gameStorageKey("statsBaseline", userId), JSON.stringify(baseline));
}

export function getStatsData(userId?: string): StatsData {
  const allGuesses = loadAllGuesses(userId);
  const local = calculateStatsData(allGuesses);
  const baseline = userId ? loadStatsBaseline(userId) : null;
  if (!baseline) return local;

  // The server may retain statistics from before daily_results existed.
  // Add only the changes since this account's snapshot, preserving that history.
  const previous = calculateStatsData(baseline.guesses);
  const played = baseline.stats.played + local.played - previous.played;
  const guessDistribution = { ...baseline.stats.guessDistribution };
  for (const key of [1, 2, 3, 4] as const) {
    guessDistribution[key] += local.guessDistribution[key] - previous.guessDistribution[key];
  }
  const lastDay = Object.keys(baseline.guesses).sort().pop();
  let previousDay = lastDay;
  let currentStreak = baseline.stats.currentStreak;
  let maxStreak = Math.max(baseline.stats.maxStreak, local.maxStreak);
  for (const [day, guesses] of Object.entries(allGuesses).sort(([a], [b]) => a.localeCompare(b))) {
    if (lastDay && day <= lastDay) continue;
    const won = guesses.some(({ distance }) => distance === 0);
    const consecutive = previousDay && DateTime.fromISO(previousDay).plus({ days: 1 }).toISODate() === day;
    currentStreak = won ? (consecutive ? currentStreak + 1 : 1) : 0;
    maxStreak = Math.max(maxStreak, currentStreak);
    previousDay = day;
  }
  const wins = Object.values(guessDistribution).reduce((sum, count) => sum + count, 0);
  return {
    played,
    guessDistribution,
    currentStreak,
    maxStreak,
    winRatio: wins / (played || 1),
    averageBestDistance: (
      baseline.stats.averageBestDistance * baseline.stats.played +
      local.averageBestDistance * local.played - previous.averageBestDistance * previous.played
    ) / (played || 1),
  };
}

export function calculateStatsData(allGuesses: Record<string, Guess[]>): StatsData {

  const allGuessesEntries = Object.entries(allGuesses);
  const sortedGuessesEntries = allGuessesEntries.sort(([a], [b]) => a.localeCompare(b))
  const played = sortedGuessesEntries.length;

  const guessDistribution = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  };

  let currentStreak = 0;
  let maxStreak = 0;
  let previousDate: DateTime | undefined;
  let bestDistanceSum = 0;
  for (const [dayString, guesses] of sortedGuessesEntries) {
    const minDistance = guesses.length > 0 ? Math.min(...guesses.map((guess) => guess.distance)) : 0;
    bestDistanceSum += minDistance;
    const currentDate = DateTime.fromFormat(dayString, "yyyy-MM-dd");
    const winIndex = guesses.findIndex((guess) => guess.distance === 0);
    const won = winIndex >= 0;
    if (won) {
      const tryCount = (winIndex + 1) as 1 | 2 | 3 | 4;
      guessDistribution[tryCount]++;

      if (
        previousDate == null ||
        previousDate.plus({ days: 1 }).hasSame(currentDate, "day")
      ) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
    } else {
      currentStreak = 0;
    }

    if (currentStreak > maxStreak) {
      maxStreak = currentStreak;
    }
    previousDate = currentDate;
  }

  const winCount = Object.values(guessDistribution).reduce(
    (total, tries) => total + tries
  );

  return {
    currentStreak: currentStreak,
    maxStreak: maxStreak,
    played,
    winRatio: winCount / (played || 1),
    guessDistribution: guessDistribution,
    averageBestDistance: bestDistanceSum / (played || 1),
  };
}
