import { claimGuestGame, gameStorageKey, readGameStorage } from "./gameStorage";
import { loadAllGuesses, saveGuesses } from "./guess";

const day = "2026-10-06";
const hit = { name: "Chantada", distance: 0, direction: "N" as const };

beforeEach(() => localStorage.clear());

test("keeps guesses and bonuses separate when switching accounts", () => {
  saveGuesses(day, [hit], "original");
  localStorage.setItem(gameStorageKey(`guessedShield-${day}`, "original"), "true");
  expect(loadAllGuesses("secondary")).toEqual({});
  expect(readGameStorage(`guessedShield-${day}`, "secondary")).toBeNull();
  saveGuesses(day, [{ ...hit, distance: 100 }], "secondary");
  expect(loadAllGuesses("original")[day]).toEqual([hit]);
  expect(loadAllGuesses()).toEqual({});
});

test("preserves legacy browser history without copying it to a signed-in account", () => {
  const history = JSON.stringify({ [day]: [hit] });
  localStorage.setItem("guesses", history);
  localStorage.setItem(`guessedShield-${day}`, "true");
  claimGuestGame("secondary", day);
  expect(loadAllGuesses("secondary")).toEqual({});
  expect(readGameStorage(`guessedShield-${day}`, "secondary")).toBeNull();
  expect(loadAllGuesses()[day]).toEqual([hit]);
  expect(localStorage.getItem("guesses")).toBe(history);
});

test("lets a newly played guest game and its bonuses enter one account only", () => {
  saveGuesses(day, [hit]);
  localStorage.setItem(gameStorageKey(`guestPlayed-${day}`), "true");
  localStorage.setItem(gameStorageKey(`guessedShield-${day}`), "true");
  claimGuestGame("original", day);
  claimGuestGame("secondary", day);
  expect(loadAllGuesses("original")[day]).toEqual([hit]);
  expect(readGameStorage(`guessedShield-${day}`, "original")).toBe("true");
  expect(loadAllGuesses("secondary")).toEqual({});
});

test("keeps an account's existing game when claiming guest progress", () => {
  saveGuesses(day, [hit]);
  localStorage.setItem(gameStorageKey(`guestPlayed-${day}`), "true");
  const existing = [{ ...hit, name: "Vigo", distance: 100 }];
  saveGuesses(day, existing, "original");
  claimGuestGame("original", day);
  expect(loadAllGuesses("original")[day]).toEqual(existing);
});
