import { calculateStatsData, getStatsData, saveStatsBaseline, StatsData } from "./stats";
import { saveGuesses } from "./guess";

const hit = { name: "Chantada", distance: 0, direction: "N" as const };
const miss = { ...hit, distance: 1000 };
const historicalStats: StatsData = {
  played: 123, currentStreak: 35, maxStreak: 47, winRatio: 118 / 123,
  guessDistribution: { 1: 64, 2: 25, 3: 19, 4: 10 }, averageBestDistance: 10,
};

beforeEach(() => {
  localStorage.clear();
  saveGuesses("2026-10-06", [miss, miss, hit], "original");
  saveStatsBaseline("original", {
    stats: historicalStats, guesses: { "2026-10-06": [miss, miss, hit] }, updatedAt: "2026-10-06",
  });
});

test("preserves statistics from before the available daily history", () => {
  expect(getStatsData("original")).toEqual(historicalStats);
  expect(getStatsData("secondary")).toEqual(calculateStatsData({}));
});

test("counts a new game once and extends the stored streak", () => {
  saveGuesses("2026-10-07", [hit], "original");
  const next = getStatsData("original");
  expect(next).toMatchObject({ played: 124, currentStreak: 36, maxStreak: 47 });
  expect(next.guessDistribution).toEqual({ 1: 65, 2: 25, 3: 19, 4: 10 });
  expect(next.averageBestDistance).toBeCloseTo(1230 / 124);
  saveStatsBaseline("original", {
    stats: next, guesses: { "2026-10-06": [miss, miss, hit], "2026-10-07": [hit] }, updatedAt: "2026-10-07",
  });
  expect(getStatsData("original")).toEqual(next);
});

test("resets the current streak after a loss or a missed day", () => {
  saveGuesses("2026-10-07", [miss, miss, miss, miss], "original");
  expect(getStatsData("original")).toMatchObject({ played: 124, currentStreak: 0, maxStreak: 47 });
  saveGuesses("2026-10-09", [hit], "original");
  expect(getStatsData("original")).toMatchObject({ played: 125, currentStreak: 1, maxStreak: 47 });
});
