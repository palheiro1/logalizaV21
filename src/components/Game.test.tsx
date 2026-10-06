import React from "react";
import { act, render, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { Game } from "./Game";
import { useAuth } from "../contexts/AuthContext";
import { getDayString } from "../hooks/useTodays";
import { gameStorageKey } from "../domain/gameStorage";
import { loadAllGuesses, saveGuesses } from "../domain/guess";
import { statsService } from "../services/statsService";
import { SettingsData } from "../hooks/useSettings";

vi.mock("../contexts/AuthContext", () => ({ useAuth: vi.fn() }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { resolvedLanguage: "co" } }) }));
vi.mock("canvas-confetti", () => ({ default: vi.fn() }));
vi.mock("./AudioPilotPlayer", () => ({ AudioPilotPlayer: () => null }));
vi.mock("../hooks/useNewsNotifications", () => ({ useNewsNotifications: vi.fn() }));
vi.mock("../services/championshipRecovery", () => ({ recoverMissedChampionshipResults: vi.fn().mockResolvedValue(0) }));
vi.mock("../services/statsService", () => ({ statsService: {
  getDailyResultFromSupabase: vi.fn(), syncDailyResultToSupabase: vi.fn(), syncStatsToSupabase: vi.fn(),
  getMonthlyLeaderboard: vi.fn(), getPreviousMonthlyLeaderboard: vi.fn(),
} }));

const settings: SettingsData = {
  showScale: false, noImageMode: false, rotationMode: false, distanceUnit: "km", theme: "light",
  shiftDayCount: 0, allowShiftingDay: false, updateNotificationDisabled: true,
};
const hit = { name: "Chantada", distance: 0, direction: "N" as const };
function setAccount(id: string | null) {
  vi.mocked(useAuth).mockReturnValue({ user: id ? { id } : null, loading: false, historyReady: Boolean(id) } as any);
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  setAccount("original");
  vi.mocked(statsService.getDailyResultFromSupabase).mockResolvedValue(null);
  vi.mocked(statsService.syncDailyResultToSupabase).mockResolvedValue(null);
  vi.mocked(statsService.getMonthlyLeaderboard).mockResolvedValue([]);
  vi.mocked(statsService.getPreviousMonthlyLeaderboard).mockResolvedValue([]);
});

test("never submits the original account's completed game or bonuses after switching accounts", async () => {
  const day = getDayString();
  saveGuesses(day, [hit], "original");
  localStorage.setItem(gameStorageKey(`guessedShield-${day}`, "original"), "true");
  localStorage.setItem(gameStorageKey(`guessedMap-${day}`, "original"), "true");
  const props = { settingsData: settings, updateSettings: vi.fn() };
  const view = render(<Game {...props} />);
  await waitFor(() => expect(statsService.syncDailyResultToSupabase).toHaveBeenCalledWith("original", day, [hit], true, true, false));
  setAccount("secondary");
  view.rerender(<Game {...props} />);
  await waitFor(() => expect(statsService.getDailyResultFromSupabase).toHaveBeenCalledWith("secondary", day));
  expect(vi.mocked(statsService.syncDailyResultToSupabase).mock.calls.every(([id]) => id === "original")).toBe(true);
  expect(loadAllGuesses("secondary")).toEqual({});
  expect(localStorage.getItem(gameStorageKey(`guessedShield-${day}`, "secondary"))).toBe("false");
});

test("ignores a remote result that arrives after logout and another login", async () => {
  let resolve!: (result: any) => void;
  const pending = new Promise<any>(done => { resolve = done; });
  vi.mocked(statsService.getDailyResultFromSupabase).mockImplementation(id =>
    id === "original" ? pending : Promise.resolve(null)
  );
  const props = { settingsData: settings, updateSettings: vi.fn() };
  const view = render(<Game {...props} />);
  setAccount(null);
  view.rerender(<Game {...props} />);
  setAccount("secondary");
  view.rerender(<Game {...props} />);
  await act(async () => resolve({ user_id: "original", game_date: getDayString(), guesses: [hit], shield_bonus: true }));
  expect(statsService.syncDailyResultToSupabase).not.toHaveBeenCalled();
  expect(loadAllGuesses("secondary")).toEqual({});
  expect(loadAllGuesses()).toEqual({});
});

test("does not overwrite aggregate statistics when account history could not be loaded", async () => {
  const day = getDayString();
  saveGuesses(day, [hit], "original");
  vi.mocked(useAuth).mockReturnValue({ user: { id: "original" }, loading: false, historyReady: false } as any);
  vi.mocked(statsService.syncDailyResultToSupabase).mockResolvedValue({ user_id: "original", guesses: [hit] } as any);
  render(<Game settingsData={settings} updateSettings={vi.fn()} />);
  await waitFor(() => expect(statsService.getMonthlyLeaderboard).toHaveBeenCalled());
  expect(statsService.syncDailyResultToSupabase).toHaveBeenCalledWith("original", day, [hit], false, false, false);
  expect(statsService.syncStatsToSupabase).not.toHaveBeenCalled();
});
