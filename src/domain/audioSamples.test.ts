import { galicianComarcas } from "./comarcas.position";
import {
  audioSamples,
  publishedAudioSamples,
  getActiveAudioSampleForComarca,
  getAudioSampleById,
} from "./audioSamples";

describe("audio catalogue", () => {
  test("offers one accessible recording per covered comarca", () => {
    const ids = audioSamples.map(({ id }) => id);
    const coveredCodes = audioSamples.map(({ comarcaCode }) => comarcaCode);
    const validCodes = new Set(galicianComarcas.map(({ code }) => code));
    const missingCodes = galicianComarcas
      .map(({ code }) => code)
      .filter((code) => !coveredCodes.includes(code))
      .sort();

    expect(new Set(ids).size).toBe(ids.length);
    expect(audioSamples).toHaveLength(41);
    expect(new Set(coveredCodes).size).toBe(audioSamples.length);
    expect(missingCodes).toEqual([
      "CAB",
      "CAR",
      "COR",
      "COU",
      "EUM",
      "MAS",
      "PAR",
      "TCA",
      "ULH",
      "VDI",
    ]);
    expect(
      audioSamples.every(({ comarcaCode }) => validCodes.has(comarcaCode))
    ).toBe(true);
    expect(
      audioSamples.every(({ audioUrl }) => !audioUrl.includes("ilg.usc."))
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

  test("retains old recordings for historical dates without offering them in the pilot", () => {
    expect(publishedAudioSamples).toHaveLength(49);
    expect(getAudioSampleById("ago-120")?.comarcaCode).toBe("PON");
    expect(getAudioSampleById("ago-149")?.comarcaCode).toBe("VIA");
    expect(getAudioSampleById("missing")).toBeUndefined();
    expect(audioSamples.some(({ id }) => id === "ago-120")).toBe(false);
    expect(getActiveAudioSampleForComarca("PON")?.id).toBe("apoi-2953");
    expect(getActiveAudioSampleForComarca("EUM")).toBeUndefined();
  });

  test("uses recordings whose municipalities match the game's Ancares and Terra Chá", () => {
    expect(getActiveAudioSampleForComarca("ANC")?.municipality).toBe(
      "Becerreá"
    );
    expect(getActiveAudioSampleForComarca("TCH")?.municipality).toBe(
      "Castro de Rei"
    );
    expect(audioSamples.some(({ id }) => id === "ccg-385")).toBe(false);
  });

  test("preserves attribution and the license for every APOI recording", () => {
    const apoiSamples = audioSamples.filter(({ source }) => source === "apoi");
    expect(apoiSamples).toHaveLength(7);
    for (const sample of apoiSamples) {
      expect(sample.license?.label).toBe("CC BY-NC 2.5 AR");
      expect(sample.license?.url).toBe(
        "https://creativecommons.org/licenses/by-nc/2.5/ar/"
      );
      expect(sample.recorder).not.toBe("");
      expect(sample.sourceRecord).toContain("coleção");
    }
  });

  test("excludes the long editorial opening and the local place-name introductions", () => {
    expect(getAudioSampleById("ccg-346")!.clipStart).toBeGreaterThan(94);
    expect(getAudioSampleById("ccg-354")!.clipStart).toBeGreaterThan(14.7);
    expect(getAudioSampleById("ccg-383")!.clipStart).toBeGreaterThan(36.5);
    expect(getAudioSampleById("ccg-350")!.clipEnd).toBeLessThan(79);
  });
});
