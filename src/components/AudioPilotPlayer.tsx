import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AudioSample } from "../domain/audioSamples";

interface AudioPilotPlayerProps {
  sample: AudioSample;
}

function formatTime(seconds: number): string {
  const safeSeconds = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  return `${minutes}:${(safeSeconds % 60).toString().padStart(2, "0")}`;
}

export function AudioPilotPlayer({ sample }: AudioPilotPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState(false);

  const clipDuration = sample.clipEnd - sample.clipStart;
  const progress = useMemo(
    () => Math.min(100, Math.max(0, (elapsed / clipDuration) * 100)),
    [clipDuration, elapsed]
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.pause();
    audio.load();
    setIsPlaying(false);
    setHasEnded(false);
    setElapsed(0);
    setError(false);
  }, [sample.id]);

  const stopAtClipEnd = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const clipElapsed = Math.max(0, audio.currentTime - sample.clipStart);
    setElapsed(Math.min(clipDuration, clipElapsed));

    if (audio.currentTime >= sample.clipEnd) {
      audio.pause();
      audio.currentTime = sample.clipStart;
      setIsPlaying(false);
      setHasEnded(true);
      setElapsed(clipDuration);
    }
  }, [clipDuration, sample.clipEnd, sample.clipStart]);

  const togglePlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (!audio.paused) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    if (
      hasEnded ||
      audio.currentTime < sample.clipStart ||
      audio.currentTime >= sample.clipEnd
    ) {
      audio.currentTime = sample.clipStart;
      setElapsed(0);
      setHasEnded(false);
    }

    try {
      setError(false);
      await audio.play();
      setIsPlaying(true);
    } catch (_error) {
      setError(true);
      setIsPlaying(false);
    }
  }, [hasEnded, sample.clipEnd, sample.clipStart]);

  return (
    <section
      className="my-3 rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5 text-center shadow-sm dark:border-blue-800 dark:from-slate-800 dark:to-slate-900"
      aria-label="Reprodutor da amostra sonora"
    >
      <audio
        ref={audioRef}
        preload="metadata"
        src={sample.audioUrl}
        onLoadedMetadata={({ currentTarget }) => {
          currentTarget.currentTime = sample.clipStart;
        }}
        onTimeUpdate={stopAtClipEnd}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onError={() => setError(true)}
      />

      <div className="flex flex-col items-center">
        <p className="mb-4 text-lg font-bold text-blue-950 dark:text-blue-50">
          A que comarca corresponde este sotaque?
        </p>

        <button
          type="button"
          onClick={togglePlayback}
          className="flex h-16 w-16 flex-none items-center justify-center rounded-full bg-blue-600 text-2xl text-white shadow-md transition hover:bg-blue-700 active:scale-95 dark:bg-blue-600 dark:hover:bg-blue-500"
          aria-label={
            isPlaying
              ? "Pausar a amostra"
              : hasEnded
              ? "Ouvir novamente"
              : "Ouvir a amostra"
          }
        >
          {isPlaying ? "❚❚" : hasEnded ? "↻" : "▶"}
        </button>

        <div className="mt-4 w-full">
          <div
            className="mx-auto h-2 max-w-sm overflow-hidden rounded-full bg-blue-100 dark:bg-slate-700"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={clipDuration}
            aria-valuenow={Math.min(clipDuration, elapsed)}
          >
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-150 dark:bg-blue-400"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mx-auto mt-1 flex max-w-sm justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{formatTime(elapsed)}</span>
            <span>{formatTime(clipDuration)}</span>
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-3 rounded bg-red-100 p-2 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
          Nom foi possível carregar o áudio. Verifica a ligaçom e tenta
          novamente.
        </p>
      )}
    </section>
  );
}
