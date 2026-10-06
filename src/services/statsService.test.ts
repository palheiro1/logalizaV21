import { supabase } from "../lib/supabase";
import { statsService } from "./statsService";
import { Guess, saveGuesses } from "../domain/guess";
import { calculateStatsData, getStatsData, loadStatsBaseline, saveStatsBaseline } from "../domain/stats";
import { vi } from "vitest";

vi.mock("../lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
    auth: { getSession: vi.fn() },
  },
}));

const jest = vi;

function authorizedBuilder<T extends object>(builder: T) {
  return Object.assign(builder, { setHeader: vi.fn().mockReturnThis() });
}

function rpcResponse(result: object) {
  return authorizedBuilder(Promise.resolve(result));
}

const hit = (): Guess => ({
  name: "Hit",
  distance: 0,
  direction: "N",
});

const miss = (): Guess => ({
  name: "Miss",
  distance: 12000,
  direction: "NE",
});

describe("statsService championship methods", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    localStorage.clear();
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { user: { id: "user-1" }, access_token: "user-1-token" } }, error: null
    });
  });

  it("submits a completed daily result through the official RPC", async () => {
    (supabase.rpc as jest.Mock).mockReturnValue(rpcResponse({
      data: {
        id: "result-1",
        user_id: "user-1",
        game_date: "2026-06-19",
        guesses: [hit()],
        completed: true,
        won: true,
        tries_count: 1,
        best_distance: 0,
        shield_bonus: true,
        map_bonus: true,
        municipalities_bonus: false,
        main_score: 100,
        bonus_score: 40,
        total_score: 140,
        created_at: "2026-06-19T00:00:00.000Z",
        updated_at: "2026-06-19T00:00:00.000Z",
      },
      error: null,
    }));

    await statsService.syncDailyResultToSupabase(
      "user-1",
      "2026-06-19",
      [hit()],
      true,
      true
    );

    expect(supabase.rpc).toHaveBeenCalledWith("submit_daily_result", {
      target_game_date: "2026-06-19",
      submitted_guesses: [hit()],
      submitted_shield_bonus: true,
      submitted_map_bonus: true,
      submitted_municipalities_bonus: false,
    });
  });

  it("rejects a daily write when the active session belongs to another account", async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { user: { id: "secondary" }, access_token: "secondary-token" } }, error: null,
    });
    expect(await statsService.syncDailyResultToSupabase("user-1", "2026-10-06", [hit()], true, true)).toBeNull();
    expect(supabase.rpc).not.toHaveBeenCalled();
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("pins a pending submission to its original session even if the account switches", async () => {
    const response = rpcResponse({ data: { user_id: "user-1", guesses: [hit()] }, error: null });
    (supabase.rpc as jest.Mock).mockImplementation(() => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: { user: { id: "secondary" }, access_token: "secondary-token" } }, error: null,
      });
      return response;
    });
    await statsService.syncDailyResultToSupabase("user-1", "2026-10-06", [hit()], false, false);
    expect(response.setHeader).toHaveBeenCalledWith("Authorization", "Bearer user-1-token");
  });

  it("also rejects aggregate writes for an account that is no longer signed in", async () => {
    const stats = calculateStatsData({});
    saveStatsBaseline("user-1", { stats, guesses: {}, updatedAt: "" });
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { user: { id: "secondary" }, access_token: "secondary-token" } }, error: null,
    });
    expect(await statsService.syncStatsToSupabase("user-1", stats)).toBeNull();
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("loads a paginated account history and the latest statistics snapshot", async () => {
    const results = Array.from({ length: 501 }, (_, index) => ({
      game_date: new Date(Date.UTC(2025, 0, index + 1)).toISOString().slice(0, 10), guesses: [hit()],
    }));
    const range = vi.fn().mockResolvedValueOnce({ data: results.slice(0, 500), error: null })
      .mockResolvedValueOnce({ data: results.slice(500), error: null });
    const historyQuery = { eq: vi.fn().mockReturnThis(), order: vi.fn().mockReturnThis(), range };
    const stats = { user_id: "user-1", played: 501 };
    const statsQuery = { eq: vi.fn().mockReturnThis(), order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(), maybeSingle: vi.fn().mockResolvedValue({ data: stats, error: null }) };
    (supabase.from as jest.Mock).mockImplementation(table => ({
      select: vi.fn().mockReturnValue(table === "daily_results" ? historyQuery : statsQuery),
    }));
    const history = await statsService.loadAccountHistory("user-1");
    expect(Object.keys(history.guesses)).toHaveLength(501);
    expect(history.stats).toBe(stats);
    expect(historyQuery.eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(statsQuery.eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(statsQuery.order).toHaveBeenCalledWith("updated_at", { ascending: false });
    expect(range.mock.calls).toEqual([[0, 499], [500, 999]]);
  });

  it("does not overwrite a server correction with stale local statistics", async () => {
    const stats = { ...calculateStatsData({}), played: 100 };
    saveStatsBaseline("user-1", { stats, guesses: {}, updatedAt: "before-repair" });
    const latest = authorizedBuilder(Promise.resolve({ data: [{ id: "stats-1", played: 1, updated_at: "after-repair" }], error: null }));
    const query = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnValue(latest), update: vi.fn() };
    (supabase.from as jest.Mock).mockReturnValue(query);
    expect(await statsService.syncStatsToSupabase("user-1", stats)).toBeNull();
    expect(query.update).not.toHaveBeenCalled();
    expect(supabase.from).toHaveBeenCalledTimes(1);
  });

  it("saves a new game against the matching server snapshot without counting it twice", async () => {
    const oldDate = "2026-10-05T08:00:00.000Z";
    const oldGuesses = { "2026-10-05": [hit()] };
    saveStatsBaseline("user-1", { stats: calculateStatsData(oldGuesses), guesses: oldGuesses, updatedAt: oldDate });
    saveGuesses("2026-10-05", [hit()], "user-1");
    saveGuesses("2026-10-06", [hit()], "user-1");
    const latest = authorizedBuilder(Promise.resolve({ data: [{ id: "stats-1", played: 1, updated_at: oldDate }], error: null }));
    const query = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnValue(latest) };
    const mutation = authorizedBuilder({ eq: vi.fn().mockReturnThis(), select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: "stats-1", played: 2, updated_at: "2026-10-06T08:00:00.000Z" }, error: null }) });
    const update = vi.fn().mockReturnValue(mutation);
    (supabase.from as jest.Mock).mockReturnValueOnce(query).mockReturnValueOnce({ update });
    expect(await statsService.syncStatsToSupabase("user-1", getStatsData("user-1"))).toMatchObject({ played: 2 });
    expect(mutation.eq).toHaveBeenCalledWith("updated_at", oldDate);
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ played: 2, current_streak: 2, user_id: "user-1" }));
    expect(loadStatsBaseline("user-1")?.stats.played).toBe(2);
    expect(getStatsData("user-1").played).toBe(2);
  });

  it("submits the municipalities bonus after a completed loss", async () => {
    const losingGuesses = [miss(), miss(), miss(), miss()];
    (supabase.rpc as jest.Mock).mockReturnValue(rpcResponse({
      data: {
        id: "result-1",
        user_id: "user-1",
        game_date: "2026-06-19",
        guesses: losingGuesses,
        completed: true,
        won: false,
        tries_count: 4,
        best_distance: 12000,
        shield_bonus: false,
        map_bonus: false,
        municipalities_bonus: true,
        main_score: 0,
        bonus_score: 20,
        total_score: 20,
        created_at: "2026-06-19T00:00:00.000Z",
        updated_at: "2026-06-19T00:00:00.000Z",
      },
      error: null,
    }));

    await statsService.syncDailyResultToSupabase(
      "user-1",
      "2026-06-19",
      losingGuesses,
      false,
      false,
      true
    );

    expect(supabase.rpc).toHaveBeenCalledWith("submit_daily_result", {
      target_game_date: "2026-06-19",
      submitted_guesses: losingGuesses,
      submitted_shield_bonus: false,
      submitted_map_bonus: false,
      submitted_municipalities_bonus: true,
    });
  });

  it("falls back to the legacy daily result upsert when the official RPC is missing", async () => {
    (supabase.rpc as jest.Mock).mockReturnValue(rpcResponse({
      data: null,
      error: {
        code: "PGRST202",
        message:
          "Could not find the function public.submit_daily_result in the schema cache",
      },
    }));
    const single = jest.fn().mockResolvedValue({
      data: {
        id: "result-1",
        user_id: "user-1",
        game_date: "2026-06-19",
        guesses: [hit()],
        completed: true,
        won: true,
        tries_count: 1,
        best_distance: 0,
        shield_bonus: true,
        map_bonus: false,
        main_score: 100,
        bonus_score: 20,
        total_score: 120,
        created_at: "2026-06-19T00:00:00.000Z",
        updated_at: "2026-06-19T00:00:00.000Z",
      },
      error: null,
    });
    const maybeSingle = jest.fn().mockResolvedValue({
      data: null,
      error: null,
    });
    const eqGameDate = jest.fn(() => authorizedBuilder({ maybeSingle }));
    const eqUserId = jest.fn(() => ({ eq: eqGameDate }));
    const selectExisting = jest.fn(() => ({ eq: eqUserId }));
    const selectUpsert = jest.fn(() => ({ single }));
    const upsert = jest.fn(() => authorizedBuilder({ select: selectUpsert }));
    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ select: selectExisting })
      .mockReturnValueOnce({ upsert });

    const result = await statsService.syncDailyResultToSupabase(
      "user-1",
      "2026-06-19",
      [hit()],
      true,
      false
    );

    expect(supabase.from).toHaveBeenCalledWith("daily_results");
    expect(selectExisting).toHaveBeenCalledWith(
      "guesses,completed,won,tries_count,best_distance,shield_bonus,map_bonus,municipalities_bonus,main_score"
    );
    expect(eqUserId).toHaveBeenCalledWith("user_id", "user-1");
    expect(eqGameDate).toHaveBeenCalledWith("game_date", "2026-06-19");
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        game_date: "2026-06-19",
        completed: true,
        won: true,
        tries_count: 1,
        best_distance: 0,
        shield_bonus: true,
        map_bonus: false,
        municipalities_bonus: false,
        main_score: 100,
        bonus_score: 20,
        total_score: 120,
      }),
      { onConflict: "user_id,game_date" }
    );
    expect(result).toMatchObject({
      user_id: "user-1",
      total_score: 120,
    });
  });

  it("preserves existing bonus flags in the legacy daily result upsert", async () => {
    (supabase.rpc as jest.Mock).mockReturnValue(rpcResponse({
      data: null,
      error: {
        code: "PGRST202",
        message:
          "Could not find the function public.submit_daily_result in the schema cache",
      },
    }));
    const maybeSingle = jest.fn().mockResolvedValue({
      data: {
        guesses: [miss(), hit()],
        completed: true,
        won: true,
        tries_count: 2,
        best_distance: 0,
        shield_bonus: true,
        map_bonus: true,
        main_score: 75,
      },
      error: null,
    });
    const eqGameDate = jest.fn(() => authorizedBuilder({ maybeSingle }));
    const eqUserId = jest.fn(() => ({ eq: eqGameDate }));
    const selectExisting = jest.fn(() => ({ eq: eqUserId }));
    const single = jest.fn().mockResolvedValue({
      data: {
        id: "result-1",
        user_id: "user-1",
        game_date: "2026-06-19",
        guesses: [hit()],
        completed: true,
        won: true,
        tries_count: 2,
        best_distance: 0,
        shield_bonus: true,
        map_bonus: true,
        main_score: 75,
        bonus_score: 40,
        total_score: 115,
        created_at: "2026-06-19T00:00:00.000Z",
        updated_at: "2026-06-19T00:00:00.000Z",
      },
      error: null,
    });
    const selectUpsert = jest.fn(() => ({ single }));
    const upsert = jest.fn(() => authorizedBuilder({ select: selectUpsert }));
    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ select: selectExisting })
      .mockReturnValueOnce({ upsert });

    await statsService.syncDailyResultToSupabase(
      "user-1",
      "2026-06-19",
      [hit()],
      false,
      false
    );

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        shield_bonus: true,
        map_bonus: true,
        main_score: 75,
        bonus_score: 40,
        total_score: 115,
      }),
      { onConflict: "user_id,game_date" }
    );
  });

  it("loads an existing daily result for cross-device hydration", async () => {
    const maybeSingle = jest.fn().mockResolvedValue({
      data: {
        id: "result-1",
        user_id: "user-1",
        game_date: "2026-06-19",
        guesses: [miss(), hit()],
        completed: true,
        won: true,
        tries_count: 2,
        best_distance: 0,
        shield_bonus: true,
        map_bonus: false,
        main_score: 75,
        bonus_score: 20,
        total_score: 95,
        created_at: "2026-06-19T00:00:00.000Z",
        updated_at: "2026-06-19T00:00:00.000Z",
      },
      error: null,
    });
    const eqGameDate = jest.fn(() => authorizedBuilder({ maybeSingle }));
    const eqUserId = jest.fn(() => ({ eq: eqGameDate }));
    const select = jest.fn(() => ({ eq: eqUserId }));
    (supabase.from as jest.Mock).mockReturnValue({ select });

    const result = await statsService.getDailyResultFromSupabase(
      "user-1",
      "2026-06-19"
    );

    expect(supabase.from).toHaveBeenCalledWith("daily_results");
    expect(select).toHaveBeenCalledWith("*");
    expect(eqUserId).toHaveBeenCalledWith("user_id", "user-1");
    expect(eqGameDate).toHaveBeenCalledWith("game_date", "2026-06-19");
    expect(result).toMatchObject({
      user_id: "user-1",
      guesses: [miss(), hit()],
      main_score: 75,
      shield_bonus: true,
    });
  });

  it("calls the monthly leaderboard RPC with the month start", async () => {
    (supabase.rpc as jest.Mock).mockReturnValue(rpcResponse({
      data: [
        {
          user_id: "user-1",
          username: "xiana",
          avatar_emoji: "🧭",
          avatar_color: "green",
          total_score: 140,
          days_played: 1,
          wins: 1,
          bonus_score: 40,
          today_score: 140,
          today_main_score: 100,
          today_bonus_score: 40,
          rank: 1,
          previous_rank: 2,
          rank_delta: 1,
        },
      ],
      error: null,
    }));

    const leaderboard = await statsService.getMonthlyLeaderboard(
      "2026-06-19"
    );

    expect(supabase.rpc).toHaveBeenCalledWith("get_monthly_leaderboard", {
      target_month_start: "2026-06-01",
      target_today: "2026-06-19",
    });
    expect(leaderboard[0]).toMatchObject({
      user_id: "user-1",
      avatar_emoji: "🧭",
      avatar_color: "green",
      total_score: 140,
      rank_delta: 1,
    });
  });

  it("loads the closed previous month leaderboard for the first-day recap", async () => {
    (supabase.rpc as jest.Mock).mockReturnValue(rpcResponse({
      data: [],
      error: null,
    }));

    await statsService.getPreviousMonthlyLeaderboard("2026-06-01");

    expect(supabase.rpc).toHaveBeenCalledWith("get_monthly_leaderboard", {
      target_month_start: "2026-05-01",
      target_today: "2026-05-31",
    });
  });

  it("loads December as the previous month for a January first-day recap", async () => {
    (supabase.rpc as jest.Mock).mockReturnValue(rpcResponse({
      data: [],
      error: null,
    }));

    await statsService.getPreviousMonthlyLeaderboard("2026-01-01");

    expect(supabase.rpc).toHaveBeenCalledWith("get_monthly_leaderboard", {
      target_month_start: "2025-12-01",
      target_today: "2025-12-31",
    });
  });

  it("updates username and avatar together", async () => {
    const single = jest.fn().mockResolvedValue({
      data: {
        id: "user-1",
        username: "xiana",
        avatar_emoji: "🧭",
        avatar_color: "green",
        created_at: "2026-06-19T00:00:00.000Z",
        updated_at: "2026-06-19T00:00:00.000Z",
      },
      error: null,
    });
    const select = jest.fn(() => ({ single }));
    const eq = jest.fn(() => ({ select }));
    const update = jest.fn(() => ({ eq }));
    (supabase.from as jest.Mock).mockReturnValue({ update });

    await statsService.updateUserProfile("user-1", {
      username: "xiana",
      avatar_emoji: "🧭",
      avatar_color: "green",
    });

    expect(supabase.from).toHaveBeenCalledWith("user_profiles");
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        username: "xiana",
        avatar_emoji: "🧭",
        avatar_color: "green",
      })
    );
    expect(eq).toHaveBeenCalledWith("id", "user-1");
  });

  it("falls back to username-only update when avatar columns are missing", async () => {
    const avatarSingle = jest.fn().mockResolvedValue({
      data: null,
      error: {
        code: "PGRST204",
        message: "Could not find the 'avatar_color' column of 'user_profiles' in the schema cache",
      },
    });
    const usernameSingle = jest.fn().mockResolvedValue({
      data: {
        id: "user-1",
        username: "xiana",
        created_at: "2026-06-19T00:00:00.000Z",
        updated_at: "2026-06-19T00:00:00.000Z",
      },
      error: null,
    });
    const select = jest
      .fn()
      .mockReturnValueOnce({ single: avatarSingle })
      .mockReturnValueOnce({ single: usernameSingle });
    const eq = jest.fn(() => ({ select }));
    const update = jest.fn(() => ({ eq }));
    (supabase.from as jest.Mock).mockReturnValue({ update });

    const profile = await statsService.updateUserProfile("user-1", {
      username: "xiana",
      avatar_emoji: "🧭",
      avatar_color: "green",
    });

    expect(update).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        username: "xiana",
        avatar_emoji: "🧭",
        avatar_color: "green",
      })
    );
    expect(update).toHaveBeenNthCalledWith(
      2,
      expect.not.objectContaining({
        avatar_emoji: expect.anything(),
        avatar_color: expect.anything(),
      })
    );
    expect(profile).toMatchObject({
      username: "xiana",
      avatarColumnsMissing: true,
    });
  });
});
