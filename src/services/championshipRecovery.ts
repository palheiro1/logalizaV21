import { Guess } from "../domain/guess";
import { MAX_TRY_COUNT } from "../domain/scoring";
import { statsService } from "./statsService";

const MISSED_RESULT_DATES = ["2026-08-31", "2026-09-01", "2026-09-02"];
const RECOVERY_KEY_PREFIX = "championshipRecovery-2026-08-31-councils-v1";

type RecoveryStorage = Pick<Storage, "getItem" | "setItem">;

function readStoredGuesses(
  storage: RecoveryStorage
): Record<string, Guess[]> | null {
  try {
    const stored = storage.getItem("guesses");
    const parsed = stored ? JSON.parse(stored) : {};
    return parsed && typeof parsed === "object"
      ? (parsed as Record<string, Guess[]>)
      : null;
  } catch (error) {
    console.error(
      "Could not read stored guesses for championship recovery:",
      error
    );
    return null;
  }
}

function readStoredBoolean(storage: RecoveryStorage, key: string): boolean {
  return storage.getItem(key) === "true";
}

function isCompletedGame(guesses: Guess[]): boolean {
  return (
    guesses.length > 0 &&
    (guesses.length >= MAX_TRY_COUNT ||
      guesses.some(({ distance }) => distance === 0))
  );
}

export async function recoverMissedChampionshipResults(
  userId: string,
  storage: RecoveryStorage = localStorage
): Promise<number> {
  const recoveryKey = `${RECOVERY_KEY_PREFIX}-${userId}`;
  if (storage.getItem(recoveryKey) === "done") {
    return 0;
  }

  const guessesByDate = readStoredGuesses(storage);
  if (!guessesByDate) {
    return 0;
  }

  let recoveredCount = 0;
  let allEligibleResultsSynced = true;

  for (const gameDate of MISSED_RESULT_DATES) {
    const guesses = Array.isArray(guessesByDate[gameDate])
      ? guessesByDate[gameDate]
      : [];

    if (!isCompletedGame(guesses)) {
      continue;
    }

    try {
      const existingResult = await statsService.getDailyResultFromSupabase(
        userId,
        gameDate
      );
      if (existingResult) {
        continue;
      }

      const syncedResult = await statsService.syncDailyResultToSupabase(
        userId,
        gameDate,
        guesses,
        readStoredBoolean(storage, `guessedShield-${gameDate}`),
        readStoredBoolean(storage, `guessedMap-${gameDate}`),
        readStoredBoolean(storage, `guessedMunicipalities-${gameDate}`)
      );

      if (syncedResult) {
        recoveredCount += 1;
      } else {
        allEligibleResultsSynced = false;
      }
    } catch (error) {
      allEligibleResultsSynced = false;
      console.error(
        `Could not recover championship result for ${gameDate}:`,
        error
      );
    }
  }

  if (allEligibleResultsSynced) {
    storage.setItem(recoveryKey, "done");
  }

  return recoveredCount;
}
