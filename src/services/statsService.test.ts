import { supabase } from "../lib/supabase";
import { statsService } from "./statsService";
import { Guess } from "../domain/guess";

jest.mock("../lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

const hit = (): Guess => ({
  name: "Hit",
  distance: 0,
  direction: "N",
});

describe("statsService championship methods", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("submits a completed daily result through the official RPC", async () => {
    (supabase.rpc as jest.Mock).mockResolvedValue({
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
        main_score: 100,
        bonus_score: 40,
        total_score: 140,
        created_at: "2026-06-19T00:00:00.000Z",
        updated_at: "2026-06-19T00:00:00.000Z",
      },
      error: null,
    });

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
    });
  });

  it("falls back to the legacy daily result upsert when the official RPC is missing", async () => {
    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: null,
      error: {
        code: "PGRST202",
        message:
          "Could not find the function public.submit_daily_result in the schema cache",
      },
    });
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
    const eqGameDate = jest.fn(() => ({ maybeSingle }));
    const eqUserId = jest.fn(() => ({ eq: eqGameDate }));
    const selectExisting = jest.fn(() => ({ eq: eqUserId }));
    const selectUpsert = jest.fn(() => ({ single }));
    const upsert = jest.fn(() => ({ select: selectUpsert }));
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
    expect(selectExisting).toHaveBeenCalledWith("shield_bonus,map_bonus");
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
    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: null,
      error: {
        code: "PGRST202",
        message:
          "Could not find the function public.submit_daily_result in the schema cache",
      },
    });
    const maybeSingle = jest.fn().mockResolvedValue({
      data: {
        shield_bonus: true,
        map_bonus: true,
      },
      error: null,
    });
    const eqGameDate = jest.fn(() => ({ maybeSingle }));
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
        tries_count: 1,
        best_distance: 0,
        shield_bonus: true,
        map_bonus: true,
        main_score: 100,
        bonus_score: 40,
        total_score: 140,
        created_at: "2026-06-19T00:00:00.000Z",
        updated_at: "2026-06-19T00:00:00.000Z",
      },
      error: null,
    });
    const selectUpsert = jest.fn(() => ({ single }));
    const upsert = jest.fn(() => ({ select: selectUpsert }));
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
        bonus_score: 40,
        total_score: 140,
      }),
      { onConflict: "user_id,game_date" }
    );
  });

  it("calls the monthly leaderboard RPC with the month start", async () => {
    (supabase.rpc as jest.Mock).mockResolvedValue({
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
    });

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
