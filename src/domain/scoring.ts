import { Guess } from "./guess";

export const MAX_TRY_COUNT = 4;
export const SHIELD_BONUS_POINTS = 20;
export const MAP_BONUS_POINTS = 20;

const MAIN_SCORE_BY_TRY: Record<number, number> = {
  1: 100,
  2: 75,
  3: 50,
  4: 25,
};

export interface DailyScore {
  won: boolean;
  completed: boolean;
  triesCount: number | null;
  bestDistance: number | null;
  mainScore: number;
  shieldBonusScore: number;
  mapBonusScore: number;
  bonusScore: number;
  totalScore: number;
}

export function calculateDailyScore(
  guesses: Guess[],
  guessedShield: boolean,
  guessedMap: boolean
): DailyScore {
  const winIndex = guesses.findIndex((guess) => guess.distance === 0);
  const won = winIndex >= 0;
  const completed = won || guesses.length >= MAX_TRY_COUNT;
  const triesCount = won ? winIndex + 1 : completed ? guesses.length : null;
  const bestDistance =
    guesses.length > 0
      ? Math.min(...guesses.map((guess) => guess.distance))
      : null;
  const mainScore = won ? MAIN_SCORE_BY_TRY[winIndex + 1] ?? 0 : 0;
  const shieldBonusScore = won && guessedShield ? SHIELD_BONUS_POINTS : 0;
  const mapBonusScore = won && guessedMap ? MAP_BONUS_POINTS : 0;
  const bonusScore = shieldBonusScore + mapBonusScore;

  return {
    won,
    completed,
    triesCount,
    bestDistance,
    mainScore,
    shieldBonusScore,
    mapBonusScore,
    bonusScore,
    totalScore: mainScore + bonusScore,
  };
}
