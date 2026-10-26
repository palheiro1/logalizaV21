import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppInstall } from "../hooks/useAppInstall";

export function AppInstallBanner() {
  const { t } = useTranslation();
  const { visible, mode, isInstalling, install, dismiss } = useAppInstall();
  const [instructionsOpen, setInstructionsOpen] = useState(false);

  if (!visible) {
    return null;
  }

  const manual = mode !== "native";
  const instructionsKey = mode === "ios" ? "ios" : "android";

  function handleDismiss() {
    setInstructionsOpen(false);
    dismiss();
  }

  return (
    <section
      aria-labelledby="app-install-title"
      className="mx-2 mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
    >
      <h2 id="app-install-title" className="text-base font-bold">
        {t("install.offerTitle")}
      </h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        {t("install.offerDescription")}
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {manual ? (
          <button
            type="button"
            aria-expanded={instructionsOpen}
            aria-controls="app-install-instructions"
            onClick={() => setInstructionsOpen((open) => !open)}
            className="min-h-[44px] rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-white hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 dark:focus-visible:outline-red-400"
          >
            {t("install.howToInstall")}
          </button>
        ) : (
          <button
            type="button"
            disabled={isInstalling}
            onClick={() => void install()}
            className="min-h-[44px] rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-white hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-wait disabled:opacity-60 dark:focus-visible:outline-red-400"
          >
            {t(
              isInstalling
                ? "install.openingPrompt"
                : "install.instructionActionInstall"
            )}
          </button>
        )}
        <button
          type="button"
          onClick={handleDismiss}
          className="min-h-[44px] rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:focus-visible:outline-slate-300"
        >
          {t("install.notNow")}
        </button>
      </div>

      {manual && (
        <div
          id="app-install-instructions"
          hidden={!instructionsOpen}
          className="mt-3 border-t border-slate-200 pt-3 text-sm dark:border-slate-600"
        >
          <h3 className="font-semibold">{t("install.instructionTitle")}</h3>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>{t(`install.${instructionsKey}Step1`)}</li>
            <li>{t(`install.${instructionsKey}Step2`)}</li>
            <li>{t(`install.${instructionsKey}Step3`)}</li>
          </ol>
          <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            {t(`install.${instructionsKey}Help`)}
          </p>
        </div>
      )}
    </section>
  );
}
