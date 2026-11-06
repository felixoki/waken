"""Builds collection/swamp_herbs.png: valerian and bog myrtle, recoloured to their real colours.

Layout (16px cells, 1-indexed): valerian icon r2 c1, texture r1-2 c2-3;
bog myrtle icon r2 c4, texture r1-2 c5-6.
"""
import colorsys
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[4]
SPRITES = ROOT / "client/public/assets/sprites"
FLOWERS = Path("/Users/felixoconnor/Documents/private/sprites/herbalist/Tiled_files/Flowers_alternative_fit.png")
BUSHES = Path("/Users/felixoconnor/Documents/private/sprites/bushes/PNG/Assets_texture_shadow_source.png")

PINK = [(120, 72, 92), (196, 140, 160), (236, 200, 212), (252, 236, 240)]
AMBER = [(92, 50, 24), (156, 92, 38), (206, 138, 58), (238, 186, 102)]


def ramp(colors, t):
    t = max(0.0, min(1.0, t)) * (len(colors) - 1)
    i = min(int(t), len(colors) - 2)
    f = t - i
    return tuple(round(a + (b - a) * f) for a, b in zip(colors[i], colors[i + 1]))


def recolour(img, hues, colors, lo=0.15, hi=0.85, least=0.25):
    out = img.copy()
    px = out.load()
    for y in range(out.height):
        for x in range(out.width):
            r, g, b, a = px[x, y]
            if not a:
                continue
            h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
            if s < least or not any(h0 <= h * 360 <= h1 for h0, h1 in hues):
                continue
            px[x, y] = ramp(colors, (l - lo) / (hi - lo)) + (a,)
    return out


def build(out_path):
    flowers = Image.open(FLOWERS).convert("RGBA")
    bushes = Image.open(BUSHES).convert("RGBA")
    nature = Image.open(SPRITES / "nature.png").convert("RGBA")

    valerian = recolour(flowers.crop((0, 48, 32, 80)), [(0, 55)], PINK)
    myrtle = recolour(bushes.crop((320, 48, 352, 80)), [(180, 260)], AMBER)
    sprig = nature.crop((6 * 16, 12 * 16, 7 * 16, 13 * 16))
    valerian_icon = recolour(sprig, [(220, 360)], PINK, 0.05, 0.8, 0.08)
    myrtle_icon = recolour(sprig, [(220, 360)], AMBER, 0.05, 0.8, 0.08)

    sheet = Image.new("RGBA", (6 * 16, 2 * 16))
    sheet.paste(valerian_icon, (0, 16))
    sheet.paste(valerian, (16, 0))
    sheet.paste(myrtle_icon, (48, 16))
    sheet.paste(myrtle, (64, 0))
    sheet.save(out_path)


if __name__ == "__main__":
    build(sys.argv[1] if len(sys.argv) > 1 else SPRITES / "collection/swamp_herbs.png")
