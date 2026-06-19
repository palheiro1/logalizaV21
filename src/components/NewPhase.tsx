import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { galicianCountryNamesChanga } from "../domain/comarcas.name.co";
import seedrandom from "seedrandom";

interface NewPhaseProps {
  correctCountry: string;
  dayString: string;
  onGuessResult: (correct: boolean) => void;
  onPhaseEnd: () => void;
}

const NewPhase: React.FC<NewPhaseProps> = ({ correctCountry, dayString, onGuessResult, onPhaseEnd }) => {
  const { t } = useTranslation();
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isDisabled, setIsDisabled] = useState<boolean>(false); // New state to track if buttons are disabled

  useEffect(() => {
    const generateOptions = () => {
      const allCountries = Object.keys(galicianCountryNamesChanga);
      const random = seedrandom(`${dayString}:shield:${correctCountry}`);
      const distractors = shuffleArray(
        allCountries.filter((country) => country !== correctCountry),
        random
      ).slice(0, 3);
      setOptions(shuffleArray([correctCountry, ...distractors], random));
    };

    generateOptions();
  }, [correctCountry, dayString]);

  // Handle user option click
  const handleOptionClick = (option: string) => {
    if (isDisabled) return; // Prevent further clicks if already disabled
    setSelectedOption(option);
    setIsDisabled(true); // Disable buttons after the first choice
    const correct = option === correctCountry;
    onGuessResult(correct);
    if (correct) {
      setMessage(t("Brava!"));
    } else {
      setMessage(t("Nom era esse escudo!"));
    }
  };

  const correctComarcaName = galicianCountryNamesChanga[correctCountry]?.nomeI18n || '';

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-bold mb-4">{t("Adivinha o escudo de")} {correctComarcaName}!</h2>
      <div className="grid grid-cols-2 gap-4 max-w-2xl">
        {options.map((option) => {
          const comarca = galicianCountryNamesChanga[option];
          if (!comarca) return null;

          const imagePath = `/images/comarcas/${option.toLowerCase()}/${comarca.nomeArquivo.toLowerCase()}7.jpg`;

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
                disabled={isDisabled} // Disable button if isDisabled is true
              >
                <img
                  src={imagePath}
                  alt={comarca.nomeI18n}
                  width={200}
                  height={200}
                  className="w-full h-auto object-contain"
                  onError={(e) => {
                    const imgElement = e.target as HTMLImageElement;
                    imgElement.style.display = 'none';
                  }}
                />
              </button>
              {selectedOption && <span className="mt-2 text-center">{comarca.nomeI18n.toUpperCase()}</span>}
            </div>
          );
        })}
      </div>
      {message && <div className="mt-4 text-lg font-bold">{message}</div>}
      {selectedOption && (
        // Display button only after an option is selected.
        <button
          className="w-full bg-green-500 text-white font-bold py-2 px-4 rounded mb-2 hover:bg-green-600"
          onClick={onPhaseEnd}
        >
          {t("BÓNUS DO MAPA")}
        </button>
      )}
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

export default NewPhase;
