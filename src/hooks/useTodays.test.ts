import {
  AUDIO_CADENCE_DAYS,
  getGlobalContentForDay,
  simulateNextPictures,
} from "./useTodays";
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

  test("keeps the expanded catalogue on a six-day cadence", () => {
    const cycle = simulateNextPictures(
      "2026-09-18",
      audioSamples.length * AUDIO_CADENCE_DAYS
    );
    const selectedAudioIds = cycle
      .map(({ audioSampleId }) => audioSampleId)
      .filter((id): id is string => Boolean(id));

    expect(selectedAudioIds).toHaveLength(audioSamples.length);
    expect(new Set(selectedAudioIds)).toEqual(
      new Set(audioSamples.map(({ id }) => id))
    );
    expect(
      cycle.every(({ audioSampleId }, index) =>
        index % AUDIO_CADENCE_DAYS === 0
          ? Boolean(audioSampleId)
          : !audioSampleId
      )
    ).toBe(true);
  });

  test("does not rewrite the already-published launch rotation", () => {
    expect(getGlobalContentForDay("2026-08-31").audioSample?.id).toBe(
      "ago-061"
    );
    expect(getGlobalContentForDay("2026-09-17")).toBeDefined();
  });
});
