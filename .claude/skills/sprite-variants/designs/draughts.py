"""Builds collection/icons_draughts.png: Undertow, Vigil and To the Marrow, recoloured from Giant's Stalk.

Layout (16px cells, 1-indexed): undertow icon r2 c1, texture r1-2 c2-3;
vigil icon r2 c4, texture r1-2 c5-6; to the marrow icon r2 c7, texture r1-2 c8-9.
"""
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[4]
SPRITES = ROOT / "client/public/assets/sprites"

LIQUID = [
    (46, 78, 101),
    (57, 117, 138),
    (54, 133, 142),
    (57, 164, 156),
    (53, 194, 157),
    (48, 212, 135),
    (45, 229, 114),
]

RAMPS = {
    "undertow": [
        (40, 28, 70),
        (62, 40, 106),
        (76, 50, 132),
        (96, 62, 162),
        (120, 82, 194),
        (146, 108, 220),
        (176, 140, 238),
    ],
    "vigil": [
        (76, 24, 56),
        (110, 34, 80),
        (130, 42, 94),
        (158, 54, 110),
        (188, 74, 128),
        (214, 102, 150),
        (236, 140, 178),
    ],
    "marrow": [
        (88, 74, 62),
        (126, 108, 88),
        (144, 126, 102),
        (168, 150, 122),
        (194, 178, 148),
        (216, 202, 172),
        (238, 228, 204),
    ],
}

TEXTURE = (16 * 16, 20 * 16, 18 * 16, 22 * 16)
ICON = (15 * 16, 21 * 16, 16 * 16, 22 * 16)


def recolour(img, ramp):
    lookup = dict(zip(LIQUID, ramp))
    out = img.copy()
    px = out.load()
    for y in range(out.height):
        for x in range(out.width):
            r, g, b, a = px[x, y]
            if a and (r, g, b) in lookup:
                px[x, y] = lookup[(r, g, b)] + (a,)
    return out


def build(out_path):
    items = Image.open(SPRITES / "items.png").convert("RGBA")
    texture = items.crop(TEXTURE)
    icon = items.crop(ICON)

    sheet = Image.new("RGBA", (9 * 16, 2 * 16))
    for i, name in enumerate(["undertow", "vigil", "marrow"]):
        sheet.paste(recolour(icon, RAMPS[name]), (i * 48, 16))
        sheet.paste(recolour(texture, RAMPS[name]), (i * 48 + 16, 0))
    sheet.save(out_path)


if __name__ == "__main__":
    build(sys.argv[1] if len(sys.argv) > 1 else SPRITES / "collection/icons_draughts.png")
