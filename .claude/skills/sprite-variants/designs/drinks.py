"""Builds collection/icons_drinks.png: mead (the clay jug as is) and brandy (the wine glass with amber in it).

Layout (16px cells, 1-indexed): mead icon r2 c1, texture r1-2 c2-3; brandy icon r2 c4, texture r1-2 c5-6.
"""
import colorsys
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[4]
SPRITES = ROOT / "client/public/assets/sprites"

AMBER_LO, AMBER_HI = (104, 46, 14), (232, 150, 54)


def amber(img):
    out = img.copy()
    px = out.load()
    for y in range(out.height):
        for x in range(out.width):
            r, g, b, a = px[x, y]
            if not a:
                continue
            h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
            if s > 0.3 and (h < 0.06 or h > 0.85):
                t = max(0.0, min(1.0, (l - 0.15) / 0.45))
                px[x, y] = tuple(round(AMBER_LO[i] + (AMBER_HI[i] - AMBER_LO[i]) * t) for i in range(3)) + (a,)
    return out


def build(out_path):
    icons = Image.open(SPRITES / "collection/icons8.png").convert("RGBA")
    jug_icon = icons.crop((33 * 16, 7 * 16, 34 * 16, 8 * 16))
    jug = icons.crop((34 * 16, 6 * 16, 36 * 16, 8 * 16))
    glass_icon = icons.crop((21 * 16, 11 * 16, 22 * 16, 12 * 16))
    glass = icons.crop((22 * 16, 10 * 16, 24 * 16, 12 * 16))

    sheet = Image.new("RGBA", (6 * 16, 2 * 16))
    sheet.paste(jug_icon, (0, 16))
    sheet.paste(jug, (16, 0))
    sheet.paste(amber(glass_icon), (48, 16))
    sheet.paste(amber(glass), (64, 0))
    sheet.save(out_path)


if __name__ == "__main__":
    build(sys.argv[1] if len(sys.argv) > 1 else SPRITES / "collection/icons_drinks.png")
