import React from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { expect, vi } from "vitest";
import "../i18n";
import { useAppInstall } from "../hooks/useAppInstall";
import { AppInstallBanner } from "./AppInstallBanner";

vi.mock("../hooks/useAppInstall", () => ({ useAppInstall: vi.fn() }));

let installState: ReturnType<typeof useAppInstall>;

beforeEach(() => {
  installState = {
    visible: true,
    mode: "ios",
    isInstalling: false,
    install: vi.fn().mockResolvedValue(undefined),
    dismiss: vi.fn(),
  };
  vi.mocked(useAppInstall).mockReturnValue(installState);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

test.each([
  ["ios", /menu Partilhar/, /Safari/],
  ["android", /menu do navegador/, /Chrome/],
] as const)("provides accessible, optional manual instructions for %s", (mode, firstStep, browserHelp) => {
  vi.mocked(useAppInstall).mockReturnValue({ ...installState, mode });
  render(<AppInstallBanner />);
  const offer = screen.getByRole("region", { name: "Instala o LoGaliza" });
  const toggle = within(offer).getByRole("button", { name: "Como instalar" });
  expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect(screen.getByText(firstStep)).not.toBeVisible();

  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute("aria-expanded", "true");
  const instructions = document.getElementById(toggle.getAttribute("aria-controls")!)!;
  expect(instructions).toBeVisible();
  expect(within(instructions).getAllByRole("listitem")).toHaveLength(3);
  expect(within(instructions).getByText(firstStep)).toBeVisible();
  expect(within(instructions).getByText(browserHelp)).toBeVisible();

  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect(instructions).not.toBeVisible();
});

test("dismisses the offer without opening an installation prompt", () => {
  const state = installState;
  const view = render(<AppInstallBanner />);
  fireEvent.click(screen.getByRole("button", { name: "Agora nom" }));
  expect(state.dismiss).toHaveBeenCalledTimes(1);
  expect(state.install).not.toHaveBeenCalled();
  vi.mocked(useAppInstall).mockReturnValue({ ...state, visible: false });
  view.rerender(<AppInstallBanner />);
  expect(screen.queryByRole("region")).not.toBeInTheDocument();
});

test("only invokes native installation after the button is clicked and disables it while opening", () => {
  const state = { ...installState, mode: "native" as const };
  vi.mocked(useAppInstall).mockReturnValue(state);
  const view = render(<AppInstallBanner />);
  expect(state.install).not.toHaveBeenCalled();
  expect(screen.queryByRole("button", { name: "Como instalar" })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Instalar" }));
  expect(state.install).toHaveBeenCalledTimes(1);
  vi.mocked(useAppInstall).mockReturnValue({ ...state, isInstalling: true });
  view.rerender(<AppInstallBanner />);
  const opening = screen.getByRole("button", { name: "A abrir…" });
  expect(opening).toBeDisabled();
  fireEvent.click(opening);
  expect(state.install).toHaveBeenCalledTimes(1);
});
