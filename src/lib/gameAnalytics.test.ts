import { beforeEach, expect, test, vi } from "vitest";
import { track } from "@vercel/analytics";
import { classifyEntry, recordGameGuess, rememberEntry, saveConsent } from "./gameAnalytics";
import { MAX_TRY_COUNT } from "../domain/scoring";

vi.mock("@vercel/analytics", () => ({ track: vi.fn() }));
const base = "https://logaliza.vercel.app/";
const ig = "?utm_source=instagram&utm_medium=paid_social&utm_campaign=proba_2e";
const day = "2026-11-21";

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
  history.replaceState({}, "", "/");
});

test("recognizes ad links and app referrals without sending click IDs or arbitrary URL values", () => {
  expect(classifyEntry(new URL(ig, base), "")).toEqual({ source: "instagram", medium: "paid_social", campaign: "proba_2e" });
  expect(classifyEntry(new URL("?twclid=test-private", base), "")).toEqual({ source: "x", medium: "paid_social", campaign: "unmarked" });
  expect(classifyEntry(new URL("?fbclid=test-private", base), "https://m.facebook.com/a")).toEqual({ source: "facebook", medium: "social", campaign: "unmarked" });
  expect(classifyEntry(new URL(base), "android-app://com.twitter.android")).toMatchObject({ source: "x", medium: "social" });
  expect(classifyEntry(new URL("?utm_source=someone@example.org&utm_campaign=secret", base), "")).toEqual({ source: "other", medium: "referral", campaign: "other" });
  expect(classifyEntry(new URL(base), "")).toMatchObject({ source: "direct_or_unknown" });
});

test("keeps the first guess's source over a reload or change of campaign and counts a second-guess win exactly once", async () => {
  history.replaceState({}, "", ig);
  saveConsent("granted");
  rememberEntry();
  await recordGameGuess("daily", day, 1, false);
  await recordGameGuess("daily", day, 1, false);
  history.replaceState({}, "", "?utm_source=facebook&utm_medium=social");
  rememberEntry();
  await recordGameGuess("daily", day, 2, true);
  await recordGameGuess("daily", day, 2, true);
  const entry = { mode: "daily", source: "instagram", medium: "paid_social", campaign: "proba_2e" };
  expect(vi.mocked(track).mock.calls).toEqual([
    ["game_start", entry], ["game_complete", { ...entry, attempts: 2, result: "won" }],
  ]);
});

test("does not backfill ongoing games, send after withdrawal, or measure before opt-in", async () => {
  await recordGameGuess("daily", day, 1, false);
  saveConsent("granted");
  await recordGameGuess("daily", day, 2, true);
  expect(track).not.toHaveBeenCalled();
  await recordGameGuess("daily", "new", 1, false);
  saveConsent("denied");
  await recordGameGuess("daily", "new", 2, true);
  saveConsent("granted");
  await recordGameGuess("daily", "new", 2, true);
  expect(track).toHaveBeenCalledTimes(1);
});

test("counts first-guess wins, exhausted attempts and pilot puzzles separately", async () => {
  saveConsent("granted");
  await recordGameGuess("daily", day, 1, true);
  for (let n = 1; n <= MAX_TRY_COUNT; n++) await recordGameGuess("audio_pilot", day, n, false);
  const completions = vi.mocked(track).mock.calls.filter(([name]) => name === "game_complete");
  expect(completions.map(([, properties]) => properties)).toEqual([
    expect.objectContaining({ mode: "daily", attempts: 1, result: "won" }),
    expect.objectContaining({ mode: "audio_pilot", attempts: MAX_TRY_COUNT, result: "lost" }),
  ]);
});

test("honours a browser privacy signal even with a previously saved opt-in", async () => {
  saveConsent("granted");
  Object.defineProperty(navigator, "globalPrivacyControl", { configurable: true, value: true });
  try {
    await recordGameGuess("daily", day, 1, true);
    expect(track).not.toHaveBeenCalled();
  } finally {
    Reflect.deleteProperty(navigator, "globalPrivacyControl");
  }
});
