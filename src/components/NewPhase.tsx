import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { galicianCountryNamesChanga } from "../domain/comarcas.name.co";

interface NewPhaseProps {
  correctCountry: string;
  onCorrectGuess: () => void;
  onPhaseEnd: () => void;
}

const NewPhase: React.FC<NewPhaseProps> = ({ correctCountry, onCorrectGuess, onPhaseEnd }) => {
  const { t, i18n } = useTranslation();
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isDisabled, setIsDisabled] = useState<boolean>(false); // New state to track if buttons are disabled

  useEffect(() => {
    const generateOptions = () => {
      const allCountries = Object.keys(galicianCountryNamesChanga);
      const randomOptions = new Set<string>();
      randomOptions.add(correctCountry);

      while (randomOptions.size < 4) {
        const randomCountry = allCountries[Math.floor(Math.random() * allCountries.length)];
        if (randomCountry !== correctCountry) {
          randomOptions.add(randomCountry);
        }
      }

      const optionsArray = Array.from(randomOptions);
      setOptions(shuffleArray(optionsArray));
    };

    generateOptions();
  }, [correctCountry]);

  const shuffleArray = (array: string[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const handleOptionClick = (option: string) => {
    if (isDisabled) return; // Prevent further clicks if already disabled
    setSelectedOption(option);
    setIsDisabled(true); // Disable buttons after the first choice
    if (option === correctCountry) {
      setMessage(t("Brava!"));
      onCorrectGuess();
    } else {
      setMessage(t("Nom era esse escudo!"));
    }
    setTimeout(() => {
      onPhaseEnd();
    }, 3000);
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
                    console.error('Image load error for:', imagePath);
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
    </div>
  );
};

export default NewPhase;