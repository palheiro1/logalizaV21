import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, vi } from "vitest";
import { AudioPilotPlayer } from "./AudioPilotPlayer";
import { getAudioSampleById } from "../domain/audioSamples";

const sample = getAudioSampleById("ago-120")!;

function setMediaState(audio: HTMLAudioElement, values: Record<string, unknown>) {
  for (const [key, value] of Object.entries(values)) {
    Object.defineProperty(audio, key, { configurable: true, writable: true, value });
  }
}

function loadMetadata(audio: HTMLAudioElement) {
  setMediaState(audio, { readyState: HTMLMediaElement.HAVE_METADATA });
  fireEvent.loadedMetadata(audio);
}

beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(function (this: HTMLAudioElement) {
    setMediaState(this, { readyState: 0, currentTime: 0, error: null, paused: true });
  });
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function (this: HTMLAudioElement) {
    setMediaState(this, { paused: true });
  });
  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (this: HTMLAudioElement) {
    setMediaState(this, { paused: false });
    return Promise.resolve();
  });
});

afterEach(() => vi.restoreAllMocks());

test("plays only the selected interval, pauses, resumes and replays", async () => {
  const view = render(<AudioPilotPlayer sample={sample} />);
  const audio = view.container.querySelector("audio")!;
  loadMetadata(audio);
  expect(audio.currentTime).toBe(20);

  fireEvent.click(screen.getByRole("button", { name: "Ouvir a amostra" }));
  await screen.findByRole("button", { name: "Pausar a amostra" });
  audio.currentTime = 30;
  fireEvent.timeUpdate(audio);
  expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "10");
  fireEvent.click(screen.getByRole("button", { name: "Pausar a amostra" }));
  expect(audio.paused).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Ouvir a amostra" }));
  await screen.findByRole("button", { name: "Pausar a amostra" });
  expect(audio.currentTime).toBe(30);

  audio.currentTime = 45;
  fireEvent.timeUpdate(audio);
  expect(audio.paused).toBe(true);
  expect(audio.currentTime).toBe(20);
  expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "25");
  // Seeking back after the clip ends also dispatches timeupdate in a browser.
  fireEvent.timeUpdate(audio);
  expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "25");
  fireEvent.click(screen.getByRole("button", { name: "Ouvir novamente" }));
  await screen.findByRole("button", { name: "Pausar a amostra" });
  expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
});

test("reloads failed media on retry and seeks after metadata becomes available", async () => {
  const view = render(<AudioPilotPlayer sample={sample} />);
  const audio = view.container.querySelector("audio")!;
  setMediaState(audio, { error: { code: 4 } });
  fireEvent.error(audio);
  expect(screen.getByRole("alert")).toBeVisible();
  expect(audio.load).toHaveBeenCalledTimes(1);

  fireEvent.click(screen.getByRole("button", { name: "Tentar carregar o áudio novamente" }));
  expect(audio.load).toHaveBeenCalledTimes(2);
  expect(audio.currentTime).toBe(0);
  loadMetadata(audio);
  expect(audio.currentTime).toBe(20);
  await screen.findByRole("button", { name: "Pausar a amostra" });
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

test("shows an honest error when play rejects and allows another attempt", async () => {
  vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValue(new Error("Unavailable media"));
  render(<AudioPilotPlayer sample={sample} />);
  fireEvent.click(screen.getByRole("button", { name: "Ouvir a amostra" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("O áudio está indisponível");
  fireEvent.click(screen.getByRole("button", { name: "Tentar carregar o áudio novamente" }));
  await screen.findByRole("alert");
  expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2);
  expect(HTMLMediaElement.prototype.load).toHaveBeenCalledTimes(2);
});

test("stops the playing state when a network error arrives during playback", async () => {
  const view = render(<AudioPilotPlayer sample={sample} />);
  const audio = view.container.querySelector("audio")!;
  loadMetadata(audio);
  fireEvent.click(screen.getByRole("button", { name: "Ouvir a amostra" }));
  await screen.findByRole("button", { name: "Pausar a amostra" });
  fireEvent.error(audio);
  expect(audio.paused).toBe(true);
  expect(screen.getByRole("button", { name: "Tentar carregar o áudio novamente" })).toBeVisible();
});

test("catches seek failures as recoverable playback errors", () => {
  const view = render(<AudioPilotPlayer sample={sample} />);
  const audio = view.container.querySelector("audio")!;
  Object.defineProperty(audio, "currentTime", {
    configurable: true,
    get: () => 0,
    set: () => { throw new Error("Cannot seek yet"); },
  });
  loadMetadata(audio);
  expect(screen.getByRole("alert")).toBeVisible();
});

test("ignores an old play promise when the sample changes", async () => {
  let reject!: (error: Error) => void;
  vi.mocked(HTMLMediaElement.prototype.play).mockReturnValue(new Promise((_, fail) => { reject = fail; }));
  const view = render(<AudioPilotPlayer sample={sample} />);
  fireEvent.click(screen.getByRole("button", { name: "Ouvir a amostra" }));
  view.rerender(<AudioPilotPlayer sample={getAudioSampleById("ccg-388")!} />);
  await act(async () => reject(new Error("Previous request aborted")));
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Ouvir a amostra" })).toBeVisible();
});

test("clears the error and progress when switching samples", async () => {
  const view = render(<AudioPilotPlayer sample={sample} />);
  fireEvent.error(view.container.querySelector("audio")!);
  view.rerender(<AudioPilotPlayer sample={getAudioSampleById("ccg-388")!} />);
  await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
  expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
});
