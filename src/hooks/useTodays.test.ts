import { DateTime } from "luxon";
import { vi } from "vitest";
import {
  AUDIO_CADENCE_DAYS,
  getGlobalContentForDay,
  simulateNextPictures,
} from "./useTodays";
import { audioSamples, publishedAudioSamples } from "../domain/audioSamples";
import * as audioCatalogue from "../domain/audioSamples";

// Captured from the published rotation before the ILG recovery change.
const publishedFirstCycle = [
  "MUR",
  "BEZ",
  "TCA",
  "SEA",
  "ANC",
  "MOR",
  "PON",
  "LUG",
  "MAR",
  "ARN",
  "RIB",
  "EUM",
  "CHA",
  "ORT",
  "TME",
  "ULH",
  "CND",
  "CEL",
  "TNA",
  "SAL",
  "COU",
  "BUR",
  "BAL",
  "PAR",
  "TCH",
  "SAR",
  "COR",
  "BAR",
  "CAL",
  "MON",
  "VIG",
  "COM",
  "BER",
  "MAS",
  "TAV",
  "TMO",
  "LIM",
  "COS",
  "TRA",
  "VIA",
  "ORD",
  "BAM",
  "TLE",
  "VDO",
  "ARC",
  "OUR",
  "DEC",
  "CAR",
  "TTR",
];

describe("daily multimedia rotation", () => {
  test("keeps dates before the multimedia launch on the legacy image pool", () => {
    expect(getGlobalContentForDay("2026-08-30").audioSample).toBeUndefined();
  });

  test("does not rewrite the already-published launch rotation", () => {
    expect(getGlobalContentForDay("2026-08-31").audioSample?.id).toBe(
      "ago-061"
    );
    expect(getGlobalContentForDay("2026-09-18").audioSample?.id).toBe(
      "ago-062"
    );
    expect(getGlobalContentForDay("2026-10-12").audioSample?.id).toBe(
      "ccg-385"
    );
    expect(getGlobalContentForDay("2026-10-18").audioSample?.id).toBe(
      "ago-076"
    );
  });

  test("keeps the published answers through today and the relative future order", () => {
    publishedFirstCycle.forEach((code, index) => {
      const date = DateTime.fromISO("2026-09-18")
        .plus({ days: (index + (index >= 7 ? 1 : 0)) * AUDIO_CADENCE_DAYS })
        .toISODate()!;
      expect(getGlobalContentForDay(date).country.code).toBe(code);
    });
  });

  test("recovers today's audio without changing the answer", () => {
    const selection = getGlobalContentForDay("2026-10-24");
    expect(selection.country.code).toBe("PON");
    expect(selection.audioSample?.id).toBe("apoi-2953");
    expect(selection.audioSample?.comarcaCode).toBe("PON");
  });

  test("adds Íbias to the next slot without delaying the image rotation", () => {
    const next = getGlobalContentForDay("2026-10-30");
    expect(next.country.code).toBe("VDI");
    expect(next.audioSample?.id).toBe("redmeda-ga-0003");
    expect(getGlobalContentForDay("2026-11-05").country.code).toBe("LUG");
    for (const date of ["2026-10-25", "2026-10-29", "2026-10-31"]) {
      expect(getGlobalContentForDay(date).audioSample).toBeUndefined();
    }
  });

  test("restores Eume in its existing slot without changing the answer", () => {
    const selection = getGlobalContentForDay("2026-11-29");
    expect(selection.country.code).toBe("EUM");
    expect(selection.audioSample?.id).toBe("aelg-eva-veiga-202");
    expect(selection.imageNumber).toBe(2);
  });

  test("uses the scheduled comarca's photograph if its active recording is removed", () => {
    const originalLookup = audioCatalogue.getActiveAudioSampleForComarca;
    const lookup = vi
      .spyOn(audioCatalogue, "getActiveAudioSampleForComarca")
      .mockImplementation((code) =>
        code === "EUM" ? undefined : originalLookup(code)
      );
    try {
      const selection = getGlobalContentForDay("2026-11-29");
      expect(selection.country.code).toBe("EUM");
      expect(selection.audioSample).toBeUndefined();
      expect(selection.imageNumber).toBe(2);
    } finally {
      lookup.mockRestore();
    }
  });

  test("keeps the six-day slots and never requests blocked ILG audio in a future cycle", () => {
    const cycleStart = DateTime.fromISO("2026-09-18")
      .plus({ days: (publishedAudioSamples.length + 1) * AUDIO_CADENCE_DAYS })
      .toISODate()!;
    const cycle = simulateNextPictures(
      cycleStart,
      (publishedAudioSamples.length + 1) * AUDIO_CADENCE_DAYS
    );
    const selectedAudioIds = cycle
      .map(({ audioSampleId }) => audioSampleId)
      .filter((id): id is string => Boolean(id));
    expect(new Set(selectedAudioIds)).toEqual(
      new Set(audioSamples.map(({ id }) => id))
    );
    expect(selectedAudioIds).toHaveLength(audioSamples.length);
    expect(
      cycle.every(
        ({ audioSampleId }, index) =>
          !audioSampleId || index % AUDIO_CADENCE_DAYS === 0
      )
    ).toBe(true);
    expect(selectedAudioIds.every((id) => !id.startsWith("ago-"))).toBe(true);
  });
});
