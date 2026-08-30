import confetti from "canvas-confetti";
import * as geolib from "geolib";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Twemoji } from "react-emoji-render";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  Country,
  getCountryName,
  sanitizeCountryName,
} from "../domain/countries";
import { Guess } from "../domain/guess";
import { audioSamples, getAudioSampleById } from "../domain/audioSamples";
import { MAX_TRY_COUNT } from "../domain/scoring";
import { countries } from "../environment";
import { SettingsData } from "../hooks/useSettings";
import { AudioPilotPlayer } from "./AudioPilotPlayer";
import { AudioSampleReveal } from "./AudioSampleReveal";
import { CountryInput } from "./CountryInput";
import { Guesses } from "./Guesses";

interface AudioPilotGameProps {
  settingsData: SettingsData;
}

const STORAGE_KEY = "audioPilotGuesses";

function getInitialSampleIndex(): number {
  const requestedId = new URLSearchParams(window.location.search).get(
    "amostra"
  );
  const requestedSample = getAudioSampleById(requestedId);
  return requestedSample ? audioSamples.indexOf(requestedSample) : 0;
}

function loadPilotGuesses(sampleId: string): Guess[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return [];
    }

    const allGuesses = JSON.parse(saved) as Record<string, Guess[]>;
    return Array.isArray(allGuesses[sampleId]) ? allGuesses[sampleId] : [];
  } catch (_error) {
    return [];
  }
}

function savePilotGuesses(sampleId: string, guesses: Guess[]) {
  let allGuesses: Record<string, Guess[]> = {};

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    allGuesses = saved ? JSON.parse(saved) : {};
  } catch (_error) {
    allGuesses = {};
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...allGuesses,
      [sampleId]: guesses,
    })
  );
}

function updateSampleInUrl(sampleId: string) {
  const url = new URL(window.location.href);
  url.searchParams.set("piloto", "audio");
  url.searchParams.set("amostra", sampleId);
  window.history.replaceState({}, "", url.toString());
}

export function isAudioPilotMode(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return new URLSearchParams(window.location.search).get("piloto") === "audio";
}

export function AudioPilotGame({ settingsData }: AudioPilotGameProps) {
  const { t, i18n } = useTranslation();
  const countryInputRef = useRef<HTMLInputElement>(null);
  const [sampleIndex, setSampleIndex] = useState(getInitialSampleIndex);
  const sample = audioSamples[sampleIndex];
  const country = useMemo(
    () =>
      countries.find(({ code }) => code === sample.comarcaCode) as
        | Country
        | undefined,
    [sample.comarcaCode]
  );
  const countryName = country
    ? getCountryName(i18n.resolvedLanguage, country)
    : "";
  const [guesses, setGuesses] = useState<Guess[]>(() =>
    loadPilotGuesses(sample.id)
  );
  const [currentGuess, setCurrentGuess] = useState("");

  useEffect(() => {
    setGuesses(loadPilotGuesses(sample.id));
    setCurrentGuess("");
    updateSampleInUrl(sample.id);
  }, [sample.id]);

  const gameEnded =
    guesses.length >= MAX_TRY_COUNT ||
    guesses[guesses.length - 1]?.distance === 0;
  const won = guesses[guesses.length - 1]?.distance === 0;

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!country || gameEnded) {
        return;
      }

      const guessedCountry = countries.find(
        (candidate) =>
          sanitizeCountryName(
            getCountryName(i18n.resolvedLanguage, candidate)
          ) === sanitizeCountryName(currentGuess)
      );

      if (!guessedCountry) {
        toast.error(t("unknownCountry"));
        return;
      }

      const newGuess: Guess = {
        name: currentGuess,
        distance: geolib.getDistance(guessedCountry, country),
        direction: geolib.getCompassDirection(
          guessedCountry,
          country,
          (origin, destination) =>
            Math.round(geolib.getRhumbLineBearing(origin, destination) / 45) *
            45
        ),
      };
      const nextGuesses = [...guesses, newGuess];

      setGuesses(nextGuesses);
      savePilotGuesses(sample.id, nextGuesses);
      setCurrentGuess("");

      if (newGuess.distance === 0) {
        toast.success(t("welldone"));
        confetti({ particleCount: 80, spread: 65, origin: { y: 0.6 } });
      }
    },
    [
      country,
      currentGuess,
      gameEnded,
      guesses,
      i18n.resolvedLanguage,
      sample.id,
      t,
    ]
  );

  const moveToSample = (nextIndex: number) => {
    setSampleIndex((nextIndex + audioSamples.length) % audioSamples.length);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetSample = () => {
    setGuesses([]);
    savePilotGuesses(sample.id, []);
    setCurrentGuess("");
  };

  return (
    <main className="mx-2 flex flex-grow flex-col">
      <div className="mt-4 flex items-center justify-between">
        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-800 dark:bg-red-950 dark:text-red-200">
          Piloto sonoro
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Amostra {sampleIndex + 1} de {audioSamples.length}
        </span>
      </div>

      <h2 className="mt-4 text-center text-2xl font-extrabold">
        De que comarca é esta voz?
      </h2>
      <p className="mx-auto mt-2 max-w-md text-center text-sm text-gray-600 dark:text-gray-300">
        Escuita a fala e procura o sotaque, a entoaçom e os traços dialectais.
        Tens quatro tentativas.
      </p>

      <AudioPilotPlayer key={sample.id} sample={sample} />

      <Guesses
        targetCountry={country}
        rowCount={MAX_TRY_COUNT}
        guesses={guesses}
        countryInputRef={countryInputRef}
        settingsData={settingsData}
      />

      <div className="my-2">
        {!gameEnded ? (
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col">
              <CountryInput
                inputRef={countryInputRef}
                currentGuess={currentGuess}
                setCurrentGuess={setCurrentGuess}
              />
              <button
                className="my-0.5 flex items-center justify-center rounded border-2 p-1 font-bold uppercase hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-slate-800 dark:active:bg-slate-700"
                type="submit"
              >
                <Twemoji text="🎙️" options={{ className: "inline-block" }} />
                <span className="ml-1">{t("guess")}</span>
              </button>
            </div>
          </form>
        ) : (
          <AudioSampleReveal
            sample={sample}
            countryName={countryName}
            won={won}
          />
        )}
      </div>

      {gameEnded && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            className="rounded border-2 p-2 font-bold hover:bg-gray-50 dark:hover:bg-slate-800"
            onClick={() => moveToSample(sampleIndex - 1)}
          >
            ← Anterior
          </button>
          <button
            type="button"
            className="rounded border-2 p-2 font-bold hover:bg-gray-50 dark:hover:bg-slate-800"
            onClick={() => moveToSample(sampleIndex + 1)}
          >
            Seguinte →
          </button>
          <button
            type="button"
            className="col-span-2 rounded p-2 text-sm underline"
            onClick={resetSample}
          >
            Recomeçar esta amostra
          </button>
        </div>
      )}

      <a
        className="my-5 text-center text-sm underline"
        href={window.location.pathname}
      >
        Voltar ao LoGaliza clássico
      </a>
    </main>
  );
}
