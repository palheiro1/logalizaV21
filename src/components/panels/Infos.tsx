import { Guesses } from "../Guesses";
import { Panel } from "./Panel";
import React from "react";
import { SettingsData } from "../../hooks/useSettings";
import { Twemoji } from "react-emoji-render";

interface InfosProps {
  isOpen: boolean;
  close: () => void;
  settingsData: SettingsData;
}

export function Infos({ isOpen, close, settingsData }: InfosProps) {
  return (
    <Panel title="Como Jogar" isOpen={isOpen} close={close}>
      <div className="space-y-3 text-justify border-b-2 border-gray-200 pb-3 mb-3">
        <div>
          Adivinha o LoGaliza em 4 tentativas.
        </div>
        <div>Cada tentativa deve ser umha comarca válida</div>
        <div>
         Depois de cada tentativa, terás a distáncia, a direcçom e a
          proximidade à comarca alvo.
        </div>
      </div>
      <div className="space-y-3 text-justify border-b-2 border-gray-200 pb-3 mb-3">
        <div className="font-bold">Exemplos</div>
        <div>
          <Guesses
            rowCount={1}
            guesses={[
              {
                name: "Seabra",
                direction: "NW",
                distance: 163000,
              },
            ]}
            settingsData={settingsData}
          />
          <div className="my-2">
            A tua tentativa <span className="uppercase font-bold">Seabra</span> ficou a 163km da comarca alvo, que está em direcçom Noroeste
           e só tiveche 39% de aproximaçom... porque fica bastante
            longe!
          </div>
        </div>
        <div>
          <Guesses
            rowCount={1}
            guesses={[
              {
                name: "Corunha",
                direction: "E",
                distance: 61000,
              },
            ]}
            settingsData={settingsData}
          />
          <div className="my-2">
            A tua segunda tentativa{" "}
            <span className="uppercase font-bold">Corunha</span> achega-se
            um pouco! 61km mais, direcçom Leste e 77%!
          </div>
        </div>
        <div>
          <Guesses
            rowCount={1}
            guesses={[
              {
                name: "Eume",
                direction: "E",
                distance: 0,
              },
            ]}
            settingsData={settingsData}
          />
          <div className="my-2">
            A seguinte tentativa, <span className="uppercase font-bold">Eume</span>,
           é a certa! Parabéns!{" "}
            <Twemoji text="🎉" options={{ className: "inline-block" }} />
          </div>
        </div>
      </div>
      <div className="space-y-3 text-justify border-b-2 border-gray-200 pb-3 mb-3 font-bold">
        Agora busca o mapa da comarca, conhece o seu escudo, e clica na ligaçom para aprender mais. Um novo LoGaliza estará disponível amanhá!
      </div>
      <div className="space-y-3 text-justify border-b-2 border-gray-200 pb-3 mb-3">
        <div className="font-bold">Tés perguntas ou sugestons?</div>
        <div>
          Consulta o{" "}
          <a
            className="underline"
            href="https://estreleira.gal/faq"
            target="_blank"
            rel="noopener noreferrer"
          >
            FAQ de LoGaliza
          </a>
          !
        </div>
      </div>
      <div className="space-y-3 text-justify border-b-2 border-gray-200 pb-3 mb-3">
        LoGaliza foi <span className="font-bold">completamente</span> inspirado
        polo{" "}
        <a
          className="underline"
          href="https://worldle.teuteuf.fr/"
          target="_blank"
          rel="noopener noreferrer"
        >
          WorLdLe
        </a>{" "}
        criado por{" "}
        <a
          className="underline"
          href="https://twitter.com/teuteuf"
          target="_blank"
          rel="noopener noreferrer"
        >
         Teuteuf (@teuteuf)
        </a>
        .
      </div>
      <div className="space-y-3 text-justify pb-3">
        <div>
          Feito por{" "}
          <a
            className="underline"
            href="https://twitter.com/Estreleiragal"
            target="_blank"
            rel="noopener noreferrer"
          >
            @Estreleiragal 
          </a>{" "}
          - e {" "}
          <a
            className="underline"
            href="https://twitter.com/SementeGZ"
            target="_blank"
            rel="noopener noreferrer"
          >
            @SementeGZ
          </a>{" "}
          (
          <a
            className="underline"
            href="https://github.com/Estreleira/logaliza/"
            target="_blank"
            rel="noopener noreferrer"
          >
            código fonte
          </a>
          )
        </div>
       
      </div>
    </Panel>
  );
}
