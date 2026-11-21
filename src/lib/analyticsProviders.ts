import { inject } from "@vercel/analytics";
import { injectSpeedInsights } from "@vercel/speed-insights";
import { forgetAnalyticsHistory, readConsent, rememberEntry } from "./gameAnalytics";

// This is the site's existing Google page-view stream. Game events live in Vercel.
const googleId = "G-QV9JMD11ZD";
declare global {
  interface Window {
    dataLayer?: IArguments[];
    gtag?: (...args: unknown[]) => void;
    "ga-disable-G-QV9JMD11ZD"?: boolean;
  }
}

function safeUrl(raw: string): string {
  const url = new URL(raw, location.origin);
  const clean = new URL(url.pathname, url.origin);
  const known: Record<string, string[]> = {
    utm_source: ["facebook", "fb", "instagram", "ig", "x", "twitter", "bluesky", "bsky"],
    utm_medium: ["paid_social", "social", "cpc", "paid"],
    utm_campaign: ["proba_2e"],
    utm_content: ["feed_ponte", "reel_ponte"],
  };
  for (const [key, allowed] of Object.entries(known)) {
    const value = url.searchParams.get(key);
    if (value && allowed.includes(value)) clean.searchParams.set(key, value);
  }
  return clean.href;
}

function isInternalTest(url: URL): boolean {
  return url.searchParams.get("utm_source") === "logaliza_qa" && url.searchParams.get("utm_medium") === "test";
}

function beforeSend<T extends { url: string; type: string }>(event: T): T | null {
  if (readConsent() !== "granted") return null;
  if (event.type !== "event" && isInternalTest(new URL(location.href))) return null;
  return { ...event, url: safeUrl(event.url) };
}

const advertisingDenied = { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" };
let active = false;
let googleInitialized = false;

export function configureAnalytics(): void {
  const choice = readConsent();
  const granted = choice === "granted";
  window["ga-disable-G-QV9JMD11ZD"] = !granted;
  if (!granted) {
    if (choice === "denied") {
      forgetAnalyticsHistory();
      for (const name of ["_ga", "_ga_QV9JMD11ZD"]) {
        const expired = name + "=; Max-Age=0; Path=/";
        document.cookie = expired;
        document.cookie = expired + "; Domain=" + location.hostname;
      }
    }
    if (active && googleInitialized) window.gtag?.("consent", "update", { ...advertisingDenied, analytics_storage: "denied" });
    active = false;
    return;
  }
  if (active) return;
  active = true;
  rememberEntry();
  inject({ beforeSend, framework: "react" });
  injectSpeedInsights({ beforeSend });

  const url = new URL(location.href);
  if (!["logaliza.vercel.app", "logaliza-v21.vercel.app"].includes(url.hostname) || isInternalTest(url)) return;
  if (googleInitialized) {
    window.gtag?.("consent", "update", { ...advertisingDenied, analytics_storage: "granted" });
    return;
  }
  googleInitialized = true;
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = window.gtag ?? function () { window.dataLayer!.push(arguments); };
  window.gtag("consent", "default", { ...advertisingDenied, analytics_storage: "granted" });
  window.gtag("js", new Date());
  window.gtag("config", googleId, {
    page_location: safeUrl(location.href),
    page_referrer: document.referrer ? new URL(document.referrer).origin : "",
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=" + googleId;
  document.head.appendChild(script);
}
