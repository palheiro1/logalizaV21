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
    jest.clearAllMocks();
  });

  it("upserts a completed daily result with score breakdown", async () => {
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
    const select = jest.fn(() => ({ single }));
    const upsert = jest.fn(() => ({ select }));
    (supabase.from as jest.Mock).mockReturnValue({ upsert });

    await statsService.syncDailyResultToSupabase(
      "user-1",
      "2026-06-19",
      [hit()],
      true,
      true
    );

    expect(supabase.from).toHaveBeenCalledWith("daily_results");
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        game_date: "2026-06-19",
        completed: true,
        won: true,
        tries_count: 1,
        best_distance: 0,
        shield_bonus: true,
        map_bonus: true,
        main_score: 100,
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
