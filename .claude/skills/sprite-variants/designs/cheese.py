"""Builds collection/icons_cheese.png: a wedge of hard cheese, drawn in the item palette.

Layout (16px cells, 1-indexed): cheese icon r2 c1, texture r1-2 c2-3.
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[4]
OUT = ROOT / "client/public/assets/sprites/collection/icons_cheese.png"

OUTLINE = (98, 58, 32)
TOP = (250, 222, 120)
TOP_LIT = (255, 240, 170)
SIDE = (226, 156, 52)
SIDE_DARK = (194, 124, 42)
HOLE = (160, 94, 34)
HOLE_TOP = (226, 182, 84)


def wedge(size):
    k = size / 32
    p = lambda pts: [(round(x * k), round(y * k)) for x, y in pts]
    img = Image.new("RGBA", (size, size))
    d = ImageDraw.Draw(img)
    top = p([(3, 21), (20, 7), (29, 12), (5, 22)])
    side = p([(3, 21), (5, 22), (29, 12), (29, 21), (4, 26)])
    d.polygon(side, fill=SIDE + (255,))
    d.polygon(p([(4, 24), (29, 17), (29, 21), (4, 26)]), fill=SIDE_DARK + (255,))
    d.polygon(top, fill=TOP + (255,))
    d.line(p([(8, 17), (19, 9)]), fill=TOP_LIT + (255,))
    d.line(p([(6, 22), (28, 12)]), fill=TOP_LIT + (255,))
    holes_side = [(12, 21, 2), (21, 18, 2), (26, 16, 1), (16, 23, 1)] if size > 16 else [(11, 21, 2), (22, 17, 2)]
    for x, y, r in holes_side:
        cx, cy, rr = x * k, y * k, max(1, r * k)
        d.ellipse((round(cx - rr), round(cy - rr * 0.8), round(cx + rr) - 1, round(cy + rr * 0.8)), fill=HOLE + (255,))
    if size > 16:
        for x, y in ((17, 12), (23, 11)):
            d.rectangle((x, y, x + 1, y), fill=HOLE_TOP + (255,))
    px = img.load()
    solid = {(x, y) for y in range(size) for x in range(size) if px[x, y][3]}
    for x, y in solid:
        if any((x + dx, y + dy) not in solid for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
            px[x, y] = OUTLINE + (255,)
    return img


def build(out_path):
    sheet = Image.new("RGBA", (3 * 16, 2 * 16))
    sheet.paste(wedge(16), (0, 16))
    sheet.paste(wedge(32), (16, 0))
    sheet.save(out_path)


if __name__ == "__main__":
    build(sys.argv[1] if len(sys.argv) > 1 else OUT)
