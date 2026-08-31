import { galicianComarcas } from "./comarcas.position";
import {
  getMunicipalitiesForComarca,
  getMunicipalityBonusOptions,
  isMunicipalitySelectionCorrect,
  municipalitiesByComarcaCode,
  normalizeMunicipalityName,
} from "./comarcaMunicipalities";

describe("comarca municipality catalogue", () => {
  test("covers every comarca in the game exactly once", () => {
    const gameCodes = galicianComarcas.map(({ code }) => code).sort();
    const catalogueCodes = Object.keys(municipalitiesByComarcaCode).sort();

    expect(catalogueCodes).toEqual(gameCodes);
  });

  test("contains unique, non-empty municipalities within every comarca", () => {
    for (const municipalities of Object.values(
      municipalitiesByComarcaCode
    )) {
      const normalized = municipalities.map(normalizeMunicipalityName);

      expect(municipalities.length).toBeGreaterThan(0);
      expect(normalized.every(Boolean)).toBe(true);
      expect(new Set(normalized).size).toBe(municipalities.length);
    }
  });

  test("preserves the source counts for representative comarcas", () => {
    expect(getMunicipalitiesForComarca("TME")).toHaveLength(4);
    expect(getMunicipalitiesForComarca("BEZ")).toHaveLength(37);
    expect(getMunicipalitiesForComarca("VDI")).toHaveLength(2);
  });

  test("builds deterministic options with four outside distractors", () => {
    const first = getMunicipalityBonusOptions("TME", "2026-08-31");
    const second = getMunicipalityBonusOptions("TME", "2026-08-31");

    expect(first).toEqual(second);
    expect(first).toHaveLength(8);
    for (const municipality of getMunicipalitiesForComarca("TME")) {
      expect(first).toContain(municipality);
    }
  });

  test("requires the exact complete selection", () => {
    const correct = getMunicipalitiesForComarca("TME");

    expect(isMunicipalitySelectionCorrect("TME", correct)).toBe(true);
    expect(isMunicipalitySelectionCorrect("TME", correct.slice(0, 3))).toBe(
      false
    );
    expect(
      isMunicipalitySelectionCorrect("TME", [
        ...correct.slice(0, 3),
        "Arçua",
      ])
    ).toBe(false);
  });
});
