import React from "react";
import { AudioSample } from "../domain/audioSamples";

interface AudioSampleRevealProps {
  sample: AudioSample;
  countryName: string;
  won: boolean;
}

export function AudioSampleReveal({
  sample,
  countryName,
  won,
}: AudioSampleRevealProps) {
  return (
    <section className="mt-3 overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700">
      <div
        className={`p-4 text-center text-white ${
          won ? "bg-green-600" : "bg-red-600"
        }`}
      >
        <p className="text-sm font-bold uppercase tracking-widest">
          {won ? "Acertache!" : "A voz era de"}
        </p>
        <h3 className="mt-1 text-2xl font-extrabold uppercase">
          {countryName}
        </h3>
      </div>

      <div className="space-y-3 bg-white p-4 text-sm dark:bg-slate-800">
        <p>
          Esta é a fala de <strong>{sample.speaker.toLowerCase()}</strong>,
          gravada em <strong>{sample.locality}</strong> ({sample.municipality})
          em {sample.recordedAt}.
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Fonte: {sample.sourceLabel}, {sample.sourceRecord}. Gravaçom de{" "}
          {sample.recorder}. Uma voz individual nom representa toda a fala da
          comarca.
        </p>
        <a
          className="inline-block font-bold text-red-700 underline dark:text-red-300"
          href={sample.recordUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Ver a ficha e a transcriçom completas ↗
        </a>
      </div>
    </section>
  );
}
