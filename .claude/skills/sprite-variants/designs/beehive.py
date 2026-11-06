"""Builds effects/beehive.png: a wild paper-comb hive hanging from a branch, 16x20, anchored at its top centre."""
import math
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[4]
OUT = ROOT / "client/public/assets/sprites/effects/beehive.png"

OUTLINE = (74, 44, 30)
STALK = (92, 60, 38)
HOLE = (40, 26, 22)
LIGHT = [(246, 214, 140), (232, 186, 96), (206, 146, 62), (160, 100, 46)]
SEAM = [(212, 160, 80), (190, 128, 52), (164, 104, 44), (128, 78, 38)]

W, H = 16, 20
TOP = 3
BODY = 16


def half(y):
    t = (y + 0.5) / BODY
    return 6.6 * math.sin(math.pi * min(1.0, t * 0.92 + 0.06)) ** 0.55


def build(out_path):
    img = Image.new("RGBA", (W, H))
    px = img.load()
    cx = 7.5
    for y in range(TOP):
        px[7, y] = STALK + (255,)
        if y == TOP - 1:
            px[8, y] = STALK + (255,)
    inside = set()
    for y in range(BODY):
        h = half(y)
        for x in range(W):
            if abs(x - cx) <= h:
                inside.add((x, y))
    for (x, y) in inside:
        edge = any((x + dx, y + dy) not in inside for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))
        if edge:
            c = OUTLINE
        else:
            h = max(half(y), 1)
            u = (x - cx) / h
            shade = 0 if u < -0.45 else 1 if u < 0.15 else 2 if u < 0.6 else 3
            if y > BODY - 4:
                shade = min(3, shade + 1)
            seam = (y % 3) == 0
            c = (SEAM if seam else LIGHT)[shade]
        px[x, y + TOP] = c + (255,)
    for x, y in ((6, 9), (7, 9), (6, 10), (7, 10), (7, 8)):
        px[x, y + TOP] = HOLE + (255,)
    img.save(out_path)


if __name__ == "__main__":
    build(sys.argv[1] if len(sys.argv) > 1 else OUT)
