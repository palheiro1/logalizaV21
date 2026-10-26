import { useCallback, useEffect, useRef, useState } from "react";

export const INSTALL_OFFER_DELAY_MS = 8_000;
export const INSTALL_DISMISS_MS = 7 * 24 * 60 * 60 * 1000;
export const INSTALL_OBSERVED_MS = 30 * 24 * 60 * 60 * 1000;
export const INSTALL_COOLDOWN_KEY = "logaliza:install-offer-until";

const APP_DISPLAY_MODE =
  "(display-mode: standalone), (display-mode: minimal-ui), (display-mode: fullscreen)";

type MobilePlatform = "ios" | "android";
type InstallChoice = { outcome: "accepted" | "dismissed" };
interface InstallPromptEvent extends Event {
  prompt: () => Promise<InstallChoice | void>;
  userChoice?: Promise<InstallChoice>;
}
interface MobileNavigator extends Navigator {
  standalone?: boolean;
  userAgentData?: { mobile?: boolean };
}

function mobilePlatform(): MobilePlatform | null {
  if (typeof navigator === "undefined") return null;
  const device = navigator as MobileNavigator;
  if (
    /iPad|iPhone|iPod/i.test(device.userAgent) ||
    (device.platform === "MacIntel" && device.maxTouchPoints > 1)
  ) {
    return "ios";
  }
  if (/Android/i.test(device.userAgent) || device.userAgentData?.mobile) {
    return "android";
  }
  return null;
}

function standalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    (navigator as MobileNavigator).standalone === true ||
    (typeof window.matchMedia === "function" &&
      window.matchMedia(APP_DISPLAY_MODE).matches)
  );
}

function readCooldown(): number {
  try {
    const value = Number(localStorage.getItem(INSTALL_COOLDOWN_KEY));
    const now = Date.now();
    // A damaged value must not hide the offer forever.
    return Number.isFinite(value) &&
      value > now &&
      value <= now + INSTALL_OBSERVED_MS + 24 * 60 * 60 * 1000
      ? value
      : 0;
  } catch {
    return 0;
  }
}

export function useAppInstall() {
  const [platform] = useState(mobilePlatform);
  const [ready, setReady] = useState(false);
  const [installed, setInstalled] = useState(standalone);
  const [cooldownUntil, setCooldownUntil] = useState(readCooldown);
  const [hasNativePrompt, setHasNativePrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const promptRef = useRef<InstallPromptEvent | null>(null);
  const installedRef = useRef(installed);
  const inFlightRef = useRef(false);
  const mountedRef = useRef(false);

  const postpone = useCallback((duration: number) => {
    const until = Math.max(readCooldown(), Date.now() + duration);
    setCooldownUntil(until);
    try {
      localStorage.setItem(INSTALL_COOLDOWN_KEY, String(until));
    } catch {
      // The in-memory dismissal still works when browser storage is blocked.
    }
  }, []);

  const observeInstallation = useCallback(() => {
    installedRef.current = true;
    setInstalled(true);
    promptRef.current = null;
    setHasNativePrompt(false);
    // This is a courtesy cooldown, not a permanent assertion that the app is
    // installed. Browser tabs cannot reliably detect a separate iOS install.
    postpone(INSTALL_OBSERVED_MS);
  }, [postpone]);

  useEffect(() => {
    mountedRef.current = true;
    if (!platform) {
      return () => { mountedRef.current = false; };
    }

    if (standalone()) observeInstallation();
    const timer = window.setTimeout(() => setReady(true), INSTALL_OFFER_DELAY_MS);
    const displayMode =
      typeof window.matchMedia === "function"
        ? window.matchMedia(APP_DISPLAY_MODE)
        : null;

    function handlePrompt(event: Event) {
      if (standalone() || installedRef.current) return;
      const candidate = event as InstallPromptEvent;
      if (typeof candidate.prompt !== "function") return;
      event.preventDefault();
      if (inFlightRef.current) return;
      promptRef.current = candidate;
      setHasNativePrompt(true);
    }

    function handleDisplayMode() {
      if (standalone()) observeInstallation();
    }

    function refreshCooldown() {
      setCooldownUntil((current) =>
        Math.max(current > Date.now() ? current : 0, readCooldown())
      );
    }

    function handleStorage(event: StorageEvent) {
      if (event.key === INSTALL_COOLDOWN_KEY || event.key === null) {
        setCooldownUntil(readCooldown());
      }
    }

    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener("appinstalled", observeInstallation);
    window.addEventListener("focus", refreshCooldown);
    window.addEventListener("storage", handleStorage);
    if (displayMode?.addEventListener) {
      displayMode.addEventListener("change", handleDisplayMode);
    } else {
      displayMode?.addListener?.(handleDisplayMode);
    }

    return () => {
      mountedRef.current = false;
      promptRef.current = null;
      window.clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      window.removeEventListener("appinstalled", observeInstallation);
      window.removeEventListener("focus", refreshCooldown);
      window.removeEventListener("storage", handleStorage);
      if (displayMode?.removeEventListener) {
        displayMode.removeEventListener("change", handleDisplayMode);
      } else {
        displayMode?.removeListener?.(handleDisplayMode);
      }
    };
  }, [platform, observeInstallation]);

  const dismiss = useCallback(() => postpone(INSTALL_DISMISS_MS), [postpone]);

  const install = useCallback(async () => {
    const event = promptRef.current;
    if (!event || inFlightRef.current || installedRef.current || standalone()) return;
    // Consume the event before awaiting: a native install event is single-use.
    promptRef.current = null;
    inFlightRef.current = true;
    setIsInstalling(true);
    try {
      // Keep prompt() in the user's click stack, before any asynchronous work.
      const result = await event.prompt();
      const choice = result ?? (await event.userChoice);
      if (!mountedRef.current) return;
      if (choice?.outcome === "accepted") {
        observeInstallation();
      } else if (choice?.outcome === "dismissed") {
        dismiss();
      }
    } catch {
      // A rejected/expired event falls back to the browser's manual instructions.
    } finally {
      inFlightRef.current = false;
      if (mountedRef.current) {
        setHasNativePrompt(false);
        setIsInstalling(false);
      }
    }
  }, [dismiss, observeInstallation]);

  return {
    visible: Boolean(platform) && ready && !installed && cooldownUntil <= Date.now(),
    mode: hasNativePrompt ? "native" as const : platform ?? "android",
    isInstalling,
    install,
    dismiss,
  };
}
