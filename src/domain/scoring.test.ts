import { Guess } from "./guess";
import { calculateDailyScore } from "./scoring";

const miss = (distance: number): Guess => ({
  name: `Miss ${distance}`,
  distance,
  direction: "N",
});

const hit = (): Guess => ({
  name: "Hit",
  distance: 0,
  direction: "N",
});

describe("calculateDailyScore", () => {
  it.each([
    [1, 100],
    [2, 75],
    [3, 50],
    [4, 25],
  ])("scores a win in %i tries", (tries, expectedMainScore) => {
    const guesses = [...Array(tries - 1)].map((_, index) =>
      miss((index + 1) * 1000)
    );

    expect(calculateDailyScore([...guesses, hit()], false, false)).toMatchObject(
      {
        won: true,
        completed: true,
        triesCount: tries,
        mainScore: expectedMainScore,
        bonusScore: 0,
        totalScore: expectedMainScore,
      }
    );
  });

  it("scores the shield and map bonuses only after a main win", () => {
    expect(calculateDailyScore([hit()], true, true)).toMatchObject({
      mainScore: 100,
      shieldBonusScore: 20,
      mapBonusScore: 20,
      bonusScore: 40,
      totalScore: 140,
    });
  });

  it("scores the municipalities bonus after either a win or a loss", () => {
    expect(calculateDailyScore([hit()], false, false, true)).toMatchObject({
      won: true,
      municipalitiesBonusScore: 20,
      bonusScore: 20,
      totalScore: 120,
    });

    expect(
      calculateDailyScore(
        [miss(1000), miss(2000), miss(3000), miss(4000)],
        false,
        false,
        true
      )
    ).toMatchObject({
      won: false,
      municipalitiesBonusScore: 20,
      bonusScore: 20,
      totalScore: 20,
    });
  });

  it("does not score the municipalities bonus before the game ends", () => {
    expect(
      calculateDailyScore([miss(1000)], false, false, true)
    ).toMatchObject({
      completed: false,
      municipalitiesBonusScore: 0,
      totalScore: 0,
    });
  });

  it("does not score bonuses after a loss", () => {
    expect(
      calculateDailyScore(
        [miss(1000), miss(2000), miss(3000), miss(4000)],
        true,
        true
      )
    ).toMatchObject({
      won: false,
      completed: true,
      triesCount: 4,
      mainScore: 0,
      bonusScore: 0,
      totalScore: 0,
    });
  });

  it("keeps an unfinished game unscored", () => {
    expect(calculateDailyScore([miss(1000)], false, false)).toMatchObject({
      won: false,
      completed: false,
      triesCount: null,
      bestDistance: 1000,
      totalScore: 0,
    });
  });
});
