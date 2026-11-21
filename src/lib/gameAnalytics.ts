import { track } from "@vercel/analytics";
import { MAX_TRY_COUNT } from "../domain/scoring";

export const consentKey = "logaliza:analytics:v1:consent";
const entryKey = "logaliza:analytics:v1:entry";
const roundsKey = "logaliza:analytics:v1:rounds";
export type Consent = "granted" | "denied";
type Mode = "daily" | "audio_pilot";

const sources = ["facebook", "instagram", "x", "bluesky", "google", "other", "direct_or_unknown", "internal_test"] as const;
type Source = typeof sources[number];
const media = ["paid_social", "social", "referral", "unknown", "test"] as const;
interface Entry {
  source: Source;
  medium: typeof media[number];
  campaign: "proba_2e" | "other" | "unmarked";
}
interface Round {
  key: string;
  entry: Entry;
  complete: boolean;
}

export function browserOptsOut(): boolean {
  return (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true ||
    navigator.doNotTrack === "1";
}

export function readConsent(): Consent | null {
  if (browserOptsOut()) return "denied";
  try {
    const choice = localStorage.getItem(consentKey);
    return choice === "granted" || choice === "denied" ? choice : null;
  } catch {
    return "denied";
  }
}

export function saveConsent(choice: Consent): void {
  try {
    localStorage.setItem(consentKey, choice);
  } catch { /* Optional measurement never blocks play. */ }
  if (choice === "denied") forgetAnalyticsHistory();
}

export function forgetAnalyticsHistory(): void {
  try {
    localStorage.removeItem(roundsKey);
    sessionStorage.removeItem(entryKey);
  } catch { /* Storage may be disabled. */ }
}

function network(host: string): Source {
  if (/(^|\.)facebook\.com$/.test(host) || host === "com.facebook.katana") return "facebook";
  if (/(^|\.)instagram\.com$/.test(host) || host === "com.instagram.android") return "instagram";
  if (/(^|\.)(x\.com|twitter\.com)$/.test(host) || host === "t.co" || host === "com.twitter.android") return "x";
  if (/(^|\.)bsky\.app$/.test(host)) return "bluesky";
  if (/^(www\.)?google\.(com|es|pt|gal)$/.test(host)) return "google";
  return host ? "other" : "direct_or_unknown";
}

export function classifyEntry(url: URL, referrer: string): Entry {
  const tag = url.searchParams.get("utm_source")?.toLowerCase();
  const medium = url.searchParams.get("utm_medium")?.toLowerCase();
  const campaign = url.searchParams.get("utm_campaign");
  if (tag === "logaliza_qa" && medium === "test") return { source: "internal_test", medium: "test", campaign: "unmarked" };
  let host = "";
  try { if (referrer) host = new URL(referrer).hostname; } catch { /* Missing referrer. */ }
  let source = network(host === url.hostname ? "" : host);
  if (tag === "fb" || tag === "facebook") source = "facebook";
  else if (tag === "ig" || tag === "instagram") source = "instagram";
  else if (tag === "twitter" || tag === "x") source = "x";
  else if (tag === "bluesky" || tag === "bsky") source = "bluesky";
  else if (tag) source = "other";
  // X appends this parameter to ad clicks. Keep only its presence, never the click ID.
  const xAdClick = Boolean(url.searchParams.get("twclid")) && (!tag || source === "x");
  if (xAdClick) source = "x";
  const social = ["facebook", "instagram", "x", "bluesky"].includes(source);
  const paid = xAdClick || (social && (medium === "paid_social" || medium === "cpc" || medium === "paid"));
  return {
    source,
    medium: paid ? "paid_social" : social ? "social" : source === "direct_or_unknown" ? "unknown" : "referral",
    campaign: campaign === "proba_2e" ? campaign : campaign ? "other" : "unmarked",
  };
}

function validEntry(entry: Entry | null): entry is Entry {
  return !!entry && sources.includes(entry.source) && media.includes(entry.medium) &&
    ["proba_2e", "other", "unmarked"].includes(entry.campaign);
}

function readStored<T>(storage: Storage, key: string, fallback: T): T {
  try { return JSON.parse(storage.getItem(key) ?? "null") ?? fallback; }
  catch { return fallback; }
}

export function rememberEntry(): void {
  if (readConsent() !== "granted") return;
  try {
    const entry = classifyEntry(new URL(location.href), document.referrer);
    const navigation = performance.getEntriesByType?.("navigation")[0] as PerformanceNavigationTiming | undefined;
    const sameSite = document.referrer && new URL(document.referrer).origin === location.origin;
    if (entry.source === "direct_or_unknown" && (sameSite || navigation?.type === "reload") && sessionStorage.getItem(entryKey)) return;
    sessionStorage.setItem(entryKey, JSON.stringify(entry));
  } catch { /* A valid guess can still classify its own landing URL. */ }
}

export async function recordGameGuess(mode: Mode, puzzle: string, attempt: number, won: boolean): Promise<void> {
  if (readConsent() !== "granted" || attempt < 1 || attempt > MAX_TRY_COUNT) return;

  const record = () => {
    if (readConsent() !== "granted") return;
    const stored: unknown = readStored(localStorage, roundsKey, []);
    const rounds: Round[] = Array.isArray(stored) ? stored.filter(r => r && validEntry(r.entry)) : [];
    const key = mode + ":" + puzzle;
    let round = rounds.find(r => r.key === key);
    const started = !round && attempt === 1;
    if (!round) {
      // An ongoing or restored game without a measured start is outside this cohort.
      if (!started) return;
      const entry = readStored<Entry | null>(sessionStorage, entryKey, null);
      round = { key, entry: validEntry(entry) ? entry : classifyEntry(new URL(location.href), document.referrer), complete: false };
      rounds.push(round);
    }
    if (round.complete) return;
    const finished = won || attempt === MAX_TRY_COUNT;
    if (!started && !finished) return;
    round.complete = finished;
    localStorage.setItem(roundsKey, JSON.stringify(rounds.slice(-32)));
    const properties = { mode, source: round.entry.source, medium: round.entry.medium, campaign: round.entry.campaign };
    if (started) track("game_start", properties);
    if (finished) track("game_complete", { ...properties, attempts: attempt, result: won ? "won" : "lost" });
  };
  try {
    if (navigator.locks) await navigator.locks.request(roundsKey, record);
    else record();
  } catch { /* Blocked analytics/storage must never interrupt a guess. */ }
}
