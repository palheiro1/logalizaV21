import React, { useEffect, useState } from "react";

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showManifesto, setShowManifesto] = useState(false);

  // Check if current date is after July 25, 2025
  useEffect(() => {
    const currentDate = new Date();
    const endDate = new Date(2025, 6, 25); // July 25, 2025 (month is 0-indexed)
    
    if (currentDate > endDate) {
      // Skip splash screen if we're past July 25, 2025
      setIsVisible(false);
      onFinish();
      return;
    }
  }, [onFinish]);

  const handleInfoClick = () => {
    setShowManifesto(true);
  };

  const handleGoToApp = () => {
    setIsVisible(false);
    onFinish();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-gray-900 p-4">
      <div className="flex-1 flex items-center justify-center max-w-full">
        <img
          src={showManifesto ? "/manifesto25J.jpg" : "/estreleira25J.jpg"}
          alt={showManifesto ? "Manifesto" : "Advertisement"}
          className="max-w-full max-h-full object-contain"
        />
      </div>
      
      <div className="flex gap-4 mt-4 mb-8">
        {!showManifesto && (
          <button
            onClick={handleInfoClick}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors duration-200"
          >
            + INFO
          </button>
        )}
        
        <button
          onClick={handleGoToApp}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors duration-200"
        >
          IR AO LOGALIZA
        </button>
      </div>
    </div>
  );
};
