"""Builds collection/icons_wool_cloak.png: the red cape as an undyed wool cloak, with a fleece texture and a fluffy edge.

Layout (16px cells, 1-indexed): wool cloak icon r2 c1, texture r1-2 c2-3.
"""
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[4]
SPRITES = ROOT / "client/public/assets/sprites"

OUTLINE = (60, 44, 36)
RAMP = [(128, 108, 84), (156, 136, 108), (182, 164, 134), (204, 188, 158), (222, 208, 180)]
CURL_LIGHT = (236, 226, 202)
CURL_DARK = (166, 148, 122)
TRIM = {(59, 69, 94): (60, 44, 36), (110, 123, 157): (214, 208, 192)}
FLEECE = [(214, 208, 192), (232, 228, 214), (248, 246, 236)]


def luma(c):
    return 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]


def is_trim(c):
    return c[2] > c[0] + 10


def wool(src, curls):
    w, h = src.size
    px = src.load()
    out = Image.new("RGBA", (w, h))
    o = out.load()
    solid = {(x, y) for y in range(h) for x in range(w) if px[x, y][3] == 255}
    for x, y in solid:
        c = px[x, y][:3]
        if c in TRIM:
            o[x, y] = TRIM[c] + (255,)
        elif is_trim(c):
            l = luma(c)
            o[x, y] = FLEECE[0 if l < 190 else 1 if l < 220 else 2] + (255,)
        elif luma(c) < 50:
            o[x, y] = OUTLINE + (255,)
        else:
            l = (luma(c) - 60) / 90
            o[x, y] = RAMP[max(0, min(len(RAMP) - 1, int(l * len(RAMP))))] + (255,)

    top = min(y for _, y in solid)
    trim_rows = sorted({y for x, y in solid if is_trim(px[x, y][:3]) or px[x, y][:3] in TRIM})
    hem = trim_rows[0] if trim_rows else h

    for x, y in solid:
        if y <= top + (2 if w > 16 else 1) and o[x, y][:3] != OUTLINE:
            o[x, y] = FLEECE[2 if (x + y) % 3 else 1] + (255,)

    lumps = range(0, w, 3)
    bottom = {}
    for x, y in solid:
        bottom[x] = max(bottom.get(x, -1), y)
    for x0 in lumps:
        for x in (x0, x0 + 1):
            if x in bottom and bottom[x] >= hem and bottom[x] + 1 < h:
                o[x, bottom[x] + 1] = OUTLINE + (255,)
                if o[x, bottom[x]][:3] == OUTLINE or o[x, bottom[x]][:3] in TRIM.values():
                    o[x, bottom[x]] = FLEECE[0] + (255,)

    if curls:
        for x, y in solid:
            c = o[x, y][:3]
            if top + 3 < y < hem - 1 and c in RAMP[1:] and y % 3 == 0 and (x + (y // 3) * 2) % 4 == 0:
                o[x, y] = CURL_LIGHT + (255,)
    return out


def build(out_path):
    icons = Image.open(SPRITES / "collection/icons8.png").convert("RGBA")
    sheet = Image.new("RGBA", (3 * 16, 2 * 16))
    sheet.paste(wool(icons.crop((6 * 16, 7 * 16, 7 * 16, 8 * 16)), False), (0, 16))
    sheet.paste(wool(icons.crop((7 * 16, 6 * 16, 9 * 16, 8 * 16)), True), (16, 0))
    sheet.save(out_path)


if __name__ == "__main__":
    build(sys.argv[1] if len(sys.argv) > 1 else SPRITES / "collection/icons_wool_cloak.png")
