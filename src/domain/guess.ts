import { Direction } from "./geography";
import { gameStorageKey, readGameStorage } from "./gameStorage";

export interface Guess {
  name: string;
  distance: number;
  direction: Direction;
}

export function loadAllGuesses(userId?: string): Record<string, Guess[]> {
  const storedGuesses = readGameStorage("guesses", userId);
  return storedGuesses != null ? JSON.parse(storedGuesses) : {};
}

export function saveGuesses(dayString: string, guesses: Guess[], userId?: string): void {
  const allGuesses = loadAllGuesses(userId);
  localStorage.setItem(
    gameStorageKey("guesses", userId),
    JSON.stringify({
      ...allGuesses,
      [dayString]: guesses,
    })
  );
}
