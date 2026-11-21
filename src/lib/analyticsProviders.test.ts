import { expect, test, vi } from "vitest";
import { inject } from "@vercel/analytics";
import { injectSpeedInsights } from "@vercel/speed-insights";
import { configureAnalytics } from "./analyticsProviders";
import { saveConsent } from "./gameAnalytics";

vi.mock("@vercel/analytics", () => ({ inject: vi.fn(), track: vi.fn() }));
vi.mock("@vercel/speed-insights", () => ({ injectSpeedInsights: vi.fn() }));

test("loads analytics only after consent, strips private params and stops existing trackers on withdrawal", () => {
  localStorage.clear();
  configureAnalytics();
  expect(inject).not.toHaveBeenCalled();
  expect(injectSpeedInsights).not.toHaveBeenCalled();
  expect(document.querySelector('script[src*="googletagmanager"]')).toBeNull();
  saveConsent("granted");
  configureAnalytics();
  configureAnalytics();
  expect(inject).toHaveBeenCalledTimes(1);
  const send = vi.mocked(inject).mock.calls[0][0]!.beforeSend!;
  const event = { type: "event" as const, url: "https://logaliza.vercel.app/?utm_source=facebook&fbclid=private#token" };
  expect(send(event)?.url).toBe("https://logaliza.vercel.app/?utm_source=facebook");
  history.replaceState({}, "", "?utm_source=logaliza_qa&utm_medium=test");
  expect(send({ ...event, type: "pageview" })).toBeNull();
  expect(send(event)).not.toBeNull();
  document.cookie = "_ga=test; Path=/";
  saveConsent("denied");
  configureAnalytics();
  expect(send(event)).toBeNull();
  expect(document.cookie).not.toContain("_ga=");
});
