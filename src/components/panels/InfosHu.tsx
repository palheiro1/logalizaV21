import { Guesses } from "../Guesses";
import { Panel } from "./Panel";
import React from "react";
import { Worldle } from "../Worldle";
import { formatDistance } from "../../domain/geography";
import { SettingsData } from "../../hooks/useSettings";
import { Twemoji } from "react-emoji-render";

interface InfosProps {
  isOpen: boolean;
  close: () => void;
  settingsData: SettingsData;
}

export function InfosHu({ isOpen, close, settingsData }: InfosProps) {
  return (
    <Panel title="Hogyan játssz?" isOpen={isOpen} close={close}>
      <div className="space-y-3 text-justify border-b-2 border-gray-200 pb-3 mb-3">
        <div>
          {" "}
          Találd ki a napi <Worldle />
          -t 6 próbálkozásból.
        </div>
        <div>
          Minden próbálkozásodnak egy valódi országnak, térségnek kell lennie.
        </div>
        <div>
          Minden tipp után megkapod a távolságot, az ország irányát, és a tipp
          közelségét jelző százalékot.
        </div>
      </div>
      <div className="space-y-3 text-justify border-b-2 border-gray-200 pb-3 mb-3">
        <div className="font-bold">Példák</div>
        <div>
          <Guesses
            rowCount={1}
            guesses={[
              {
                name: "Chile",
                direction: "NE",
                distance: 13_557_000,
              },
            ]}
            settingsData={settingsData}
          />
          <div className="my-2">
            A tipped, <span className="uppercase font-bold">Chile</span>{" "}
            {formatDistance(13_557_000, settingsData.distanceUnit)}-re van a
            céltól, mely a tippedtől Észak-Keletre-fekszik, de csak 32%-os a
            tipp, mivel elég messzire tippeltél.
          </div>
        </div>
        <div>
          <Guesses
            rowCount={1}
            guesses={[
              {
                name: "Finnország",
                direction: "SE",
                distance: 3_206_000,
              },
            ]}
            settingsData={settingsData}
          />
          <div className="my-2">
            Második tipped{" "}
            <span className="uppercase font-bold">Finnország</span> már közelebb
            van! A megoldás{" "}
            {formatDistance(3_206_000, settingsData.distanceUnit)}-re,
            Dél-Keletre van, ez egy 83%-os megoldás.
          </div>
        </div>
        <div>
          <Guesses
            rowCount={1}
            guesses={[
              {
                name: "Libanon",
                direction: "N",
                distance: 0,
              },
            ]}
            settingsData={settingsData}
          />
          <div className="my-2">
            Következő próbálkozás{" "}
            <span className="uppercase font-bold">Libanon</span>, a kitalálandó
            ország! Szép munka!{" "}
            <Twemoji text="🎉" options={{ className: "inline-block" }} />
          </div>
        </div>
      </div>
      <div className="space-y-3 text-justify border-b-2 border-gray-200 pb-3 mb-3 font-bold">
        Minden nap új <Worldle /> érhető el!
      </div>
      <div className="space-y-3 text-justify border-b-2 border-gray-200 pb-3 mb-3">
        <div className="font-bold">Kérdésed, vagy javaslatod van?</div>
        <div>
          <a
            className="underline"
            href="https://estreleira.gal/faq"
            target="_blank"
            rel="noopener noreferrer"
          >
            FAQ LoGaliza
          </a>
        </div>
      </div>
      <div className="space-y-3 border-b-2 border-gray-200 pb-3 mb-3">
        <Worldle />
        -höz <span className="font-bold">jelentős</span> inspirációt adott a{" "}
        <a
          className="underline"
          href="https://twitter.com/powerlanguish"
          target="_blank"
          rel="noopener noreferrer"
        >
          Josh Wardle (@powerlanguish)
        </a>{" "}
        által készített{" "}
        <a
          className="underline"
          href="https://www.powerlanguage.co.uk/wordle/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Wordle
        </a>{" "}
        .
      </div>
      <div className="space-y-3 text-justify pb-3">
        <div>
          Készítette{" "}
          <a
            className="underline"
            href="https://twitter.com/teuteuf"
            target="_blank"
            rel="noopener noreferrer"
          >
            @teuteuf
          </a>{" "}
          - (
          <a
            className="underline"
            href="https://github.com/teuteuf/worldle/"
            target="_blank"
            rel="noopener noreferrer"
          >
            code source
          </a>
          )
        </div>
        <div>
          Támogatnál?{" "}
          <a
            className="underline"
            href="https://www.ko-fi.com/teuteuf"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Twemoji
              text="Dobj meg egy kávéval! ☕"
              options={{ className: "inline-block" }}
            />
          </a>
        </div>
      </div>
    </Panel>
  );
}
