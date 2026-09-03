import { Guess } from "../domain/guess";
import { recoverMissedChampionshipResults } from "./championshipRecovery";
import { statsService } from "./statsService";

jest.mock("./statsService", () => ({
  statsService: {
    getDailyResultFromSupabase: jest.fn(),
    syncDailyResultToSupabase: jest.fn(),
  },
}));

const hit: Guess = { name: "A Coruña", distance: 0, direction: "N" };
const miss: Guess = { name: "Vigo", distance: 12000, direction: "NE" };

function createStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: jest.fn((key: string) => values.get(key) ?? null),
    setItem: jest.fn((key: string, value: string) => values.set(key, value)),
  };
}

describe("recoverMissedChampionshipResults", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("recovers only completed missing results and preserves stored bonuses", async () => {
    const storage = createStorage({
      guesses: JSON.stringify({
        "2026-09-01": [miss, hit],
        "2026-09-02": [miss],
      }),
      "guessedShield-2026-09-01": "true",
      "guessedMap-2026-09-01": "false",
      "guessedMunicipalities-2026-09-01": "true",
    });
    (statsService.getDailyResultFromSupabase as jest.Mock).mockResolvedValue(
      null
    );
    (statsService.syncDailyResultToSupabase as jest.Mock).mockResolvedValue({
      id: "recovered-result",
    });

    const recovered = await recoverMissedChampionshipResults("user-1", storage);

    expect(recovered).toBe(1);
    expect(statsService.getDailyResultFromSupabase).toHaveBeenCalledTimes(1);
    expect(statsService.syncDailyResultToSupabase).toHaveBeenCalledWith(
      "user-1",
      "2026-09-01",
      [miss, hit],
      true,
      false,
      true
    );
    expect(storage.setItem).toHaveBeenCalledWith(
      "championshipRecovery-2026-08-31-councils-v1-user-1",
      "done"
    );
  });

  it("does not overwrite a result that already exists", async () => {
    const storage = createStorage({
      guesses: JSON.stringify({ "2026-09-01": [hit] }),
    });
    (statsService.getDailyResultFromSupabase as jest.Mock).mockResolvedValue({
      id: "existing-result",
    });

    const recovered = await recoverMissedChampionshipResults("user-1", storage);

    expect(recovered).toBe(0);
    expect(statsService.syncDailyResultToSupabase).not.toHaveBeenCalled();
    expect(storage.setItem).toHaveBeenCalledWith(
      "championshipRecovery-2026-08-31-councils-v1-user-1",
      "done"
    );
  });

  it("leaves recovery pending when Supabase cannot save a missing result", async () => {
    const storage = createStorage({
      guesses: JSON.stringify({ "2026-09-01": [hit] }),
    });
    (statsService.getDailyResultFromSupabase as jest.Mock).mockResolvedValue(
      null
    );
    (statsService.syncDailyResultToSupabase as jest.Mock).mockResolvedValue(
      null
    );

    const recovered = await recoverMissedChampionshipResults("user-1", storage);

    expect(recovered).toBe(0);
    expect(storage.setItem).not.toHaveBeenCalled();
  });
});
