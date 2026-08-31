import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  getMunicipalitiesForComarca,
  getMunicipalityBonusOptions,
  isMunicipalitySelectionCorrect,
  normalizeMunicipalityName,
} from "../domain/comarcaMunicipalities";
import { galicianCountryNamesChanga } from "../domain/comarcas.name.co";

interface MunicipalitiesPhaseProps {
  correctCountry: string;
  dayString: string;
  onGuessResult: (correct: boolean) => void;
  onPhaseEnd: () => void;
}

export function MunicipalitiesPhase({
  correctCountry,
  dayString,
  onGuessResult,
  onPhaseEnd,
}: MunicipalitiesPhaseProps) {
  const { t } = useTranslation();
  const municipalities = useMemo(
    () => getMunicipalitiesForComarca(correctCountry),
    [correctCountry]
  );
  const options = useMemo(
    () => getMunicipalityBonusOptions(correctCountry, dayString),
    [correctCountry, dayString]
  );
  const correctNames = useMemo(
    () => new Set(municipalities.map(normalizeMunicipalityName)),
    [municipalities]
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState<boolean | null>(null);
  const comarcaName =
    galicianCountryNamesChanga[correctCountry]?.nomeI18n ?? correctCountry;

  const toggleMunicipality = (municipality: string) => {
    if (result != null) {
      return;
    }

    setSelected((current) => {
      if (current.includes(municipality)) {
        return current.filter((name) => name !== municipality);
      }

      if (current.length >= municipalities.length) {
        return current;
      }

      return [...current, municipality];
    });
  };

  const submitSelection = () => {
    if (selected.length !== municipalities.length || result != null) {
      return;
    }

    const correct = isMunicipalitySelectionCorrect(correctCountry, selected);
    setResult(correct);
    onGuessResult(correct);
  };

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col items-center rounded-2xl border-2 border-blue-200 bg-blue-50 p-4 text-blue-950 shadow-sm dark:border-blue-800 dark:bg-slate-800 dark:text-blue-50">
      <p className="text-xs font-bold uppercase tracking-widest text-blue-700 dark:text-blue-300">
        {t("municipalitiesBonus.kicker")}
      </p>
      <h2 className="mt-1 text-center text-2xl font-extrabold">
        {t("municipalitiesBonus.title")}
      </h2>
      <p className="mt-2 text-center text-sm">
        {t("municipalitiesBonus.prompt", {
          comarca: comarcaName,
          count: municipalities.length,
        })}
      </p>
      <p className="mt-3 rounded-full bg-white px-3 py-1 text-sm font-bold dark:bg-slate-900">
        {t("municipalitiesBonus.selected", {
          selected: selected.length,
          count: municipalities.length,
        })}
      </p>

      <div className="mt-4 grid max-h-96 w-full grid-cols-2 gap-2 overflow-y-auto pr-1">
        {options.map((municipality) => {
          const isSelected = selected.includes(municipality);
          const isCorrect = correctNames.has(
            normalizeMunicipalityName(municipality)
          );
          const resultClass =
            result == null
              ? isSelected
                ? "border-blue-700 bg-blue-700 text-white"
                : "border-blue-200 bg-white hover:border-blue-500 dark:border-slate-600 dark:bg-slate-900"
              : isCorrect
              ? "border-green-600 bg-green-600 text-white"
              : isSelected
              ? "border-red-600 bg-red-600 text-white"
              : "border-gray-200 bg-gray-100 opacity-60 dark:border-slate-700 dark:bg-slate-900";

          return (
            <button
              key={municipality}
              type="button"
              aria-pressed={isSelected}
              disabled={result != null}
              onClick={() => toggleMunicipality(municipality)}
              className={`min-h-[3rem] rounded-lg border-2 px-2 py-2 text-sm font-bold transition ${resultClass}`}
            >
              {municipality}
            </button>
          );
        })}
      </div>

      {result != null && (
        <p
          className={`mt-4 text-center text-lg font-bold ${
            result ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
          }`}
        >
          {result
            ? t("municipalitiesBonus.correct")
            : t("municipalitiesBonus.wrong")}
        </p>
      )}

      {result == null ? (
        <div className="mt-4 grid w-full grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onPhaseEnd}
            className="rounded border-2 border-blue-700 px-4 py-2 font-bold uppercase text-blue-800 hover:bg-blue-100 dark:text-blue-200 dark:hover:bg-slate-700"
          >
            {t("municipalitiesBonus.back")}
          </button>
          <button
            type="button"
            onClick={submitSelection}
            disabled={selected.length !== municipalities.length}
            className="rounded bg-green-600 px-4 py-2 font-bold uppercase text-white hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("municipalitiesBonus.submit")}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onPhaseEnd}
          className="mt-4 w-full rounded bg-blue-700 px-4 py-2 font-bold uppercase text-white hover:bg-blue-600"
        >
          {t("municipalitiesBonus.returnToGame")}
        </button>
      )}
    </section>
  );
}
