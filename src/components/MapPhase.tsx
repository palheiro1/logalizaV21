import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { galicianCountryNamesChanga } from "../domain/comarcas.name.co";
import seedrandom from "seedrandom";

interface MapPhaseProps {
  correctCountry: string;
  dayString: string;
  onPhaseEnd: () => void;
  onMapGuessResult: (correct: boolean) => void;
}

const MapPhase: React.FC<MapPhaseProps> = ({ correctCountry, dayString, onPhaseEnd, onMapGuessResult }) => {
  const { t } = useTranslation();
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);

  useEffect(() => {
    const generateOptions = () => {
      const allCountries = Object.keys(galicianCountryNamesChanga);
      const random = seedrandom(`${dayString}:map:${correctCountry}`);
      const distractors = shuffleArray(
        allCountries.filter((country) => country !== correctCountry),
        random
      ).slice(0, 3);
      setOptions(shuffleArray([correctCountry, ...distractors], random));
    };

    generateOptions();
  }, [correctCountry, dayString]);

  const handleOptionClick = (option: string) => {
    if (isDisabled) return;
    setSelectedOption(option);
    setIsDisabled(true);
    const correct = option === correctCountry;
    onMapGuessResult(correct);
    if (correct) {
      setMessage(t("Bravo!"));
    } else {
      setMessage(t("Nom era este mapa!"));
    }
    setTimeout(() => {
      onPhaseEnd();
    }, 3000);
  };

  const correctComarcaName = galicianCountryNamesChanga[correctCountry]?.nomeI18n || '';

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-bold mb-4">{t("Adivinha o mapa de")} {correctComarcaName}!</h2>
      <div className="grid grid-cols-2 gap-4 max-w-2xl">
        {options.map((option) => {
          const comarca = galicianCountryNamesChanga[option];
          if (!comarca) return null;
          const imageFilename =
            option === "CAR" ? "carvalinho1.jpg" : `${comarca.nomeArquivo.toLowerCase()}1.jpg`;
          const imagePath = `/images/comarcas/${option.toLowerCase()}/${imageFilename}`;

          return (
            <div key={option} className="flex flex-col items-center">
              <button
                onClick={() => handleOptionClick(option)}
                className={`p-2 rounded-lg transition-transform hover:scale-105 ${
                  selectedOption === option
                    ? option === correctCountry
                      ? 'ring-4 ring-green-500'
                      : 'ring-4 ring-red-500'
                    : ''
                }`}
                disabled={isDisabled}
              >
                <img
                  src={imagePath}
                  alt={comarca.nomeI18n}
                  width={200}
                  height={200}
                  className="w-full h-auto object-contain"
                  onError={(e) => {
                    const imgElement = e.target as HTMLImageElement;
                    imgElement.style.display = "none";
                  }}
                />
              </button>
              {selectedOption && <span className="mt-2 text-center">{comarca.nomeI18n.toUpperCase()}</span>}
            </div>
          );
        })}
      </div>
      {message && <div className="mt-4 text-lg font-bold">{message}</div>}
    </div>
  );
};

function shuffleArray(array: string[], random: () => number) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export default MapPhase;
