import React from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { expect, vi } from "vitest";
import {
  INSTALL_COOLDOWN_KEY,
  INSTALL_DISMISS_MS,
  INSTALL_OBSERVED_MS,
  INSTALL_OFFER_DELAY_MS,
  useAppInstall,
} from "./useAppInstall";

const ANDROID = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/130.0.0.0 Mobile Safari/537.36";
const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1";
const MAC = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15";
const START = new Date("2026-10-26T12:00:00Z");
const navigatorProperties = ["userAgent", "platform", "maxTouchPoints", "standalone", "userAgentData"];
const originalNavigatorProperties = navigatorProperties.map((name) => [
  name,
  Object.getOwnPropertyDescriptor(navigator, name),
] as const);

function device(userAgent: string, platform = "Linux armv8l", maxTouchPoints = 5) {
  Object.defineProperties(navigator, {
    userAgent: { configurable: true, value: userAgent },
    platform: { configurable: true, value: platform },
    maxTouchPoints: { configurable: true, value: maxTouchPoints },
    standalone: { configurable: true, value: false },
    userAgentData: { configurable: true, value: undefined },
  });
}

function displayMode(mode?: string) {
  vi.stubGlobal("matchMedia", vi.fn((query: string) => ({
    matches: Boolean(mode && query.includes(`display-mode: ${mode}`)),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })));
}

function Harness() {
  const { visible, mode, isInstalling, install, dismiss } = useAppInstall();
  return (
    <>
      <p>Jogo disponível</p>
      {visible && (
        <section aria-label="Instalar a app">
          <output aria-label="Modo">{mode}</output>
          <output aria-label="A instalar">{String(isInstalling)}</output>
          <button onClick={() => void install()}>Instalar</button>
          <button onClick={dismiss}>Agora nom</button>
        </section>
      )}
    </>
  );
}

function advance(ms = INSTALL_OFFER_DELAY_MS) {
  act(() => { vi.advanceTimersByTime(ms); });
}

type Choice = { outcome: "accepted" | "dismissed"; platform: string };

function nativeEvent(outcome: Choice["outcome"] = "accepted") {
  return Object.assign(new Event("beforeinstallprompt", { cancelable: true }), {
    prompt: vi.fn<() => Promise<Choice | void>>().mockResolvedValue(undefined),
    userChoice: Promise.resolve({ outcome, platform: "web" } as Choice),
  });
}

function dispatch(event: Event) {
  act(() => { window.dispatchEvent(event); });
}

async function clickInstall() {
  await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Instalar" })); });
}

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  vi.setSystemTime(START);
  device(ANDROID);
  displayMode();
});

afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  originalNavigatorProperties.forEach(([name, descriptor]) => {
    if (descriptor) Object.defineProperty(navigator, name, descriptor);
    else Reflect.deleteProperty(navigator, name);
  });
  localStorage.clear();
});

test.each([
  [ANDROID, "Linux armv8l", 5, "android"],
  [IPHONE, "iPhone", 5, "ios"],
  [MAC, "MacIntel", 5, "ios"],
])("offers manual installation after the delay on %s", (ua, platform, touchPoints, mode) => {
  device(String(ua), String(platform), Number(touchPoints));
  render(<Harness />);
  advance(INSTALL_OFFER_DELAY_MS - 1);
  expect(screen.queryByRole("region", { name: "Instalar a app" })).not.toBeInTheDocument();
  advance(1);
  expect(screen.getByLabelText("Modo")).toHaveTextContent(String(mode));
});

test("does not offer installation or intercept the native event on a narrow desktop", () => {
  device(MAC, "MacIntel", 0);
  vi.stubGlobal("innerWidth", 360);
  render(<Harness />);
  const event = nativeEvent();
  dispatch(event);
  advance();
  expect(event.defaultPrevented).toBe(false);
  expect(event.prompt).not.toHaveBeenCalled();
  expect(screen.queryByRole("region")).not.toBeInTheDocument();
});

test.each(["standalone", "minimal-ui", "fullscreen", "ios-standalone"])(
  "does not offer or prompt when already running in %s",
  (mode) => {
    if (mode === "ios-standalone") {
      device(IPHONE, "iPhone");
      Object.defineProperty(navigator, "standalone", { configurable: true, value: true });
    } else displayMode(mode);
    render(<Harness />);
    const event = nativeEvent();
    dispatch(event);
    advance();
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
    expect(event.prompt).not.toHaveBeenCalled();
  }
);

test("remembers a dismissal for seven days, then offers again on a later visit", () => {
  const firstVisit = render(<Harness />);
  advance();
  const dismissedAt = Date.now();
  fireEvent.click(screen.getByRole("button", { name: "Agora nom" }));
  expect(screen.queryByRole("region")).not.toBeInTheDocument();
  expect(Number(localStorage.getItem(INSTALL_COOLDOWN_KEY))).toBe(dismissedAt + INSTALL_DISMISS_MS);
  firstVisit.unmount();

  vi.setSystemTime(dismissedAt + INSTALL_DISMISS_MS - 60_000);
  const laterVisit = render(<Harness />);
  advance();
  expect(screen.queryByRole("region")).not.toBeInTheDocument();
  laterVisit.unmount();

  vi.setSystemTime(dismissedAt + INSTALL_DISMISS_MS + 1);
  render(<Harness />);
  advance();
  expect(screen.getByRole("region")).toBeVisible();
});

test.each(["invalid", "{}", "Infinity", "-1", String(START.getTime() - 1), String(START.getTime() + 365 * 86400000)])(
  "ignores an invalid, expired or implausible cooldown (%s)",
  (stored) => {
    localStorage.setItem(INSTALL_COOLDOWN_KEY, stored);
    render(<Harness />);
    advance();
    expect(screen.getByRole("region")).toBeVisible();
  }
);

test("keeps the offer dismissible when browser storage is unavailable", () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new DOMException("Blocked", "SecurityError"); });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("Blocked", "SecurityError"); });
  render(<Harness />);
  advance();
  fireEvent.click(screen.getByRole("button", { name: "Agora nom" }));
  dispatch(new Event("focus"));
  expect(screen.queryByRole("region")).not.toBeInTheDocument();
  expect(screen.getByText("Jogo disponível")).toBeVisible();
});

test("retains a mobile native event but prompts only after a click and only once while pending", async () => {
  let finishChoice!: (choice: Choice) => void;
  const event = nativeEvent();
  event.userChoice = new Promise<Choice>((resolve) => { finishChoice = resolve; });
  render(<Harness />);
  dispatch(event);
  expect(event.defaultPrevented).toBe(true);
  advance();
  expect(screen.getByLabelText("Modo")).toHaveTextContent("native");
  expect(event.prompt).not.toHaveBeenCalled();

  await clickInstall();
  expect(event.prompt).toHaveBeenCalledTimes(1);
  expect(screen.getByLabelText("A instalar")).toHaveTextContent("true");
  expect(screen.getByLabelText("Modo")).toHaveTextContent("native");
  await clickInstall();
  expect(event.prompt).toHaveBeenCalledTimes(1);

  const acceptedAt = Date.now();
  await act(async () => { finishChoice({ outcome: "accepted", platform: "web" }); });
  expect(screen.queryByRole("region")).not.toBeInTheDocument();
  expect(Number(localStorage.getItem(INSTALL_COOLDOWN_KEY))).toBe(acceptedAt + INSTALL_OBSERVED_MS);
});

test.each(["accepted", "dismissed"] as const)("handles a modern native prompt returning %s", async (outcome) => {
  const event = nativeEvent();
  event.prompt.mockResolvedValue({ outcome, platform: "web" });
  event.userChoice = new Promise<Choice>(() => {});
  render(<Harness />);
  dispatch(event);
  advance();
  const promptedAt = Date.now();
  await clickInstall();
  expect(event.prompt).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole("region")).not.toBeInTheDocument();
  expect(Number(localStorage.getItem(INSTALL_COOLDOWN_KEY))).toBe(
    promptedAt + (outcome === "accepted" ? INSTALL_OBSERVED_MS : INSTALL_DISMISS_MS)
  );
});

test("remembers dismissal of the legacy native prompt for seven days", async () => {
  const event = nativeEvent("dismissed");
  render(<Harness />);
  dispatch(event);
  advance();
  const promptedAt = Date.now();
  await clickInstall();
  expect(screen.queryByRole("region")).not.toBeInTheDocument();
  expect(Number(localStorage.getItem(INSTALL_COOLDOWN_KEY))).toBe(promptedAt + INSTALL_DISMISS_MS);
});

test("falls back to manual installation after a native prompt failure without reusing it", async () => {
  const event = nativeEvent();
  event.prompt.mockRejectedValue(new Error("Prompt no longer available"));
  render(<Harness />);
  dispatch(event);
  advance();
  await clickInstall();
  expect(screen.getByLabelText("Modo")).toHaveTextContent("android");
  expect(screen.getByLabelText("A instalar")).toHaveTextContent("false");
  expect(screen.getByText("Jogo disponível")).toBeVisible();
  await clickInstall();
  expect(event.prompt).toHaveBeenCalledTimes(1);
});

test("an observed installation hides the offer temporarily, allowing it again after thirty days", () => {
  const firstVisit = render(<Harness />);
  advance();
  const installedAt = Date.now();
  dispatch(new Event("appinstalled"));
  expect(screen.queryByRole("region")).not.toBeInTheDocument();
  expect(Number(localStorage.getItem(INSTALL_COOLDOWN_KEY))).toBe(installedAt + INSTALL_OBSERVED_MS);
  firstVisit.unmount();

  vi.setSystemTime(installedAt + INSTALL_OBSERVED_MS - 60_000);
  const installedVisit = render(<Harness />);
  advance();
  expect(screen.queryByRole("region")).not.toBeInTheDocument();
  installedVisit.unmount();

  vi.setSystemTime(installedAt + INSTALL_OBSERVED_MS + 1);
  render(<Harness />);
  advance();
  expect(screen.getByRole("region")).toBeVisible();
});

test("removes event handlers and the pending offer when unmounted", () => {
  const view = render(<Harness />);
  view.unmount();
  const event = nativeEvent();
  dispatch(event);
  dispatch(new Event("appinstalled"));
  advance();
  expect(event.defaultPrevented).toBe(false);
  expect(event.prompt).not.toHaveBeenCalled();
  expect(localStorage.getItem(INSTALL_COOLDOWN_KEY)).toBeNull();
  expect(screen.queryByRole("region")).not.toBeInTheDocument();
});
