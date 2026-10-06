import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { AuthProvider, useAuth } from "./AuthContext";
import { supabase } from "../lib/supabase";
import { statsService } from "../services/statsService";
import { loadAllGuesses } from "../domain/guess";
import { calculateStatsData, getStatsData, saveStatsBaseline } from "../domain/stats";

vi.mock("../lib/supabase", () => ({
  supabase: { auth: { getSession: vi.fn(), onAuthStateChange: vi.fn(), signOut: vi.fn() } },
}));
vi.mock("../services/statsService", async importOriginal => {
  const actual = await importOriginal<typeof import("../services/statsService")>();
  return { ...actual, statsService: {
    getUserProfile: vi.fn(), loadAccountHistory: vi.fn(), createUserProfile: vi.fn(), syncStatsToSupabase: vi.fn(),
  } };
});

const hit = { name: "Chantada", distance: 0, direction: "N" as const };
function session(id: string) {
  return { user: { id, email: `${id}@example.com` }, access_token: `${id}-token` };
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => { resolve = done; });
  return { promise, resolve };
}
function AccountView() {
  const { user, profile, loading } = useAuth();
  return <div>{loading ? "loading" : `${user?.id ?? "guest"}:${profile?.username ?? "none"}`}</div>;
}
let notifyAuth: (event: string, next: ReturnType<typeof session> | null) => void;

beforeEach(() => {
  vi.resetAllMocks();
  localStorage.clear();
  vi.mocked(supabase.auth.onAuthStateChange).mockImplementation(callback => {
    notifyAuth = callback as typeof notifyAuth;
    return { data: { subscription: { unsubscribe: vi.fn() } } } as any;
  });
  vi.mocked(supabase.auth.getSession).mockResolvedValue({ data: { session: session("original") }, error: null } as any);
  vi.mocked(statsService.getUserProfile).mockImplementation(async id => ({ id, username: id } as any));
  vi.mocked(statsService.loadAccountHistory).mockResolvedValue({ guesses: {}, stats: null });
});

test("loads only the signed-in account history without uploading shared browser statistics", async () => {
  localStorage.setItem("guesses", JSON.stringify({ "2026-09-01": [hit] }));
  vi.mocked(statsService.loadAccountHistory).mockResolvedValue({
    guesses: { "2026-10-06": [hit] },
    stats: {
      played: 123, current_streak: 35, max_streak: 47, win_ratio: 1, average_best_distance: 0,
      guess_distribution: { "1": 123 }, updated_at: "2026-10-06T08:00:00Z",
    } as any,
  });
  render(<AuthProvider><AccountView /></AuthProvider>);
  await screen.findByText("original:original");
  expect(loadAllGuesses("original")).toEqual({ "2026-10-06": [hit] });
  expect(getStatsData("original").played).toBe(123);
  expect(statsService.syncStatsToSupabase).not.toHaveBeenCalled();
  act(() => notifyAuth("SIGNED_IN", session("secondary")));
  await screen.findByText("secondary:secondary");
  expect(statsService.loadAccountHistory).toHaveBeenCalledWith("secondary");
  expect(loadAllGuesses("secondary")["2026-09-01"]).toBeUndefined();
  expect(statsService.syncStatsToSupabase).not.toHaveBeenCalled();
});

test("ignores a delayed account load after switching to another user", async () => {
  const oldProfile = deferred<any>();
  vi.mocked(statsService.getUserProfile).mockImplementation(id =>
    id === "original" ? oldProfile.promise : Promise.resolve({ id, username: id } as any)
  );
  render(<AuthProvider><AccountView /></AuthProvider>);
  await waitFor(() => expect(statsService.getUserProfile).toHaveBeenCalledWith("original"));
  act(() => notifyAuth("SIGNED_IN", session("secondary")));
  await screen.findByText("secondary:secondary");
  await act(async () => oldProfile.resolve({ id: "original", username: "original" }));
  expect(screen.getByText("secondary:secondary")).toBeTruthy();
  expect(loadAllGuesses("original")).toEqual({});
});

test("ignores a delayed initial session and repeated sign-in events for the same account", async () => {
  const initial = deferred<any>();
  vi.mocked(supabase.auth.getSession).mockReturnValue(initial.promise);
  render(<AuthProvider><AccountView /></AuthProvider>);
  act(() => notifyAuth("SIGNED_IN", session("secondary")));
  await screen.findByText("secondary:secondary");
  await act(async () => initial.resolve({ data: { session: session("original") }, error: null }));
  act(() => notifyAuth("SIGNED_IN", session("secondary")));
  expect(screen.getByText("secondary:secondary")).toBeTruthy();
  expect(statsService.loadAccountHistory).toHaveBeenCalledTimes(1);
});

test("keeps a saved daily result pending when the aggregate write was interrupted", async () => {
  const before = { "2026-10-05": [hit] };
  const stats = calculateStatsData(before);
  saveStatsBaseline("original", { stats, guesses: before, updatedAt: "2026-10-05T08:00:00Z" });
  vi.mocked(statsService.loadAccountHistory).mockResolvedValue({
    guesses: { ...before, "2026-10-06": [hit] },
    stats: { played: 1, current_streak: 1, max_streak: 1, win_ratio: 1, average_best_distance: 0,
      guess_distribution: { "1": 1 }, updated_at: "2026-10-05T08:00:00Z" } as any,
  });
  render(<AuthProvider><AccountView /></AuthProvider>);
  await screen.findByText("original:original");
  expect(getStatsData("original")).toMatchObject({ played: 2, currentStreak: 2 });
});
