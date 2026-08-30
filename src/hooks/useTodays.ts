import { DateTime } from "luxon";
import { useCallback, useEffect, useMemo, useState } from "react";
import seedrandom from "seedrandom";
import { Country } from "../domain/countries";
import { Guess, loadAllGuesses, saveGuesses } from "../domain/guess";
import { countriesWithImage } from "./../environment";
import { useAuth } from "../contexts/AuthContext";
import { DailyResult, statsService } from "../services/statsService";
import { getStatsData } from "../domain/stats";
import { MAX_TRY_COUNT } from "../domain/scoring";
import {
  AudioSample,
  audioSamples,
  getAudioSampleById,
} from "../domain/audioSamples";

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
  number,
  DailyResult | null,
  AudioSample | undefined
] {
  const { user } = useSafeAuth();
  const userId = user?.id;
  const [todays, setTodays] = useState<{
    country?: Country;
    guesses: Guess[];
  }>({ guesses: [] });
  const [remoteDailyResult, setRemoteDailyResult] =
    useState<DailyResult | null>(null);

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
      if (userId) {
        const isGameCompleted =
          newGuess.distance === 0 || newGuesses.length >= MAX_TRY_COUNT;
        if (isGameCompleted) {
          try {
            const currentStats = getStatsData();
            await statsService.syncStatsToSupabase(userId, currentStats);
          } catch (error) {
            console.error("useTodays: Error syncing stats to Supabase:", error);
          }
        }
      }
    },
    [dayString, todays, userId]
  );

  useEffect(() => {
    let cancelled = false;
    const guesses = loadAllGuesses()[dayString] ?? [];
    const selection = getGlobalContentForDay(dayString);
    const country = selection.country;
    setTodays({ country, guesses });
    setRemoteDailyResult(null);

    async function hydrateFromSupabase() {
      if (!userId) {
        return;
      }

      const dailyResult = await statsService.getDailyResultFromSupabase(
        userId,
        dayString
      );
      if (cancelled || !dailyResult) {
        return;
      }

      setRemoteDailyResult(dailyResult);
      setTodays({ country, guesses: dailyResult.guesses });
      saveGuesses(dayString, dailyResult.guesses);
    }

    hydrateFromSupabase();

    return () => {
      cancelled = true;
    };
  }, [dayString, userId]);

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
    const sel = getGlobalContentForDay(dayString);
    return sel.imageNumber;
  }, [dayString]);

  const audioSample = useMemo(
    () => getGlobalContentForDay(dayString).audioSample,
    [dayString]
  );

  return [
    todays,
    addGuess,
    randomImageNumber,
    randomAngle,
    imageScale,
    remoteDailyResult,
    audioSample,
  ];
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

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

type ImagePoolEntry = {
  kind: "image";
  code: string;
  imageNumber: number;
};

type AudioPoolEntry = {
  kind: "audio";
  code: string;
  audioSampleId: string;
};

type PoolEntry = ImagePoolEntry | AudioPoolEntry;

function buildImagePool(): ImagePoolEntry[] {
  const entries: ImagePoolEntry[] = [];
  for (const c of countriesWithImage as unknown as Array<{ code: string }>) {
    for (const img of AVAILABLE_IMAGE_NUMBERS) {
      entries.push({ kind: "image", code: c.code, imageNumber: img });
    }
  }
  return entries;
}

function buildMultimediaPool(): PoolEntry[] {
  return [
    ...buildImagePool(),
    ...audioSamples.map(
      ({ id, comarcaCode }): AudioPoolEntry => ({
        kind: "audio",
        code: comarcaCode,
        audioSampleId: id,
      })
    ),
  ];
}

type DailyContentSelection = {
  country: Country;
  imageNumber: number;
  audioSample?: AudioSample;
};

function selectFromPool(
  pool: PoolEntry[],
  dayOffset: number,
  seedPrefix: string,
  pinFirstAudio: boolean
): DailyContentSelection {
  const poolSize = pool.length;
  const cycle = Math.floor(dayOffset / poolSize);
  const idxInCycle = mod(dayOffset, poolSize);
  let order = shuffleArray(
    Array.from({ length: poolSize }, (_, index) => index),
    `${seedPrefix}-cycle-${cycle}`
  );

  if (pinFirstAudio) {
    const firstAudioOrderIndex = order.findIndex(
      (poolIndex) => pool[poolIndex].kind === "audio"
    );
    const [firstAudioPoolIndex] = order.splice(firstAudioOrderIndex, 1);
    order = [firstAudioPoolIndex, ...order];
  }

  const entry = pool[order[idxInCycle]];
  const country = (countriesWithImage as unknown as Country[]).find(
    ({ code }) => code === entry.code
  ) as Country;

  if (entry.kind === "audio") {
    return {
      country,
      imageNumber: AVAILABLE_IMAGE_NUMBERS[0],
      audioSample: getAudioSampleById(entry.audioSampleId),
    };
  }

  return { country, imageNumber: entry.imageNumber };
}

const MULTIMEDIA_POOL_START = "2026-08-31";
const MULTIMEDIA_POOL_SEED = "logaliza-v21-multimedia";

export function getGlobalContentForDay(
  dayString: string
): DailyContentSelection {
  if (dayString < MULTIMEDIA_POOL_START) {
    const pool = buildImagePool();
    const days = diffDays(GLOBAL_POOL_START, dayString);
    return selectFromPool(pool, days, GLOBAL_POOL_SEED, false);
  }

  const pool = buildMultimediaPool();
  const days = diffDays(MULTIMEDIA_POOL_START, dayString);
  return selectFromPool(pool, days, MULTIMEDIA_POOL_SEED, true);
}

// Exported utility: simulate next pictures for upcoming days without mutating storage
export function simulateNextPictures(
  startDayString: string,
  count: number
): Array<{
  dayString: string;
  country: Country;
  imageNumber: number;
  audioSampleId?: string;
}> {
  const results: Array<{
    dayString: string;
    country: Country;
    imageNumber: number;
    audioSampleId?: string;
  }> = [];
  const start = DateTime.fromFormat(startDayString, "yyyy-MM-dd");
  for (let offset = 0; offset < count; offset++) {
    const d = start.plus({ days: offset });
    const ds = d.toFormat("yyyy-MM-dd");
    const sel = getGlobalContentForDay(ds);
    results.push({
      dayString: ds,
      country: sel.country,
      imageNumber: sel.imageNumber,
      audioSampleId: sel.audioSample?.id,
    });
  }
  return results;
}

// Removed old getCountry and repeat-avoidance logic; now selection is from global pool
