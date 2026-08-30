import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { getCountryName, sanitizeCountryName, getCountryFilename } from "../domain/countries";
import { countries, srcImageFolder } from "../environment";
import { useMode } from "../hooks/useMode";
import { useNewsNotifications } from "../hooks/useNewsNotifications";
import { getDayString, useTodays } from "../hooks/useTodays";
import { CountryInput } from "./CountryInput";
import { Guesses } from "./Guesses";
import { Share } from "./Share";
import NewPhase from "./NewPhase";
import listagemLigazons from "../domain/listagemLigazons";
import confetti from "canvas-confetti";
import { Twemoji } from "react-emoji-render";
import { toast, Id, ToastContent } from "react-toastify";
import * as geolib from "geolib";
import { SettingsData } from "../hooks/useSettings";
import MapPhase from "./MapPhase";
import { useAuth } from "../contexts/AuthContext";
import { calculateDailyScore, MAX_TRY_COUNT } from "../domain/scoring";
import { MonthlyLeaderboardEntry, statsService } from "../services/statsService";
import { MonthlyChampionshipSummary } from "./MonthlyChampionshipSummary";
import { PreviousMonthChampionshipScreen } from "./PreviousMonthChampionshipScreen";
import { DateTime } from "luxon";
import { AudioPilotPlayer } from "./AudioPilotPlayer";
import { AudioSampleReveal } from "./AudioSampleReveal";

interface GameProps {
  settingsData: SettingsData;
  updateSettings: (newSettings: Partial<SettingsData>) => void;
  onLoginClick?: () => void;
}

type BonusAttemptResult = "correct" | "wrong";

function getStoredBonusAttemptResult(key: string): BonusAttemptResult | null {
  const stored = localStorage.getItem(key);
  return stored === "correct" || stored === "wrong" ? stored : null;
}

function getDevelopmentPreviewDayShift(): number {
  if (process.env.NODE_ENV !== "development") {
    return 0;
  }

  const requestedShift = Number(
    new URLSearchParams(window.location.search).get("previewDay")
  );

  return Number.isInteger(requestedShift) && requestedShift >= 0 && requestedShift <= 7
    ? requestedShift
    : 0;
}

export function Game({ settingsData, updateSettings, onLoginClick }: GameProps) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const userId = user?.id;
  const previewDayShift = getDevelopmentPreviewDayShift();
  const dayString = useMemo(
    () => getDayString(settingsData.shiftDayCount + previewDayShift),
    [previewDayShift, settingsData.shiftDayCount]
  );
  const gameDate = useMemo(
    () => DateTime.fromFormat(dayString, "yyyy-MM-dd"),
    [dayString]
  );
  const isFirstDayOfMonth = gameDate.day === 1;
  const previousMonthLabel = useMemo(
    () =>
      gameDate
        .minus({ months: 1 })
        .setLocale(i18n.resolvedLanguage)
        .toFormat("LLLL yyyy"),
    [gameDate, i18n.resolvedLanguage]
  );

  useNewsNotifications(dayString);

  const countryInputRef = useRef<HTMLInputElement>(null);

  const [
    todays,
    addGuess,
    randomImageNumber,
    randomAngle,
    imageScale,
    remoteDailyResult,
    audioSample,
  ] = useTodays(dayString);
  const { country, guesses } = todays;
  const isAudioDay = audioSample != null;
  const countryName = useMemo(
    () => (country ? getCountryName(i18n.resolvedLanguage, country) : ""),
    [country, i18n.resolvedLanguage]
  );
  const normalizedCountryName = sanitizeCountryName(countryName);

  let imageFilename = null;
  const start = new Date("2023-01-13");
  if (!isAudioDay && country != null && new Date() > start) {
    imageFilename =
      getCountryFilename(i18n.resolvedLanguage, country) +
      randomImageNumber +
      ".jpg";
  }

  const countryImageFolder = country
    ? `images/${srcImageFolder}/${country.code.toLowerCase()}`
    : null;
  const srcImage = countryImageFolder
    ? `${countryImageFolder}/${imageFilename ?? "mapa.png"}`
    : null;
  const mapImage = countryImageFolder ? `${countryImageFolder}/mapa.png` : null;

  const [currentGuess, setCurrentGuess] = useState("");
  const [hideImageMode, setHideImageMode] = useMode("hideImageMode", dayString, settingsData.noImageMode);
  const [rotationMode, setRotationMode] = useMode("rotationMode", dayString, settingsData.rotationMode);

  const [guessedShield, setGuessedShield] = useState(() => {
    const stored = localStorage.getItem(`guessedShield-${dayString}`);
    return stored ? JSON.parse(stored) : false;
  });
  const [guessedMap, setGuessedMap] = useState(() => {
    const stored = localStorage.getItem(`guessedMap-${dayString}`);
    return stored ? JSON.parse(stored) : false;
  });
  const shieldAttemptStorageKey = `shieldAttemptResult-${dayString}`;
  const [shieldAttemptResult, setShieldAttemptResult] =
    useState<BonusAttemptResult | null>(() =>
      getStoredBonusAttemptResult(shieldAttemptStorageKey)
    );

  const [monthlyLeaderboard, setMonthlyLeaderboard] = useState<MonthlyLeaderboardEntry[]>([]);
  const [previousMonthLeaderboard, setPreviousMonthLeaderboard] = useState<MonthlyLeaderboardEntry[]>([]);
  const [previousMonthLoading, setPreviousMonthLoading] = useState(false);
  const [championshipLoading, setChampionshipLoading] = useState(false);
  const lastChampionshipSyncKey = useRef<string | null>(null);
  const pendingChampionshipSync = useRef<{
    key: string;
    promise: ReturnType<typeof statsService.syncDailyResultToSupabase>;
  } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(`guessedShield-${dayString}`);
    setGuessedShield(stored ? JSON.parse(stored) : false);
    const storedMap = localStorage.getItem(`guessedMap-${dayString}`);
    setGuessedMap(storedMap ? JSON.parse(storedMap) : false);
    setShieldAttemptResult(getStoredBonusAttemptResult(`shieldAttemptResult-${dayString}`));
  }, [dayString]);

  useEffect(() => {
    localStorage.setItem(`guessedShield-${dayString}`, JSON.stringify(guessedShield));
  }, [guessedShield, dayString]);
  
  // Persist guessedMap in localStorage
  useEffect(() => {
    localStorage.setItem(`guessedMap-${dayString}`, JSON.stringify(guessedMap));
  }, [guessedMap, dayString]);

  useEffect(() => {
    if (shieldAttemptResult) {
      localStorage.setItem(shieldAttemptStorageKey, shieldAttemptResult);
    } else {
      localStorage.removeItem(shieldAttemptStorageKey);
    }
  }, [shieldAttemptResult, shieldAttemptStorageKey]);

  useEffect(() => {
    if (guessedShield && shieldAttemptResult !== "correct") {
      setShieldAttemptResult("correct");
    }
  }, [guessedShield, shieldAttemptResult]);

  useEffect(() => {
    let cancelled = false;

    async function fetchPreviousMonthLeaderboard() {
      if (!isFirstDayOfMonth) {
        setPreviousMonthLeaderboard([]);
        setPreviousMonthLoading(false);
        return;
      }

      setPreviousMonthLoading(true);
      const leaderboard = await statsService.getPreviousMonthlyLeaderboard(dayString);
      if (!cancelled) {
        setPreviousMonthLeaderboard(leaderboard);
        setPreviousMonthLoading(false);
      }
    }

    fetchPreviousMonthLeaderboard();

    return () => {
      cancelled = true;
    };
  }, [dayString, isFirstDayOfMonth]);

  const [showNewPhase, setShowNewPhase] = useState(false);
  const [hasParticipatedInNewPhase, setHasParticipatedInNewPhase] = useState(() => {
    const storedValue = localStorage.getItem(`hasParticipatedInNewPhase-${dayString}`);
    return storedValue ? JSON.parse(storedValue) : false;
  });

  const [showMapPhase, setShowMapPhase] = useState(false);
  const [hasParticipatedInMapPhase, setHasParticipatedInMapPhase] = useState(() => {
    const storedValue = localStorage.getItem(`hasParticipatedInMapPhase-${dayString}`);
    return storedValue ? JSON.parse(storedValue) : false;
  });

  useEffect(() => {
    const storedShieldAttempt = localStorage.getItem(`hasParticipatedInNewPhase-${dayString}`);
    setHasParticipatedInNewPhase(storedShieldAttempt ? JSON.parse(storedShieldAttempt) : false);
    const storedMapAttempt = localStorage.getItem(`hasParticipatedInMapPhase-${dayString}`);
    setHasParticipatedInMapPhase(storedMapAttempt ? JSON.parse(storedMapAttempt) : false);
  }, [dayString]);

  useEffect(() => {
    if (!remoteDailyResult || remoteDailyResult.game_date !== dayString) {
      return;
    }

    setGuessedShield(remoteDailyResult.shield_bonus);
    setGuessedMap(remoteDailyResult.map_bonus);

    if (remoteDailyResult.shield_bonus) {
      setHasParticipatedInNewPhase(true);
      setShieldAttemptResult("correct");
    }

    if (remoteDailyResult.map_bonus) {
      setHasParticipatedInMapPhase(true);
    }
  }, [dayString, remoteDailyResult]);

  const gameEnded =
    guesses.length === MAX_TRY_COUNT ||
    guesses[guesses.length - 1]?.distance === 0;

  const dailyScore = useMemo(
    () => calculateDailyScore(guesses, guessedShield, guessedMap),
    [guesses, guessedShield, guessedMap]
  );
  const shieldBonusAttempted =
    shieldAttemptResult != null || (hasParticipatedInNewPhase && guessedShield);

  useEffect(() => {
    let cancelled = false;

    async function syncChampionshipResult() {
      if (!gameEnded || guesses.length === 0) {
        return;
      }

      setChampionshipLoading(true);

      if (!userId) {
        try {
          const leaderboard = await statsService.getMonthlyLeaderboard(dayString, 100);
          if (!cancelled) {
            setMonthlyLeaderboard(leaderboard);
          }
        } finally {
          if (!cancelled) {
            setChampionshipLoading(false);
          }
        }
        return;
      }

      const syncKey = [
        userId,
        dayString,
        guesses.length,
        dailyScore.mainScore,
        dailyScore.bonusScore,
        dailyScore.totalScore,
        guessedShield ? 1 : 0,
        guessedMap ? 1 : 0,
      ].join(":");

      if (lastChampionshipSyncKey.current === syncKey) {
        try {
          const leaderboard = await statsService.getMonthlyLeaderboard(dayString, 100);
          if (!cancelled) {
            setMonthlyLeaderboard(leaderboard);
          }
        } finally {
          if (!cancelled) {
            setChampionshipLoading(false);
          }
        }
        return;
      }

      const syncPromise =
        pendingChampionshipSync.current?.key === syncKey
          ? pendingChampionshipSync.current.promise
          : statsService.syncDailyResultToSupabase(
              userId,
              dayString,
              guesses,
              guessedShield,
              guessedMap
            );

      if (pendingChampionshipSync.current?.key !== syncKey) {
        pendingChampionshipSync.current = {
          key: syncKey,
          promise: syncPromise,
        };
      }

      try {
        const syncedResult = await syncPromise;
        if (syncedResult) {
          lastChampionshipSyncKey.current = syncKey;
          if (!cancelled && syncedResult.shield_bonus && !guessedShield) {
            setGuessedShield(true);
          }
          if (!cancelled && syncedResult.map_bonus && !guessedMap) {
            setGuessedMap(true);
          }
        }

        if (cancelled) {
          return;
        }

        const leaderboard = await statsService.getMonthlyLeaderboard(dayString, 100);
        if (!cancelled) {
          setMonthlyLeaderboard(leaderboard);
        }
      } finally {
        if (pendingChampionshipSync.current?.key === syncKey) {
          pendingChampionshipSync.current = null;
        }
        if (!cancelled) {
          setChampionshipLoading(false);
        }
      }
    }

    syncChampionshipResult();

    return () => {
      cancelled = true;
    };
  }, [
    dailyScore.bonusScore,
    dailyScore.mainScore,
    dailyScore.totalScore,
    dayString,
    gameEnded,
    guessedMap,
    guessedShield,
    guesses,
    userId,
  ]);

  useEffect(() => {
    if (!userId) {
      setChampionshipLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (gameEnded && guesses[guesses.length - 1]?.distance === 0) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [gameEnded, guesses]);

  useEffect(() => {
    localStorage.setItem(`hasParticipatedInNewPhase-${dayString}`, JSON.stringify(hasParticipatedInNewPhase));
  }, [hasParticipatedInNewPhase, dayString]);

  useEffect(() => {
    localStorage.setItem(`hasParticipatedInMapPhase-${dayString}`, JSON.stringify(hasParticipatedInMapPhase));
  }, [hasParticipatedInMapPhase, dayString]);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      if (country == null) {
        return;
      }
      e.preventDefault();

      const guessedCountry = countries.find(
        (country) =>
          sanitizeCountryName(
            getCountryName(i18n.resolvedLanguage, country)
          ) === sanitizeCountryName(currentGuess)
      );

      if (guessedCountry == null) {
        toast.error(t("unknownCountry"));
        return;
      }

      const newGuess = {
        name: currentGuess,
        distance: geolib.getDistance(guessedCountry, country),
        direction: geolib.getCompassDirection(
          guessedCountry,
          country,
          (origin, dest) =>
            Math.round(geolib.getRhumbLineBearing(origin, dest) / 45) * 45
        ),
      };

      addGuess(newGuess);
      setCurrentGuess("");

      if (newGuess.distance === 0) {
        toast.success(t("welldone"), { delay: 2000 });
      }
    },
    [addGuess, country, currentGuess, i18n.resolvedLanguage, t]
  );

  useEffect(() => {
    let toastId: Id;
    const { country, guesses } = todays;
    if (
      country &&
      guesses.length === MAX_TRY_COUNT &&
      guesses[guesses.length - 1].distance > 0
    ) {
      toastId = toast.info(
        getCountryName(i18n.resolvedLanguage, country).toUpperCase() as ToastContent,
        {
          autoClose: false,
          delay: 2000,
        }
      );
    }

    return () => {
      if (toastId != null) {
        toast.dismiss(toastId);
      }
    };
  }, [todays, i18n.resolvedLanguage]);

  const handleMapPhaseTransition = () => {
    setShowNewPhase(false);
    setShowMapPhase(true);
  };

  const handleMapPhaseEnd = () => {
    setShowMapPhase(false);
  };

  const handleShieldGuess = (correct: boolean) => {
    setHasParticipatedInNewPhase(true);
    setShieldAttemptResult(correct ? "correct" : "wrong");
    if (correct) {
      setGuessedShield(true);
      toast.success(t("Parabéns, hoje ganhache o bónus!"));
    }
  };

  const handleMapGuess = (correct: boolean) => {
    setHasParticipatedInMapPhase(true);
    if (correct) {
      setGuessedMap(true);
      toast.success(t("Parabéns, mapa correto!"));
    }
  };

  return (
    <div className="flex-grow flex flex-col mx-2">
      { !showNewPhase && !showMapPhase ? (
        <>
          {isFirstDayOfMonth && (
            <PreviousMonthChampionshipScreen
              leaderboard={previousMonthLeaderboard}
              currentUserId={userId}
              loading={previousMonthLoading}
              monthLabel={previousMonthLabel}
              onLoginClick={onLoginClick}
            />
          )}
          {!isAudioDay && hideImageMode && !gameEnded && (
            <button
              className="font-bold border-2 p-1 rounded uppercase my-2 hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-slate-800 dark:active:bg-slate-700"
              type="button"
              onClick={() => setHideImageMode(false)}
            >
              <Twemoji text={t("showCountry") || ""} options={{ className: "inline-block" }} />
            </button>
          )}
          <div className="flex my-1">
            {audioSample ? (
              <div className="w-full">
                <AudioPilotPlayer sample={audioSample} />
              </div>
            ) : srcImage && mapImage ? (
              <img
                className={`pointer-events-none w-full h-auto m-auto transition-transform duration-700 ease-in ${hideImageMode && !gameEnded ? "hidden" : ""}`}
                alt="country to guess"
                src={srcImage}
                onError={({ currentTarget }) => {
                  currentTarget.onerror = null;
                  currentTarget.src = mapImage;
                }}
                style={
                  rotationMode && !gameEnded
                    ? {
                        transform: `rotate(${randomAngle}deg) scale(${imageScale})`,
                      }
                    : {}
                }
              />
            ) : null}
          </div>
          {!isAudioDay && rotationMode && !hideImageMode && !gameEnded && (
            <button
              className="font-bold rounded p-1 border-2 uppercase mb-2 hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-slate-800 dark:active:bg-slate-700"
              type="button"
              onClick={() => setRotationMode(false)}
            >
              <Twemoji text={t("cancelRotation") || ""} options={{ className: "inline-block" }} />
            </button>
          )}
          <Guesses
            targetCountry={country}
            rowCount={MAX_TRY_COUNT}
            guesses={guesses}
            countryInputRef={countryInputRef}
            settingsData={settingsData}
          />
          {gameEnded && country && audioSample && (
            <AudioSampleReveal
              sample={audioSample}
              countryName={countryName}
              won={dailyScore.won}
            />
          )}
          <div className="my-2">
            {gameEnded && country ? (
              <>
                <MonthlyChampionshipSummary
                  score={dailyScore}
                  leaderboard={monthlyLeaderboard}
                  currentUserId={userId}
                  loading={championshipLoading}
                  canPlayShieldBonus={dailyScore.won && !shieldBonusAttempted}
                  canPlayMapBonus={
                    dailyScore.won &&
                    shieldBonusAttempted &&
                    !hasParticipatedInMapPhase
                  }
                  onPlayShieldBonus={() => setShowNewPhase(true)}
                  onPlayMapBonus={() => setShowMapPhase(true)}
                  onLoginClick={onLoginClick}
                />
                <Share
                  guesses={guesses}
                  dayString={dayString}
                  settingsData={settingsData}
                  hideImageMode={hideImageMode}
                  rotationMode={rotationMode}
                  guessedShield={guessedShield}
                  guessedMap={guessedMap} // NEW prop passed to Share
                  dailyScore={dailyScore}
                  audioMode={isAudioDay}
                />
                <div className="flex justify-center mt-4">
                  <a
                    className="underline text-center mx-8"
                    href={`https://ibb.co/py0qRPT`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Twemoji text={t("🗺️ Mapa das Comarcas") || ""} options={{ className: "inline-block" }} />
                  </a>
                  {/* Add a check if the link exists before rendering */}
                  {!isAudioDay &&
                   listagemLigazons[normalizedCountryName] &&
                   listagemLigazons[normalizedCountryName][randomImageNumber] && (
                    <a
                      className="underline text-center mx-8"
                      href={listagemLigazons[normalizedCountryName][randomImageNumber]}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Twemoji text={t("🤔O que é esta imagem?") || ""} options={{ className: "inline-block" }} />
                    </a>
                  )}
                </div>
              </>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col">
                  <CountryInput
                    inputRef={countryInputRef}
                    currentGuess={currentGuess}
                    setCurrentGuess={setCurrentGuess}
                  />
                  <button
                    className="rounded font-bold p-1 flex items-center justify-center border-2 uppercase my-0.5 hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-slate-800 dark:active:bg-slate-700"
                    type="submit"
                  >
                    <Twemoji text="🌍" options={{ className: "inline-block" }} /> 
                    <span className="ml-1">{t("guess")}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </>
      ) : showNewPhase ? (
        country && (
          <NewPhase
            correctCountry={country.code}
            dayString={dayString}
            onGuessResult={handleShieldGuess}
            onPhaseEnd={handleMapPhaseTransition}
          />
        )
      ) : showMapPhase ? (
        country && (
          <MapPhase
            correctCountry={country.code}
            dayString={dayString}
            onPhaseEnd={handleMapPhaseEnd}
            onMapGuessResult={handleMapGuess}
          />
        )
      ) : null }
    </div>
  );
}
