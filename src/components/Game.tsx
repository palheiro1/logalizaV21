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

const MAX_TRY_COUNT = 4;

interface GameProps {
  settingsData: SettingsData;
  updateSettings: (newSettings: Partial<SettingsData>) => void;
}

export function Game({ settingsData, updateSettings }: GameProps) {
  const { t, i18n } = useTranslation();
  const dayString = useMemo(() => getDayString(settingsData.shiftDayCount), [settingsData.shiftDayCount]);

  useNewsNotifications(dayString);

  const countryInputRef = useRef<HTMLInputElement>(null);

  const [todays, addGuess, randomImageNumber, randomAngle, imageScale] = useTodays(dayString);
  const { country, guesses } = todays;
  const countryName = useMemo(
    () => (country ? getCountryName(i18n.resolvedLanguage, country) : ""),
    [country, i18n.resolvedLanguage]
  );
  const normalizedCountryName = sanitizeCountryName(countryName);
  console.log(normalizedCountryName);

  let imageFilename = null;
  const start = new Date("2023-01-13");
  if (country != null && new Date() > start) {
    imageFilename =
      getCountryFilename(i18n.resolvedLanguage, country) +
      randomImageNumber +
      ".jpg";
  }

  const srcImage = `images/${srcImageFolder}/${country?.code.toLowerCase()}/${imageFilename ?? "mapa.png"}`;
  const mapImage = `images/${srcImageFolder}/${country?.code.toLowerCase()}/${"mapa.png"}`;

  const [currentGuess, setCurrentGuess] = useState("");
  const [hideImageMode, setHideImageMode] = useMode("hideImageMode", dayString, settingsData.noImageMode);
  const [rotationMode, setRotationMode] = useMode("rotationMode", dayString, settingsData.rotationMode);

  const [guessedShield, setGuessedShield] = useState(false);
  const [guessedMap, setGuessedMap] = useState(() => {
    const stored = localStorage.getItem(`guessedMap-${dayString}`);
    return stored ? JSON.parse(stored) : false;
  });
  
  // Persist guessedMap in localStorage
  useEffect(() => {
    localStorage.setItem(`guessedMap-${dayString}`, JSON.stringify(guessedMap));
  }, [guessedMap, dayString]);

  const [showNewPhase, setShowNewPhase] = useState(false);
  const [hasParticipatedInNewPhase, setHasParticipatedInNewPhase] = useState(() => {
    const storedValue = localStorage.getItem(`hasParticipatedInNewPhase-${dayString}`);
    return storedValue ? JSON.parse(storedValue) : false;
  });

  const [showMapPhase, setShowMapPhase] = useState(false);

  const gameEnded =
    guesses.length === MAX_TRY_COUNT ||
    guesses[guesses.length - 1]?.distance === 0;

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
    setHasParticipatedInNewPhase(true);
    setShowMapPhase(true);
  };

  const handleMapPhaseEnd = () => {
    setShowMapPhase(false);
  };

  const handleCorrectGuess = () => {
    setGuessedShield(true);
    toast.success(t("Parabéns, hoje ganhache o bónus!"));
  };

  // NEW: Callback when map is correctly guessed
  const handleMapCorrect = () => {
    setGuessedMap(true);
    toast.success(t("Parabéns, mapa correto!"));
  };

  return (
    <div className="flex-grow flex flex-col mx-2">
      { !showNewPhase && !showMapPhase ? (
        <>
          {hideImageMode && !gameEnded && (
            <button
              className="font-bold border-2 p-1 rounded uppercase my-2 hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-slate-800 dark:active:bg-slate-700"
              type="button"
              onClick={() => setHideImageMode(false)}
            >
              <Twemoji text={t("showCountry") || ""} options={{ className: "inline-block" }} />
            </button>
          )}
          <div className="flex my-1">
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
          </div>
          {rotationMode && !hideImageMode && !gameEnded && (
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
          <div className="my-2">
            {gameEnded && country ? (
              <>
                {!hasParticipatedInNewPhase && (
                  <button
                    className="w-full bg-green-500 text-white font-bold py-2 px-4 rounded mb-2"
                    type="button"
                    onClick={() => setShowNewPhase(true)}
                  >
                    {t("BÓNUS DO ESCUDO")}
                  </button>
                )}
                <Share
                  guesses={guesses}
                  dayString={dayString}
                  settingsData={settingsData}
                  hideImageMode={hideImageMode}
                  rotationMode={rotationMode}
                  guessedShield={guessedShield}
                  guessedMap={guessedMap} // NEW prop passed to Share
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
                  {listagemLigazons[normalizedCountryName] && 
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
            onCorrectGuess={handleCorrectGuess} 
            onPhaseEnd={handleMapPhaseTransition}
          />
        )
      ) : showMapPhase ? (
        country && (
          <MapPhase 
            correctCountry={country.code} 
            onPhaseEnd={handleMapPhaseEnd}
            onMapCorrect={handleMapCorrect} // NEW: Pass callback for correct map guess
          />
        )
      ) : null }
    </div>
  );
}