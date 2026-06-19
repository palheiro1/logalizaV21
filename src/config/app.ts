const DEFAULT_APP_URL = "https://logaliza.vercel.app";

function normalizeUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

export const APP_URL = normalizeUrl(
  process.env.REACT_APP_PUBLIC_APP_URL ?? DEFAULT_APP_URL
);

export function getAuthRedirectUrl(): string {
  if (typeof window !== "undefined" && window.location.origin) {
    return normalizeUrl(window.location.origin);
  }

  return APP_URL;
}
