import { DateTime } from "luxon";
import { useCallback, useEffect, useMemo, useState } from "react";
import seedrandom from "seedrandom";
import { Country } from "../domain/countries";
import { Guess, loadAllGuesses, saveGuesses } from "../domain/guess";
import { countriesWithImage } from './../environment';
import { useAuth } from "../contexts/AuthContext";
import { statsService } from "../services/statsService";
import { getStatsData } from "../domain/stats";
import { MAX_TRY_COUNT } from "../domain/scoring";

// Safe hook that handles auth context not being available
function useSafeAuth() {
  try {
    return useAuth();
  } catch (error) {
    // Return null user if AuthProvider is not available
    return { user: null };
  }
}

// noRepeatStartDate is obsolete with global pool selection

export function getDayString(shiftDayCount?: number) {
  return DateTime.now()
    .setZone("Europe/Madrid")
    .plus({ days: shiftDayCount ?? 0 })
    .toFormat("yyyy-MM-dd");
}

export function useTodays(dayString: string): [
  {
    country?: Country;
    guesses: Guess[];
  },
  (guess: Guess) => void,
  number,
  number,
  number
] {
  const { user } = useSafeAuth();
  const [todays, setTodays] = useState<{
    country?: Country;
    guesses: Guess[];
  }>({ guesses: [] });

  const addGuess = useCallback(
    async (newGuess: Guess) => {
      if (todays == null) {
        return;
      }

      const newGuesses = [...todays.guesses, newGuess];

      setTodays((prev) => ({ country: prev.country, guesses: newGuesses }));
      saveGuesses(dayString, newGuesses);

      // Sync stats to Supabase when game is completed (won or max tries reached)
      // Only if user is logged in
      if (user) {
        const isGameCompleted = newGuess.distance === 0 || newGuesses.length >= MAX_TRY_COUNT;
        if (isGameCompleted) {
          try {
            const currentStats = getStatsData();
            await statsService.syncStatsToSupabase(user.id, currentStats);
          } catch (error) {
            console.error('useTodays: Error syncing stats to Supabase:', error);
          }
        }
      }
    },
    [dayString, todays, user]
  );

  useEffect(() => {
    const guesses = loadAllGuesses()[dayString] ?? [];
    const selection = getGlobalPictureForDay(dayString);
    const country = selection.country;
    setTodays({ country, guesses });
  }, [dayString]);

  const randomAngle = useMemo(
    () => seedrandom.alea(dayString)() * 360,
    [dayString]
  );

  const imageScale = useMemo(() => {
    const normalizedAngle = 45 - (randomAngle % 90);
    const radianAngle = (normalizedAngle * Math.PI) / 180;
    return 1 / (Math.cos(radianAngle) * Math.sqrt(2));
  }, [randomAngle]);

  // Determine image number from global non-repeating pool
  const randomImageNumber = useMemo(() => {
    const sel = getGlobalPictureForDay(dayString);
    return sel.imageNumber;
  }, [dayString]);

  return [todays, addGuess, randomImageNumber, randomAngle, imageScale];
}

// Removed old seeded random image selector (now using global pool)

// Image numbers available for primary game
const AVAILABLE_IMAGE_NUMBERS = [2, 3, 4, 5, 6];

function shuffleArray<T>(arr: T[], seed: string): T[] {
  const a = [...arr];
  const rng = seedrandom.alea(seed);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
// Deterministic global pool configuration
const GLOBAL_POOL_START = "2022-03-21"; // fixed epoch to align all clients
const GLOBAL_POOL_SEED = "logaliza-v21-global";

function diffDays(a: string, b: string): number {
  const da = DateTime.fromFormat(a, "yyyy-MM-dd");
  const db = DateTime.fromFormat(b, "yyyy-MM-dd");
  return Math.trunc(db.diff(da, "days").days);
}

function mod(n: number, m: number) { return ((n % m) + m) % m; }

type PoolEntry = { code: string; imageNumber: number };

function buildGlobalPool(): PoolEntry[] {
  const entries: PoolEntry[] = [];
  for (const c of countriesWithImage as unknown as Array<{ code: string }>) {
    for (const img of AVAILABLE_IMAGE_NUMBERS) {
      entries.push({ code: c.code, imageNumber: img });
    }
  }
  return entries;
}

function getCycleOrder(poolSize: number, cycle: number): number[] {
  const base = Array.from({ length: poolSize }, (_, i) => i);
  const seed = `${GLOBAL_POOL_SEED}-cycle-${cycle}`;
  return shuffleArray(base, seed);
}

function getGlobalPictureForDay(dayString: string): { country: Country; imageNumber: number } {
  const pool = buildGlobalPool();
  const days = diffDays(GLOBAL_POOL_START, dayString);
  const poolSize = pool.length;
  const cycle = Math.floor(days / poolSize);
  const idxInCycle = mod(days, poolSize);
  const order = getCycleOrder(poolSize, cycle);
  const entry = pool[order[idxInCycle]];
  const country = (countriesWithImage as unknown as Country[]).find(c => c.code === entry.code) as Country;
  return { country, imageNumber: entry.imageNumber };
}

// Exported utility: simulate next pictures for upcoming days without mutating storage
export function simulateNextPictures(startDayString: string, count: number): Array<{
  dayString: string;
  country: Country;
  imageNumber: number;
}> {
  const results: Array<{ dayString: string; country: Country; imageNumber: number }> = [];
  const start = DateTime.fromFormat(startDayString, "yyyy-MM-dd");
  for (let offset = 0; offset < count; offset++) {
    const d = start.plus({ days: offset });
    const ds = d.toFormat("yyyy-MM-dd");
    const sel = getGlobalPictureForDay(ds);
    results.push({ dayString: ds, country: sel.country, imageNumber: sel.imageNumber });
  }
  return results;
}

// Removed old getCountry and repeat-avoidance logic; now selection is from global pool
