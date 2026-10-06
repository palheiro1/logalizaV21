export type GameStorage = Pick<Storage, "getItem" | "setItem">;

export function gameStorageKey(key: string, userId?: string): string {
  return `logaliza:v2:${userId ?? "guest"}:${key}`;
}

export function readGameStorage(
  key: string,
  userId?: string,
  storage: GameStorage = localStorage
): string | null {
  const stored = storage.getItem(gameStorageKey(key, userId));
  // Keep the old browser history available locally, without assigning it to
  // an account: its original owner cannot be determined safely.
  return stored ?? (userId ? null : storage.getItem(key));
}

export const DAILY_GAME_KEYS = [
  "guessedShield", "guessedMap", "guessedMunicipalities",
  "shieldAttemptResult", "municipalitiesAttemptResult",
  "hasParticipatedInNewPhase", "hasParticipatedInMapPhase",
];

export function claimGuestGame(userId: string, day: string): void {
  // Only a game actually played as a guest with this version can be claimed.
  // Legacy history, signed-out account history and already claimed games stay put.
  const playedKey = gameStorageKey(`guestPlayed-${day}`);
  if (localStorage.getItem(playedKey) !== "true") return;
  const ownerKey = gameStorageKey(`guestClaimed-${day}`);
  if (localStorage.getItem(ownerKey)) return;

  const guestGuesses = JSON.parse(localStorage.getItem(gameStorageKey("guesses")) ?? "{}");
  const accountKey = gameStorageKey("guesses", userId);
  const accountGuesses = JSON.parse(localStorage.getItem(accountKey) ?? "{}");
  if (!guestGuesses[day]?.length || accountGuesses[day]?.length) return;

  localStorage.setItem(accountKey, JSON.stringify({ ...accountGuesses, [day]: guestGuesses[day] }));
  for (const key of DAILY_GAME_KEYS) {
    const value = localStorage.getItem(gameStorageKey(`${key}-${day}`));
    if (value != null) localStorage.setItem(gameStorageKey(`${key}-${day}`, userId), value);
  }
  localStorage.setItem(ownerKey, userId);
}
