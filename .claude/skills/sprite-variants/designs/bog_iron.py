"""Builds collection/bog_iron.png: mossy rock 8 with iron ore glints, the swamp's iron source.

Glints copy the iron ore item: short up-right streaks stepping dark blue-grey to a pale highlight,
each pixel with a dark underside. Only rock pixels (low saturation) take a glint.
"""
import colorsys
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[4]
SPRITES = ROOT / "client/public/assets/sprites"

STEPS = [(80, 92, 126), (123, 158, 194), (148, 193, 223)]
UNDER = (37, 44, 54)
STREAKS = [(22, 19, 3), (14, 30, 3), (32, 24, 3), (25, 35, 3), (17, 26, 2)]


def rock(px, x, y):
    r, g, b, a = px[x, y]
    if a < 255:
        return False
    _, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
    return s < 0.2 and l > 0.15


def build(out_path):
    nature = Image.open(SPRITES / "nature.png").convert("RGBA")
    src = nature.crop((9 * 16, 72 * 16, 12 * 16, 75 * 16))
    base = src.copy()
    px, bx = src.load(), base.load()

    for sx, sy, length in STREAKS:
        for k in range(length):
            x, y = sx + k, sy - k
            if not rock(bx, x, y):
                continue
            step = STEPS[min(len(STEPS) - 1, round(k * (len(STEPS) - 1) / max(1, length - 1)))]
            px[x, y] = step + (255,)
            if rock(bx, x + 1, y):
                px[x + 1, y] = STEPS[max(0, STEPS.index(step) - 1)] + (255,)
            for ux in (x, x + 1):
                if rock(bx, ux, y + 1) and px[ux, y + 1][:3] not in STEPS:
                    px[ux, y + 1] = UNDER + (255,)

    src.save(out_path)


if __name__ == "__main__":
    build(sys.argv[1] if len(sys.argv) > 1 else SPRITES / "collection/bog_iron.png")
