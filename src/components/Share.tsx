import { DateTime, Interval } from "luxon";
import { useMemo } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  computeProximityPercent,
  generateSquareCharacters,
  getDirectionEmoji,
} from "../domain/geography";
import { Guess } from "../domain/guess";
import React from "react";
import { SettingsData } from "../hooks/useSettings";

const START_DATE = DateTime.fromISO("2022-01-21");

export interface ShareProps {
  guesses: Guess[];
  dayString: string;
  settingsData: SettingsData;
  hideImageMode: boolean;
  rotationMode: boolean;
  guessedShield: boolean; // Indicates if the user guessed the shield
  guessedMap: boolean;    // NEW prop to indicate if the user guessed the map
}

export function Share({
  guesses,
  dayString,
  settingsData,
  hideImageMode,
  rotationMode,
  guessedShield,
  guessedMap, // NEW prop
}: ShareProps) {
  const { t } = useTranslation();
  const { theme } = settingsData;

  const shareText = useMemo(() => {
    const win = guesses[guesses.length - 1]?.distance === 0;
    const bestDistance = Math.min(...guesses.map(({ distance }) => distance));
    const guessCount = win ? guesses.length : "X";
    const dayCount = Math.floor(
      Interval.fromDateTimes(START_DATE, DateTime.fromISO(dayString)).length("day")
    );
    const difficultyModifierEmoji = hideImageMode
      ? " 🙈"
      : rotationMode
      ? " 🌀"
      : "";
    const bestPercent = `(${computeProximityPercent(bestDistance).toString()}%)`;

    const title = `#LoGaliza!, adivinha umha comarca cada dia #${dayCount} ${guessCount}/4 ${bestPercent}${difficultyModifierEmoji}`;
  
    const guessString = guesses
      .map((guess) => {
        const percent = computeProximityPercent(guess.distance);
        const squares = generateSquareCharacters(percent, theme).join("");
        const direction = getDirectionEmoji(guess);
        return `${squares}${direction}`;
      })
      .join("\n");
  
    return [
      title,
      guessString,
      guessedShield ? "🛡" : "",
      guessedMap ? "🗺️" : "", // NEW: add map emoji if guessedMap is true
      "https://logaliza-v21.vercel.app/"
    ]
      .filter(Boolean)
      .join(" ");
  }, [dayString, guesses, hideImageMode, rotationMode, theme, guessedShield, guessedMap]);

  return (
    <CopyToClipboard
      text={shareText}
      onCopy={() => toast(t("copy"))}
      options={{ format: "text/plain" }}
    >
      <button className="rounded font-bold border-2 p-1 uppercase bg-green-600 hover:bg-green-500 active:bg-green-700 text-white w-full">
        {t("share")}
      </button>
    </CopyToClipboard>
  );
}