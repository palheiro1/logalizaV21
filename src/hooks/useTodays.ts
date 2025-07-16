import { DateTime } from "luxon";
import { useCallback, useEffect, useMemo, useState } from "react";
import seedrandom from "seedrandom";
import { getNewForcedCountryCode, getNewRandomImageNumber, getShowNewGame } from "../App";
import { Country } from "../domain/countries";
import { countriesI } from "../domain/countries.position";
import { Guess, loadAllGuesses, saveGuesses } from "../domain/guess";
import { areas, bigEnoughCountriesWithImage, countriesWithImage, smallCountryLimit } from './../environment';
import { forcedCountries, randomNumber } from "./forcedLead";
import { useAuth } from "../contexts/AuthContext";
import { statsService } from "../services/statsService";
import { getStatsData } from "../domain/stats";

// Safe hook that handles auth context not being available
function useSafeAuth() {
  try {
    return useAuth();
  } catch (error) {
    // Return null user if AuthProvider is not available
    return { user: null };
  }
}

const noRepeatStartDate = DateTime.fromFormat("2022-05-01", "yyyy-MM-dd");

export function getDayString(shiftDayCount?: number) {
  return DateTime.now()
    .plus({ days: shiftDayCount ?? 0 })
    .toFormat("yyyy-MM-dd");
}

export function useTodays(dayString: string): [
  {
    country?: Country;
    guesses: Guess[];
  },
  (guess: Guess) => void,
  number,
  number,
  number
] {
  const { user } = useSafeAuth();
  const [todays, setTodays] = useState<{
    country?: Country;
    guesses: Guess[];
  }>({ guesses: [] });

  const addGuess = useCallback(
    async (newGuess: Guess) => {
      if (todays == null) {
        return;
      }

      const newGuesses = [...todays.guesses, newGuess];

      setTodays((prev) => ({ country: prev.country, guesses: newGuesses }));
      saveGuesses(dayString, newGuesses);

      // Sync stats to Supabase when game is completed (won or max tries reached)
      // Only if user is logged in
      if (user) {
        const isGameCompleted = newGuess.distance === 0 || newGuesses.length >= 4; // MAX_TRY_COUNT = 4
        if (isGameCompleted) {
          try {
            console.log('useTodays: Game completed, syncing stats to Supabase...');
            const currentStats = getStatsData();
            await statsService.syncStatsToSupabase(user.id, currentStats);
            console.log('useTodays: Stats synced successfully');
          } catch (error) {
            console.error('useTodays: Error syncing stats to Supabase:', error);
          }
        }
      }
    },
    [dayString, todays, user]
  );

  useEffect(() => {
    const guesses = loadAllGuesses()[dayString] ?? [];
    const country = getCountry(dayString);

    setTodays({ country, guesses });
  }, [dayString]);

  const randomAngle = useMemo(
    () => seedrandom.alea(dayString)() * 360,
    [dayString]
  );

  const imageScale = useMemo(() => {
    const normalizedAngle = 45 - (randomAngle % 90);
    const radianAngle = (normalizedAngle * Math.PI) / 180;
    return 1 / (Math.cos(radianAngle) * Math.sqrt(2));
  }, [randomAngle]);

  const randomImageNumber = getRandomImageNumber();
  console.log(randomImageNumber);

  return [todays, addGuess, randomImageNumber, randomAngle, imageScale];
}


function randomWithSeed(seed: number) {
  // Gerador de números pseudoaleatórios baseado na semente (congruente simples)
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getDaySeed() {
  // Obtenha a data atual
  const today = new Date();
  // Cria uma semente baseada no ano, mês e dia (ignorando horas, minutos e segundos)
  const seed =     today.getFullYear() * 10000000000 +   // Ano
  (today.getMonth() + 1) * 100000000 +  // Mês
  today.getDate() * 1000000        // Dia
  return seed;
}

function getRandomImageNumber() {
  // Obtenha a semente para o dia atual
  const seed = getDaySeed();
  // Gere um número pseudoaleatório entre 0 e 1 com a semente
  const random = randomWithSeed(seed);
  // Escale o número aleatório para estar entre 2 e 6
  return Math.floor(random * 5) + 2;
}

function getCountry(dayString: string) {
  const currentDayDate = DateTime.fromFormat(dayString, "yyyy-MM-dd");
  let pickingDate = DateTime.fromFormat("2022-03-21", "yyyy-MM-dd");
  let smallCountryCooldown = 0;
  let pickedCountry: Country | null = null;

  const lastPickDates: Record<string, DateTime> = {};

  do {
    smallCountryCooldown--;

    const pickingDateString = pickingDate.toFormat("yyyy-MM-dd");
    let forcedCountryCode = forcedCountries[dayString];

    const showNewGame = getShowNewGame();
    if (showNewGame || !forcedCountryCode) {
      forcedCountryCode = getNewForcedCountryCode();
    }

    const forcedCountry =
      forcedCountryCode != null
        ? countriesWithImage.find(
          (country: countriesI) => country.code === forcedCountryCode
          )
        : undefined;

    const countrySelection =
      smallCountryCooldown < 0
        ? countriesWithImage
        : bigEnoughCountriesWithImage;

    if (forcedCountry != null) {
      pickedCountry = forcedCountry;
    } else {
      let countryIndex = Math.floor(
        seedrandom.alea(pickingDateString)() * countrySelection.length
      );
      pickedCountry = countrySelection[countryIndex];

      if (pickingDate >= noRepeatStartDate) {
        while (isARepeat(pickedCountry, lastPickDates, pickingDate)) {
          countryIndex = (countryIndex + 1) % countrySelection.length;
          pickedCountry = countrySelection[countryIndex];
        }
      }
    }

    if (areas[pickedCountry!.code] < smallCountryLimit) {
      smallCountryCooldown = 7;
    }


    lastPickDates[pickedCountry!.code] = pickingDate;
    pickingDate = pickingDate.plus({ day: 1 });
  } while (pickingDate <= currentDayDate);

  return pickedCountry!;
}

function isARepeat(
  pickedCountry: Country | null,
  lastPickDates: Record<string, DateTime>,
  pickingDate: DateTime
) {
  if (pickedCountry == null || lastPickDates[pickedCountry.code] == null) {
    return false;
  }
  const daysSinceLastPick = pickingDate.diff(
    lastPickDates[pickedCountry.code],
    "day"
  ).days;

  return daysSinceLastPick < 100;
}