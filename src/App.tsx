import React, { useEffect, useMemo, useState } from "react";
import { Twemoji } from "react-emoji-render";
import { useTranslation } from "react-i18next";
import { Flip, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Analytics } from "@vercel/analytics/react";
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
import { LeaderboardPanel } from "./components/panels/LeaderboardPanel";
import { SplashScreen } from "./components/SplashScreen";
import { LoginModal } from "./components/auth/LoginModal";
import { AuthButton } from "./components/auth/AuthButton";
import { AuthProvider } from "./contexts/AuthContext";
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
    const [leaderboardOpen, setLeaderboardOpen] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);

    // Estado para controlar o splash screen
    const [showSplash, setShowSplash] = useState(true);

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
        <AuthProvider>
            {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
            {!showSplash && (
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
                    {/* Componente de leaderboard */}
                    <LeaderboardPanel isOpen={leaderboardOpen} close={() => setLeaderboardOpen(false)} />
                    {/* Componente de login */}
                    <LoginModal isOpen={loginOpen} close={() => setLoginOpen(false)} theme={settingsData.theme} />
                    <div className="flex justify-center flex-auto dark:bg-slate-900 dark:text-slate-50">
                        <div className="w-full max-w-lg flex flex-col">
                            {/* Professional header with improved design */}
                            <header className="border-b-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 shadow-sm">
                                <div className="px-4 py-3 flex items-center justify-between">
                                    {/* Left side: Auth button */}
                                    <div className="flex items-center">
                                        <div>
                                            <AuthButton onLoginClick={() => setLoginOpen(true)} />
                                        </div>
                                    </div>
                                    
                                    {/* Center: Logo */}
                                    <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wide text-center flex-1">
                                        LO<span style={{color:'#ef4444'}}>G</span>ALI<span style={{color:'#ef4444'}}>Z</span>A
                                    </h1>
                                    
                                    {/* Right side: Action buttons */}
                                    <div className="flex items-center space-x-1">
                                        <button 
                                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200 group" 
                                            type="button" 
                                            onClick={() => setInfoOpen(true)}
                                            title="Informações"
                                        >
                                            <Twemoji text="❓" className="text-lg group-hover:scale-110 transition-transform duration-200" />
                                        </button>
                                        
                                        <button 
                                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200 group relative" 
                                            type="button" 
                                            onClick={() => setLeaderboardOpen(true)}
                                            title="Leaderboard"
                                        >
                                            <Twemoji text="🏆" className="text-lg group-hover:scale-110 transition-transform duration-200" />
                                        </button>
                                        
                                        <button 
                                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200 group" 
                                            type="button" 
                                            onClick={() => setStatsOpen(true)}
                                            title="Estatísticas"
                                        >
                                            <Twemoji text="📈" className="text-lg group-hover:scale-110 transition-transform duration-200" />
                                        </button>
                                    </div>
                                </div>
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
            )}
            <Analytics />
        </AuthProvider>
    );
}

// Define um novo código de país forçado
function setNewForcedCountryCode(fixedRandom?: number): void {
    const random = Math.floor(((fixedRandom ?? Math.random()) * 100)) % galicianComarcas.length;
    localStorage.setItem("forcedCountryCode", galicianComarcas[random].code);
}

// Define um novo número de imagem aleatória
function setNewRandomImageNumber(fixedRandom?: number): void {
    let random = Math.floor(((fixedRandom ?? Math.random()) * 100)) % 7 + 1;
    if (random === 5) {
      random = 7;
    }
    localStorage.setItem("randomImageNumber", random.toString());
}

// Obtém o código de país forçado
export function getNewForcedCountryCode(): string {
    return localStorage.getItem("forcedCountryCode") as string;
}

// Obtém o número de imagem aleatória
export function getNewRandomImageNumber(): number {
    const num = localStorage.getItem("randomImageNumber");
    return num != null ? +num : 1;
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
