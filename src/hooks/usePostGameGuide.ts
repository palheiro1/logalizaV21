import confetti from "canvas-confetti";
import { useEffect, useRef, useState } from "react";
import { gameStorageKey } from "../domain/gameStorage";

export const RESULT_READING_TIME_MS = 5000;
const HIDE_GUIDE_KEY = "logaliza:hide-post-game-guide";

async function celebrateWin() {
  try {
    await confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      disableForReducedMotion: true,
    });
  } catch {
    // A browser without a working canvas can still show the result and the guide.
  }
}

export function usePostGameGuide(day: string, userId?: string) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [outcome, finishRound] = useState<"win" | "loss" | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!outcome) return;

    headingRef.current?.focus();
    const celebration = outcome === "win" ? celebrateWin() : undefined;
    const shownKey = gameStorageKey("lastPostGameGuideDay", userId);
    const canShow = () =>
      !document.hidden &&
      localStorage.getItem(HIDE_GUIDE_KEY) !== "true" &&
      localStorage.getItem(shownKey) !== day;
    if (!canShow()) return;

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      await celebration;
      if (!cancelled && canShow()) {
        localStorage.setItem(shownKey, day);
        setIsOpen(true);
      }
      cancel();
    }, RESULT_READING_TIME_MS);

    function cancelOnAction(event: Event) {
      if (event.target instanceof Element && event.target.closest("a, button, input, select")) {
        cancel();
      }
    }

    function cancelWhenHidden() {
      if (document.hidden) cancel();
    }

    function cancel() {
      cancelled = true;
      window.clearTimeout(timer);
      document.removeEventListener("click", cancelOnAction, true);
      document.removeEventListener("focusin", cancelOnAction, true);
      document.removeEventListener("visibilitychange", cancelWhenHidden);
    }

    document.addEventListener("click", cancelOnAction, true);
    document.addEventListener("focusin", cancelOnAction, true);
    document.addEventListener("visibilitychange", cancelWhenHidden);
    return cancel;
  }, [day, outcome, userId]);

  function dismiss(hideForFutureGames: boolean) {
    if (hideForFutureGames) localStorage.setItem(HIDE_GUIDE_KEY, "true");
    setIsOpen(false);
  }

  return { headingRef, finishRound, isOpen, dismiss };
}
