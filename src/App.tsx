import React, { useEffect, useMemo, useState } from "react";
import { Twemoji } from "react-emoji-render";
import { useTranslation } from "react-i18next";
import { Flip, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Game } from "./components/Game";
import { Infos } from "./components/panels/Infos";
import { InfosCo } from "./components/panels/InfosCo";
import { InfosDe } from "./components/panels/InfosDe";
import { InfosFr } from "./components/panels/InfosFr";
import { InfosHu } from "./components/panels/InfosHu";
import { InfosJa } from "./components/panels/InfosJa";
import { InfosNl } from "./components/panels/InfosNl";
import { InfosPl } from "./components/panels/InfosPl";
import { Settings } from "./components/panels/Settings";
import { Stats } from "./components/panels/Stats";
import { useSettings } from "./hooks/useSettings";
import { getDayString, useTodays } from "./hooks/useTodays";
import { galicianComarcas } from "./domain/comarcas.position";
import { forcedCountries, randomNumber } from "./hooks/forcedLead";
import seedrandom from 'seedrandom';

// Link de suporte para diferentes países
const supportLink: Record<string, string> = {
    UA: "https://donate.redcrossredcrescent.org/ua/donate/~my-donation?_cv=1",
};

export default function App() {
    const { t, i18n } = useTranslation();
    
    // Obtém a string do dia atual
    const dayString = useMemo(getDayString, []);
    init(dayString);
    const [{ country }] = useTodays(dayString);

    // Estados para controlar a abertura dos painéis de informações, configurações e estatísticas
    const [infoOpen, setInfoOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [statsOpen, setStatsOpen] = useState(false);

    // Estado e função para atualizar as configurações
    const [settingsData, updateSettings] = useSettings();

    // Efeito para aplicar o tema escuro
    useEffect(() => {
        if (settingsData.theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [settingsData.theme]);

    // Seleciona o componente de informações com base no idioma
    let InfosComponent;
    switch (i18n.resolvedLanguage) {
        case "co":
            InfosComponent = InfosCo;
            break;
        case "fr":
            InfosComponent = InfosFr;
            break;
        case "hu":
            InfosComponent = InfosHu;
            break;
        case "nl":
            InfosComponent = InfosNl;
            break;
        case "pl":
            InfosComponent = InfosPl;
            break;
        case "de":
            InfosComponent = InfosDe;
            break;
        case "ja":
            InfosComponent = InfosJa;
            break;
        default:
            InfosComponent = Infos;
    }

    return (
        <>
            {/* Componente de notificação */}
            <ToastContainer
                hideProgressBar
                position="top-center"
                transition={Flip}
                theme={settingsData.theme}
                autoClose={2000}
                bodyClassName="font-bold text-center"
                toastClassName="flex justify-center m-2 max-w-full"
                style={{ width: 500, maxWidth: "100%" }}
            />
            {/* Componente de informações */}
            <InfosComponent isOpen={infoOpen} close={() => setInfoOpen(false)} settingsData={settingsData} />
            {/* Componente de configurações */}
            <Settings
                isOpen={settingsOpen}
                close={() => setSettingsOpen(false)}
                settingsData={settingsData}
                updateSettings={updateSettings}
            />
            {/* Componente de estatísticas */}
            <Stats isOpen={statsOpen} close={() => setStatsOpen(false)} distanceUnit={settingsData.distanceUnit} />
            <div className="flex justify-center flex-auto dark:bg-slate-900 dark:text-slate-50">
                <div className="w-full max-w-lg flex flex-col">
                    <header className="border-b-2 px-3 border-gray-200 flex">
                        {/* Botão para abrir o painel de informações */}
                        <button className="mr-3 text-xl" type="button" onClick={() => setInfoOpen(true)}>
                            <Twemoji text="❓" />
                        </button>
                        <h1 className="text-4xl font-bold uppercase tracking-wide text-center my-1 flex-auto">
                            LO<span style={{color:'red'}}>G</span>ALI<span style={{color:'red'}}>Z</span>A
                        </h1>
                        {/* Botão para abrir o painel de estatísticas */}
                        <button className="ml-3 text-xl" type="button" onClick={() => setStatsOpen(true)}>
                            <Twemoji text="📈" />
                        </button>
                    </header>
                    {/* Componente do jogo */}
                    <Game settingsData={settingsData} updateSettings={updateSettings} />
                    <footer className="flex justify-center items-center mt-8 mb-4">
                        <Twemoji text="❤️" className="flex items-center justify-center mr-1" /> Logaliza? -
                        {country && supportLink[country.code] != null ? (
                            <a
                                className="underline pl-1"
                                href={supportLink[country.code]}
                                target="_blank"
                                rel="noopener noreferrer">
                                <div className="w-max">{t(`support.${country.code}`)}</div>
                            </a>
                        ) : (
                            <a
                                className="underline pl-1"
                                href="https://www.ko-fi.com/estreleira"
                                target="_blank"
                                rel="noopener noreferrer">
                                <div className="w-max">
                                    <Twemoji text={"Financia um colante!"} options={{ className: "inline-block" }} />
                                </div>
                            </a>
                        )}
                    </footer>
                </div>
            </div>
        </>
    );
}

// Função para iniciar um novo jogo
function newGame(): React.MouseEventHandler<HTMLButtonElement> | undefined {
    localStorage.clear();
    setNewForcedCountryCode();
    setNewRandomImageNumber();
    localStorage.setItem("newGameDate", new Date().toString());
    // eslint-disable-next-line no-restricted-globals
    location.reload();
    return;
}

// Define um novo código de país forçado
function setNewForcedCountryCode(fixedRandom?: number): void {
    const random = Math.floor(((fixedRandom ?? Math.random()) * 100)) % galicianComarcas.length;
    localStorage.setItem("forcedCountryCode", galicianComarcas[random].code);
}

// Define um novo número de imagem aleatória
function setNewRandomImageNumber(fixedRandom?: number): void {

    const random = Math.floor(((fixedRandom ?? Math.random()) * 100)) % 5 + 2;
    localStorage.setItem("randomImageNumber", random.toString());
}


// Obtém o código de país forçado
export function getNewForcedCountryCode(): string {
    return localStorage.getItem("forcedCountryCode") as string;
}

// Obtém o número de imagem aleatória
export function getNewRandomImageNumber(): number {
    const num = localStorage.getItem("randomImageNumber");
    return num != null ? +num : 2;
}

// Verifica se deve mostrar um novo jogo
export function getShowNewGame(): boolean {
  let showNewGame = false;
  const dateStr = localStorage.getItem("newGameDate");
  if (dateStr) {
    const savedDate = new Date(dateStr);
    const currentDate = new Date();
    const date = currentDate.getDate();
    const month = currentDate.getMonth();
    const fullYear = currentDate.getFullYear();
    const todayDate = new Date(fullYear, month, date);
    showNewGame = todayDate < savedDate;
  }
  return showNewGame;
}

// Inicializa o jogo com base na string do dia
function init(dayString: string): void {
    const randomImageNumber = randomNumber[dayString];
    if (!getShowNewGame() && !randomImageNumber) {
        const seed = getNewRandomSeed();
        setNewRandomImageNumber(seed);
    }

    const forcedCountryCode = forcedCountries[dayString];
    if (!getShowNewGame() && !forcedCountryCode) {
        const seed = getNewRandomSeed();
        setNewForcedCountryCode(seed);
    }
}

// Gera uma nova semente aleatória
function getNewRandomSeed(): number {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const dayDate = date.getDate();
    const day = date.getDay();

    const generator = seedrandom(`${year}-${month}-${dayDate}-${day}`);
    return generator();
}
