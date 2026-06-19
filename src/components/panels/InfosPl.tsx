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

export function InfosPl({ isOpen, close, settingsData }: InfosProps) {
  return (
    <Panel title="Zasady gry" isOpen={isOpen} close={close}>
      <div className="space-y-3 text-justify border-b-2 border-gray-200 pb-3 mb-3">
        <div>
          Odgadnij <Worldle /> w 4 próbach.
        </div>
        <div>
          W każdej próbie odgadnięcia musisz podać istniejący kraj, terytorium,
          ...
        </div>
        <div>
          Po każdej próbie odgadnięcia zobaczysz informację o odległości,
          kierunku i bliskości pomiędzy odgadniętym krajem, a krajem docelowym.
        </div>
      </div>
      <div className="space-y-3 text-justify border-b-2 border-gray-200 pb-3 mb-3">
        <div className="font-bold">Przykłady</div>
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
            Twój typ <span className="uppercase font-bold">Chile</span> jest
            oddalone o {formatDistance(13557000, settingsData.distanceUnit)} od
            kraju docelowego, a kraj docelowy znajduje się w kierunku
            północno-wschodnim i masz tylko 32% bliskości, ponieważ kraj
            docelowy jest dość daleko!
          </div>
        </div>
        <div>
          <Guesses
            rowCount={1}
            guesses={[
              {
                name: "Finlandia",
                direction: "SE",
                distance: 3_206_000,
              },
            ]}
            settingsData={settingsData}
          />
          <div className="my-2">
            Twój drugi typ{" "}
            <span className="uppercase font-bold">Finlandia</span> jest bliżej!{" "}
            {formatDistance(3206000, settingsData.distanceUnit)} od kraju
            docelowego, w kierunku południowo-wschodnim i 84% bliskości!
          </div>
        </div>
        <div>
          <Guesses
            rowCount={1}
            guesses={[
              {
                name: "Liban",
                direction: "N",
                distance: 0,
              },
            ]}
            settingsData={settingsData}
          />
          <div className="my-2">
            Kolejny typ, <span className="uppercase font-bold">Liban</span>,
            jest krajem docelowym! Gratulacje!{" "}
            <Twemoji text="🎉" options={{ className: "inline-block" }} />
          </div>
        </div>
      </div>
      <div className="space-y-3 text-justify border-b-2 border-gray-200 pb-3 mb-3 font-bold">
        Nowe <Worldle /> będzie pojawiać się każdego dnia!
      </div>
      <div className="space-y-3 text-justify border-b-2 border-gray-200 pb-3 mb-3">
        <div className="font-bold">Masz pytania lub sugestie?</div>
        <div>
          Sprawdź{" "}
          <a
            className="underline"
            href="https://estreleira.gal/faq"
            target="_blank"
            rel="noopener noreferrer"
          >
            LoGaliza FAQ
          </a>
          !
        </div>
      </div>
      <div className="space-y-3 text-justify border-b-2 border-gray-200 pb-3 mb-3">
        <Worldle /> wzoruje się w <span className="font-bold">dużej</span>{" "}
        mierze na{" "}
        <a
          className="underline"
          href="https://www.powerlanguage.co.uk/wordle/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Wordle
        </a>{" "}
        stworzonym przez{" "}
        <a
          className="underline"
          href="https://twitter.com/powerlanguish"
          target="_blank"
          rel="noopener noreferrer"
        >
          Josha Wardle (@powerlanguish)
        </a>
        .
      </div>
      <div className="space-y-3 text-justify pb-3">
        <div>
          Autor{" "}
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
            kod źródłowy
          </a>
          )
        </div>
        <div>
          Chcesz mnie wesprzeć?{" "}
          <a
            className="underline"
            href="https://www.ko-fi.com/teuteuf"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Twemoji
              text="Postaw mi kawę! ☕"
              options={{ className: "inline-block" }}
            />
          </a>
        </div>
      </div>
    </Panel>
  );
}
