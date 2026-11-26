import React from "react";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { expect, vi } from "vitest";
import { Game } from "./Game";
import { useAuth } from "../contexts/AuthContext";
import { getDayString, getGlobalContentForDay } from "../hooks/useTodays";
import { getCountryName, sanitizeCountryName } from "../domain/countries";
import listagemLigazons from "../domain/listagemLigazons";
import { GAME_LANGUAGE } from "../i18n";
import { gameStorageKey } from "../domain/gameStorage";
import { loadAllGuesses, saveGuesses } from "../domain/guess";
import { statsService } from "../services/statsService";
import { SettingsData } from "../hooks/useSettings";

vi.mock("../contexts/AuthContext", () => ({ useAuth: vi.fn() }));
vi.mock("canvas-confetti", () => ({ default: vi.fn() }));
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
  vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {});
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  localStorage.clear();
  setAccount("original");
  vi.mocked(statsService.getDailyResultFromSupabase).mockResolvedValue(null);
  vi.mocked(statsService.syncDailyResultToSupabase).mockResolvedValue(null);
  vi.mocked(statsService.getMonthlyLeaderboard).mockResolvedValue([]);
  vi.mocked(statsService.getPreviousMonthlyLeaderboard).mockResolvedValue([]);
});

afterEach(() => vi.restoreAllMocks());

function renderDailyGame() {
  const root = document.getElementById("root") ??
    document.body.appendChild(document.createElement("div"));
  root.id = "root";
  return render(<Game settingsData={settings} updateSettings={vi.fn()} />, { container: root });
}

function submitGuess(name: string) {
  fireEvent.change(screen.getByPlaceholderText("Comarca..."), {
    target: { value: name },
  });
  fireEvent.click(screen.getByRole("button", { name: /Adivinhar/ }));
}

test("shows the photo and map on a win, keeps both beside the result and opens the guide again for the next game", async () => {
  const clock = vi.spyOn(Date, "now").mockReturnValue(Date.parse("2026-10-25T12:00:00Z"));
  setAccount(null);
  const today = getGlobalContentForDay(getDayString());
  const comarca = getCountryName(GAME_LANGUAGE, today.country);
  const photoUrl = listagemLigazons[sanitizeCountryName(comarca)][today.imageNumber];
  const view = renderDailyGame();
  const dailyPhoto = screen.getByRole("img", { name: "country to guess" }).getAttribute("src");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.queryByRole("navigation")).not.toBeInTheDocument();

  submitGuess(comarca);
  const dialog = within(await screen.findByRole("dialog", {
    name: `A comarca de hoje é ${comarca}`,
  }));
  expect(dialog.getByRole("link", { name: /Saber mais sobre a imagem/ }))
    .toHaveAttribute("href", photoUrl);
  expect(dialog.getAllByAltText("").map(image => image.getAttribute("src"))).toContain(dailyPhoto);
  const mapLink = dialog.getByRole("link", { name: /Ver o mapa das comarcas/ });
  expect(mapLink).toHaveAttribute("href", "/maps/mapa-das-comarcas.html");
  expect(within(mapLink).getByAltText("")).toHaveAttribute("src", expect.stringContaining(".webp"));
  fireEvent.click(dialog.getByRole("button", { name: "Fechar" }));

  const links = screen.getByRole("navigation", { name: "Explorar a comarca de hoje" });
  expect(within(links).getByRole("link", { name: "Saber mais sobre a imagem" }))
    .toHaveFocus();
  expect(within(links).getByRole("link", { name: "Ver o mapa das comarcas" }))
    .toHaveAttribute("href", "/maps/mapa-das-comarcas.html");
  const championship = screen.getByRole("heading", { name: "Campeonato mensal" });
  expect(links.compareDocumentPosition(championship) & Node.DOCUMENT_POSITION_FOLLOWING)
    .toBeTruthy();

  view.unmount();
  const revisit = renderDailyGame();
  expect(await screen.findByRole("navigation")).toBeVisible();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  revisit.unmount();

  clock.mockReturnValue(Date.parse("2026-10-26T12:00:00Z"));
  renderDailyGame();
  submitGuess(getCountryName(GAME_LANGUAGE, getGlobalContentForDay(getDayString()).country));
  expect(await screen.findByRole("dialog")).toBeVisible();
});

test("opens on the fourth miss with the recording source and remembers the browser opt-out on a later game", async () => {
  const clock = vi.spyOn(Date, "now").mockReturnValue(Date.parse("2026-10-24T12:00:00Z"));
  setAccount(null);
  const view = renderDailyGame();
  for (const name of ["Chantada", "Vigo", "Lugo"]) {
    submitGuess(name);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  }
  submitGuess("Ourense");

  const dialog = within(await screen.findByRole("dialog", {
    name: "A comarca de hoje é Ponte Vedra",
  }));
  const recordingUrl = "https://apoi.museodopobo.gal/2953/";
  expect(dialog.getByRole("link", { name: /Saber mais sobre a gravação/ }))
    .toHaveAttribute("href", recordingUrl);
  fireEvent.click(dialog.getByRole("button", { name: "Não voltar a mostrar" }));
  expect(screen.getByRole("link", { name: "Saber mais sobre a gravação" }))
    .toHaveAttribute("href", recordingUrl);
  view.unmount();

  clock.mockReturnValue(Date.parse("2026-10-25T12:00:00Z"));
  setAccount("original");
  renderDailyGame();
  submitGuess(getCountryName(GAME_LANGUAGE, getGlobalContentForDay(getDayString()).country));
  expect(await screen.findByRole("link", { name: "Saber mais sobre a imagem" })).toBeVisible();
  expect(screen.getByRole("link", { name: "Ver o mapa das comarcas" })).toBeVisible();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

test("keeps today's audio challenge playable with the same comarca's image when its audio source is unavailable", async () => {
  vi.spyOn(Date, "now").mockReturnValue(new Date("2026-10-24T10:00:00+02:00").getTime());
  setAccount(null);
  const { container } = render(<Game settingsData={{ ...settings, noImageMode: true, rotationMode: true }} updateSettings={vi.fn()} />);
  await waitFor(() => expect(container.querySelector("audio")).toHaveAttribute("src", "https://apoi.museodopobo.gal/2953/1/MPG_NoCa_0044_001_id2953.mp3"));
  expect(screen.queryByRole("img", { name: "Pista visual alternativa da comarca" })).not.toBeInTheDocument();

  fireEvent.error(container.querySelector("audio")!);
  const clue = screen.getByRole("img", { name: "Pista visual alternativa da comarca" });
  expect(clue).toBeVisible();
  expect(clue.getAttribute("src")).toMatch(/\/pon\/[^/]+2\.jpg$/);
  expect(clue.style.transform).toBe("");
  expect(loadAllGuesses()).toEqual({});
  expect(statsService.syncDailyResultToSupabase).not.toHaveBeenCalled();

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
