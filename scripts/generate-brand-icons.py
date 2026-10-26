"""Package the approved starless symbol as app/browser icons (requires Pillow).

Run from any directory: python3 scripts/generate-brand-icons.py
The source artwork is preserved; only transparent padding, scale, background
and file formats are adapted to each platform.
"""

from math import sqrt
from pathlib import Path
from shutil import copyfile

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
ICONS = PUBLIC / "icons"
SOURCE = ROOT / "src/assets/brand/logaliza-symbol.png"


def load_symbol():
    source = Image.open(SOURCE).convert("RGBA")
    # Ignore near-invisible alpha noise when measuring the artwork's clear space.
    bounds = source.getchannel("A").point(lambda alpha: 255 if alpha > 16 else 0).getbbox()
    if bounds is None:
        raise ValueError("The source symbol is empty")
    return source.crop(bounds)


def icon(symbol, size, *, maskable=False, favicon=False):
    scale = size * (0.9 if favicon else 0.82) / max(symbol.size)
    if maskable:
        center_x, center_y = symbol.width / 2, symbol.height / 2
        radius = sqrt(max(
            (index % symbol.width - center_x) ** 2
            + (index // symbol.width - center_y) ** 2
            for index, alpha in enumerate(symbol.getchannel("A").getdata())
            if alpha > 16
        ))
        # Stay inside the manifest specification's 40% circular safe zone.
        scale = min(scale, size * 0.38 / radius)
    artwork = symbol.resize(
        (round(symbol.width * scale), round(symbol.height * scale)),
        Image.Resampling.LANCZOS,
    )
    # Opaque white keeps the dark symbol readable on dark browser toolbars and
    # gives iOS/Android a full-bleed background for their own icon masks.
    tile = Image.new("RGBA", (size, size), "white")
    tile.alpha_composite(artwork, ((size - artwork.width) // 2, (size - artwork.height) // 2))
    return tile.convert("RGB")


def main():
    ICONS.mkdir(parents=True, exist_ok=True)
    symbol = load_symbol()
    for size in (192, 512):
        icon(symbol, size).save(ICONS / f"logaliza-{size}-v1.png", optimize=True)
        # Preserve legacy URLs for existing installations and bookmarks.
        copyfile(ICONS / f"logaliza-{size}-v1.png", PUBLIC / f"logo{size}.png")
    icon(symbol, 512, maskable=True).save(ICONS / "logaliza-maskable-512-v1.png", optimize=True)
    icon(symbol, 180).save(ICONS / "logaliza-apple-180-v1.png", optimize=True)
    for size in (16, 32):
        icon(symbol, size, favicon=True).save(ICONS / f"logaliza-favicon-{size}-v1.png", optimize=True)
    icon(symbol, 64, favicon=True).save(
        PUBLIC / "favicon.ico", sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64)],
    )
    print("Generated mobile, Apple, maskable and browser icons from the starless symbol.")


if __name__ == "__main__":
    main()
