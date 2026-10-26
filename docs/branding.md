# Logaliza

The approved identity uses two independent forms. Do not place them together in
one logo lockup: the symbol followed by the name can read as “GLogaliza”.

- **Inside the app:** use the name alone through `BrandWordmark`, including the
  main heading and translated information panels. G and Z are red; the remaining
  letters inherit the light/dark theme. Ordinary mentions stay plain text.
- **Browser and installed-app icons:** use only the G-shaped location marker and
  blue diagonal stripe, with no star and no wordmark.

The approved standalone raster source is `src/assets/brand/logaliza-symbol.png`.
Its generation prompt is recorded alongside it. Regenerate the packaged icons
with `python3 scripts/generate-brand-icons.py` using Pillow. This does not alter
the source artwork.

`public/icons/` contains real 16, 32, 180, 192 and 512 pixel exports. The Apple and
Android icons use opaque white backgrounds. The separate maskable export keeps
the symbol within the circular safe zone described by the
[Web App Manifest specification](https://www.w3.org/TR/appmanifest/#icon-masks).
Browsers apply the platform's final rounded or circular mask.

The root `favicon.ico` and legacy `logo192.png`/`logo512.png` URLs also serve the
new symbol. New icon URLs and a versioned manifest link avoid reusing the old
icon resources; no player storage or caches are cleared. Existing installations
can refresh their icons on the operating system's own schedule.

Increment the icon filename version and HTML manifest/favicon query version
whenever changing the artwork again.
