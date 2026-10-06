import { gameStorageKey, readGameStorage } from "../domain/gameStorage";
import { useEffect, useState } from "react";

function loadAllModeValues(modeName: string, userId?: string): Record<string, boolean> {
  const storedModeValues = readGameStorage(modeName, userId);
  return storedModeValues != null ? JSON.parse(storedModeValues) : {};
}

export function useMode(
  modeName: string,
  dayString: string,
  defaultValue: boolean,
  userId?: string
): [boolean, (modeValue: boolean) => void] {
  const [modeValue, setModeValue] = useState<boolean>(defaultValue);

  useEffect(() => {
    setModeValue(loadAllModeValues(modeName, userId)[dayString] ?? defaultValue);
  }, [dayString, defaultValue, modeName, userId]);

  useEffect(() => {
    const allModeValues = loadAllModeValues(modeName, userId);
    localStorage.setItem(
      gameStorageKey(modeName, userId),
      JSON.stringify({
        ...allModeValues,
        [dayString]: modeValue,
      })
    );
  }, [dayString, modeName, modeValue, userId]);

  return [modeValue, setModeValue];
}
