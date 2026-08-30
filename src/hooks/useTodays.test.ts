import { getGlobalContentForDay, simulateNextPictures } from "./useTodays";
import { audioSamples } from "../domain/audioSamples";

describe("daily multimedia rotation", () => {
  test("keeps dates before the multimedia launch on the legacy image pool", () => {
    expect(getGlobalContentForDay("2026-08-30").audioSample).toBeUndefined();
  });

  test("launches with an audio day mapped to the sample's comarca", () => {
    const selection = getGlobalContentForDay("2026-08-31");

    expect(selection.audioSample).toBeDefined();
    expect(selection.country.code).toBe(selection.audioSample?.comarcaCode);
  });

  test("includes every curated audio once per multimedia cycle", () => {
    const cycleLength = 51 * 5 + audioSamples.length;
    const cycle = simulateNextPictures("2026-08-31", cycleLength);
    const selectedAudioIds = cycle
      .map(({ audioSampleId }) => audioSampleId)
      .filter((id): id is string => Boolean(id));

    expect(selectedAudioIds).toHaveLength(audioSamples.length);
    expect(new Set(selectedAudioIds)).toEqual(
      new Set(audioSamples.map(({ id }) => id))
    );
  });
});
