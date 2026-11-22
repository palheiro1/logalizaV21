import React, { useEffect, useRef, useState } from "react";
import { configureAnalytics } from "../lib/analyticsProviders";
import { browserOptsOut, Consent, consentKey, readConsent, saveConsent } from "../lib/gameAnalytics";

export function AnalyticsPreferences() {
  const [choice, setChoice] = useState(readConsent);
  const disclosure = useRef<HTMLDetailsElement>(null);
  const summary = useRef<HTMLElement>(null);
  useEffect(() => {
    function sync(event: StorageEvent) {
      if (event.key !== consentKey && event.key !== null) return;
      setChoice(readConsent());
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  function choose(value: Consent) {
    saveConsent(value);
    configureAnalytics();
    setChoice(readConsent());
    if (disclosure.current) disclosure.current.open = false;
    summary.current?.focus();
  }

  return (
    <details ref={disclosure} open={choice === null} className="my-4 rounded border border-gray-200 px-3 py-2 text-sm dark:border-gray-700">
      <summary ref={summary} className="cursor-pointer font-semibold">Privacidade e estatísticas</summary>
      <p className="mt-2">
        Se aceitares, o Vercel conta as partidas começadas e terminadas, as tentativas e a rede de origem.
        O Google Analytics mede visitas. Podes mudar de escolha aqui e jogar em ambos os casos.
      </p>
      {browserOptsOut() ? (
        <p className="mt-2">O teu navegador pediu privacidade. As estatísticas opcionais estám desativadas.</p>
      ) : (
        <>
          {choice && <p className="mt-2">Estatísticas {choice === "granted" ? "ativadas" : "desativadas"}.</p>}
          <div className="mt-2 flex flex-wrap gap-2">
            {(["granted", "denied"] as const).map(value => (
              <button key={value} type="button" onClick={() => choose(value)}
                className="rounded border border-current px-3 py-1.5 font-medium focus-visible:outline-offset-2">
                {value === "granted" ? "Aceitar" : "Recusar"}
              </button>
            ))}
          </div>
        </>
      )}
    </details>
  );
}
