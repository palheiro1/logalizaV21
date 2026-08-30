import { galicianComarcas } from "./comarcas.position";
import { audioSamples, getAudioSampleById } from "./audioSamples";

describe("audio pilot catalogue", () => {
  test("contains unique records mapped to valid comarcas", () => {
    const ids = audioSamples.map(({ id }) => id);
    const validCodes = new Set(galicianComarcas.map(({ code }) => code));

    expect(new Set(ids).size).toBe(ids.length);
    expect(audioSamples.length).toBeGreaterThanOrEqual(10);
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
    expect(getAudioSampleById("missing")).toBeUndefined();
  });

  test("skips the spoken editorial introductions", () => {
    for (const id of ["ago-001", "ccg-385", "ccg-388"]) {
      expect(getAudioSampleById(id)?.clipStart).toBeGreaterThanOrEqual(13);
    }
  });
});
