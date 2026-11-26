import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import Modal from "react-modal";
import mapPreview from "../assets/comarcas-recorte.webp";
import "./PostGameGuide.css";

const MAP_URL = "/maps/mapa-das-comarcas.html";

interface PostGameGuideProps {
  countryName: string;
  photoUrl: string | null;
  clueUrl?: string;
  isAudioDay: boolean;
  isOpen: boolean;
  onDismiss: (hideForFutureGames: boolean) => void;
}

export function PostGameGuide({
  countryName,
  photoUrl,
  clueUrl,
  isAudioDay,
  isOpen,
  onDismiss,
}: PostGameGuideProps) {
  const { t } = useTranslation();
  const resultLinks = useRef<HTMLElement>(null);
  const titleLead = t("postGame.titleLead");
  const clueLabel = t(isAudioDay ? "postGame.recording" : "postGame.image");
  const mapLabel = t("postGame.map");

  return (
    <>
      <nav ref={resultLinks} aria-label={t("postGame.resources")} className="my-3">
        {!isAudioDay && <h2 className="mb-2 text-lg font-bold">{titleLead} {countryName}</h2>}
        <div className="grid gap-2 sm:grid-cols-2">
          {[{ href: clueUrl, label: clueLabel }, { href: MAP_URL, label: mapLabel }].map(
            ({ href, label }) => href && (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="block min-h-[44px] rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-blue-800 hover:bg-blue-50 dark:border-slate-600 dark:bg-slate-800 dark:text-blue-200 dark:hover:bg-slate-700"
              >
                <span className="underline underline-offset-2">{label}</span>
                <span aria-hidden="true"> ↗</span>
              </a>
            )
          )}
        </div>
      </nav>
      <Modal
        isOpen={isOpen}
        appElement={document.getElementById("root") ?? undefined}
        aria={{ labelledby: "post-game-title" }}
        onRequestClose={() => onDismiss(false)}
        onAfterClose={() => resultLinks.current?.querySelector("a")?.focus()}
        htmlOpenClassName="overflow-hidden"
        overlayClassName="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm sm:p-5"
        className="max-h-full w-full max-w-[34rem] overflow-y-auto overscroll-contain rounded-2xl bg-[#faf8f2] text-[#193739] shadow-2xl ring-1 ring-white/20 dark:bg-[#192c30] dark:text-stone-50"
      >
        <header className="post-game-cover relative isolate flex flex-col items-start justify-end overflow-hidden px-5 py-5 text-white sm:px-7 sm:py-6">
          {photoUrl && (
            <img
              src={photoUrl}
              alt=""
              className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
              onError={({ currentTarget }) => { currentTarget.hidden = true; }}
            />
          )}
          <h2 id="post-game-title">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em]">
              <span aria-hidden="true" className="h-0.5 w-6 bg-[#ff9b78]" />
              {titleLead}
            </span>{" "}
            <span className="post-game-place mt-1 block">{countryName}</span>
          </h2>
          {clueUrl && (
            <a
              href={clueUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-[44px] items-center gap-2.5 rounded-full bg-[#fffaf0] px-4 py-2 text-sm font-bold text-[#173a3c] shadow-sm after:absolute after:inset-0 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              {isAudioDay && <span aria-hidden="true" className="post-game-sound-mark" />}
              {clueLabel}
              <span aria-hidden="true" className="text-base">↗</span>
            </a>
          )}
        </header>

        <div className="px-4 sm:px-6">
          <a
            href={MAP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group my-4 flex min-h-[6.25rem] items-stretch overflow-hidden rounded-xl border border-[#d0d8ce] bg-[#eef2e9] hover:border-[#779984] focus-visible:outline-teal-700 dark:border-[#44615c] dark:bg-[#253e3e] dark:hover:border-[#8ea99c] sm:my-5"
          >
            <span className="post-game-map-crop relative w-[33%] shrink-0 overflow-hidden">
              <img src={mapPreview} alt="" width={420} height={318}
                className="absolute inset-0 h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105"
              />
            </span>
            <span className="flex flex-1 flex-col justify-center gap-1 px-3 py-3 sm:px-4">
              <span className="text-base font-bold leading-tight sm:text-lg">{mapLabel}</span>
              <span className="text-sm leading-snug text-[#49615a] dark:text-[#c9dbd3]">{t("postGame.mapHint")}</span>
            </span>
            <span aria-hidden="true" className="mr-3 self-center text-xl text-[#305f52] dark:text-[#cee9da] sm:mr-4">↗</span>
          </a>
          <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-[#dcded3] py-2.5 dark:border-[#3b5452] sm:py-3">
            <button
              type="button"
              className="min-h-[44px] rounded px-1 text-sm text-[#526461] underline decoration-[#9ba9a2] underline-offset-4 hover:text-[#142f31] dark:text-[#c4d1cb] dark:hover:text-white"
              onClick={() => onDismiss(true)}
            >
              {t("postGame.hide")}
            </button>
            <button
              type="button"
              className="min-h-[44px] rounded-full bg-[#21494a] px-6 text-sm font-bold text-white hover:bg-[#133a3b] dark:bg-[#d6e8db] dark:text-[#15393a] dark:hover:bg-white"
              onClick={() => onDismiss(false)}
            >
              {t("postGame.close")}
            </button>
          </footer>
        </div>
      </Modal>
    </>
  );
}
