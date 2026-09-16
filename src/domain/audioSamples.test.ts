import { galicianComarcas } from "./comarcas.position";
import { audioSamples, getAudioSampleById } from "./audioSamples";

describe("audio pilot catalogue", () => {
  test("contains one unique record for every comarca with an available source", () => {
    const ids = audioSamples.map(({ id }) => id);
    const coveredCodes = audioSamples.map(({ comarcaCode }) => comarcaCode);
    const validCodes = new Set(galicianComarcas.map(({ code }) => code));
    const missingCodes = galicianComarcas
      .map(({ code }) => code)
      .filter((code) => !coveredCodes.includes(code))
      .sort();

    expect(new Set(ids).size).toBe(ids.length);
    expect(audioSamples).toHaveLength(49);
    expect(new Set(coveredCodes).size).toBe(audioSamples.length);
    expect(missingCodes).toEqual(["CAB", "VDI"]);
    expect(
      audioSamples.every(({ comarcaCode }) => validCodes.has(comarcaCode))
    ).toBe(true);
  });

  test("only exposes short, valid audio intervals", () => {
    for (const sample of audioSamples) {
      expect(sample.audioUrl).toMatch(/^https:\/\//);
      expect(sample.recordUrl).toMatch(/^https:\/\//);
      expect(sample.clipStart).toBeGreaterThanOrEqual(0);
      expect(sample.clipEnd).toBeGreaterThan(sample.clipStart);
      expect(sample.clipEnd - sample.clipStart).toBeLessThanOrEqual(30);
    }
  });

  test("finds a sample by its stable id", () => {
    expect(getAudioSampleById("ccg-388")?.comarcaCode).toBe("SEA");
    expect(getAudioSampleById("ago-149")?.comarcaCode).toBe("VIA");
    expect(getAudioSampleById("missing")).toBeUndefined();
  });

  test("uses the reviewed replacements for the four weak recordings", () => {
    const activeIds = new Set(audioSamples.map(({ id }) => id));

    expect(activeIds.has("ago-011")).toBe(false);
    expect(activeIds.has("ago-044")).toBe(false);
    expect(activeIds.has("ago-070")).toBe(false);
    expect(activeIds.has("ago-102")).toBe(false);
    expect(activeIds.has("ccg-1501")).toBe(true);
    expect(activeIds.has("ago-083")).toBe(true);
    expect(activeIds.has("ccg-436")).toBe(true);
    expect(activeIds.has("ccg-386")).toBe(true);
  });

  test("skips the spoken editorial introductions and place-name openings", () => {
    for (const id of [
      "ago-001",
      "ago-168",
      "ago-088",
      "ccg-379",
      "ccg-385",
      "ccg-387",
      "ccg-388",
    ]) {
      expect(getAudioSampleById(id)?.clipStart).toBeGreaterThanOrEqual(13);
    }
  });
});
