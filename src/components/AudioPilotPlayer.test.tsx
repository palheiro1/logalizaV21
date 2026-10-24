import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, vi } from "vitest";
import { getAudioSampleById } from "../domain/audioSamples";
import { AudioPilotPlayer } from "./AudioPilotPlayer";

const sample = getAudioSampleById("ago-120")!;
const fallback = <img src="/clue.jpg" alt="Pista visual alternativa" />;

beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {});
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
});

afterEach(() => vi.restoreAllMocks());

test("keeps a working recording within its selected interval", async () => {
  const { container } = render(<AudioPilotPlayer sample={sample} fallback={fallback} />);
  const audio = container.querySelector("audio")!;
  fireEvent.loadedMetadata(audio);
  expect(audio.currentTime).toBe(sample.clipStart);
  fireEvent.click(screen.getByRole("button", { name: "Ouvir a amostra" }));
  await screen.findByRole("button", { name: "Pausar a amostra" });
  expect(screen.queryByRole("img")).not.toBeInTheDocument();

  audio.currentTime = sample.clipEnd;
  fireEvent.timeUpdate(audio);
  expect(audio.pause).toHaveBeenCalled();
  expect(audio.currentTime).toBe(sample.clipStart);
  expect(screen.getByRole("button", { name: "Ouvir novamente" })).toBeInTheDocument();
});

test("shows the visual clue on media failure and reloads the source when retried", async () => {
  const { container } = render(<AudioPilotPlayer sample={sample} fallback={fallback} />);
  const audio = container.querySelector("audio")!;
  fireEvent.error(audio);
  expect(screen.getByRole("img", { name: "Pista visual alternativa" })).toBeVisible();
  expect(screen.getByRole("status")).toHaveTextContent("sem perder tentativas");
  const initialLoads = vi.mocked(audio.load).mock.calls.length;

  fireEvent.click(screen.getByRole("button", { name: "Tentar carregar o áudio novamente" }));
  await screen.findByRole("button", { name: "Pausar a amostra" });
  expect(audio.load).toHaveBeenCalledTimes(initialLoads + 1);
  expect(audio.currentTime).toBe(sample.clipStart);
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
});

test("also offers the visual clue when play rejects without a media error event", async () => {
  vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValue(new Error("Network failure"));
  render(<AudioPilotPlayer sample={sample} fallback={fallback} />);
  fireEvent.click(screen.getByRole("button", { name: "Ouvir a amostra" }));
  await waitFor(() => expect(screen.getByRole("img")).toBeVisible());
  expect(screen.getByRole("button", { name: "Tentar carregar o áudio novamente" })).toBeInTheDocument();
});

test("clears the previous failure when the sample changes and supports players without a visual clue", () => {
  const view = render(<AudioPilotPlayer sample={sample} />);
  fireEvent.error(view.container.querySelector("audio")!);
  expect(screen.getByRole("status")).toHaveTextContent("Tenta carregar o áudio novamente");
  expect(screen.queryByText(/Podes continuar a jogar/)).not.toBeInTheDocument();

  const nextSample = getAudioSampleById("ccg-388")!;
  view.rerender(<AudioPilotPlayer sample={nextSample} />);
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  expect(view.container.querySelector("audio")).toHaveAttribute("src", nextSample.audioUrl);
});
