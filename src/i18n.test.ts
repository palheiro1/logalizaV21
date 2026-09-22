import { vi } from "vitest";

describe("game language", () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
  });

  test("always uses the AGAL translation despite a saved browser language", async () => {
    localStorage.setItem("i18nextLng", "es");

    const { default: i18n, GAME_LANGUAGE } = await import("./i18n");

    expect(GAME_LANGUAGE).toBe("pt");
    expect(i18n.resolvedLanguage).toBe(GAME_LANGUAGE);
    expect(i18n.t("share")).toBe("Compartilhar");
  });

  test("falls back to AGAL if another language is requested", async () => {
    const { default: i18n, GAME_LANGUAGE } = await import("./i18n");

    await i18n.changeLanguage("en");

    expect(i18n.resolvedLanguage).toBe(GAME_LANGUAGE);
    expect(i18n.t("settings.title")).toBe("Configurações");
  });
});
