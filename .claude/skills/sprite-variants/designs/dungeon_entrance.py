"""Builds collection/swamp_dungeon_entrance.png from collection/dungeon_entrance_source.png.

The entrance only stands in the swamp, so it takes the swamp meadow grade (as the swamp trees do),
moss creeping down the wall from the roof in uneven drips, moss clumps along the foot of the wall,
and a mossy fringe on the ground around its base.
"""
import colorsys
import random
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[4]
COLLECTION = ROOT / "client/public/assets/sprites/collection"
SATURATION, TINT, BRIGHTNESS = 0.62, (1.1, 1.0, 0.7), 0.92
MOSS = [(52, 78, 52), (81, 116, 77), (98, 137, 84), (132, 172, 96)]
SEED = 4


def hls(p):
    return colorsys.rgb_to_hls(p[0] / 255, p[1] / 255, p[2] / 255)


def stone(p):
    if p[3] < 255:
        return False
    h, l, s = hls(p)
    return 200 <= h * 360 <= 280 and l > 0.14


def green(p):
    if p[3] < 255:
        return False
    h, _, s = hls(p)
    return 70 <= h * 360 <= 140 and s > 0.15


def moss_for(p):
    _, l, _ = hls(p)
    return MOSS[min(len(MOSS) - 1, max(1, int((l - 0.14) / 0.1) + 1))]


def graded(p):
    r, g, b, a = p
    l = 0.299 * r + 0.587 * g + 0.114 * b
    return tuple(max(0, min(255, round((l + (c - l) * SATURATION) * t * BRIGHTNESS))) for c, t in zip((r, g, b), TINT)) + (a,)


def smooth(rng, n, lo, hi, period):
    knots = [rng.uniform(lo, hi) for _ in range(n // period + 2)]
    out = []
    for x in range(n):
        k, f = divmod(x / period, 1)
        a, b = knots[int(k)], knots[int(k) + 1]
        f = f * f * (3 - 2 * f)
        out.append(a + (b - a) * f)
    return out


def build(out_path):
    rng = random.Random(SEED)
    src = Image.open(COLLECTION / "dungeon_entrance_source.png").convert("RGBA")
    w, h = src.size
    base = src.load()
    out = src.copy()
    px = out.load()
    moss = set()

    drips = smooth(rng, w, 0, 3.5, 3)
    for x in range(w):
        rim = next((y for y in range(h) if green(base[x, y]) and y + 1 < h and stone(base[x, y + 1])), None)
        if rim is None:
            continue
        length = round(drips[x] + (rng.choice([0, 0, 0, 0, 3]) if drips[x] > 2.5 else 0))
        for y in range(rim + 1, min(h, rim + 1 + length)):
            if stone(base[x, y]):
                moss.add((x, y))

    band = smooth(rng, w + h, 0, 1.6, 4)
    for y in range(h):
        for x in range(w):
            if not stone(base[x, y]):
                continue
            reach = round(band[(x + y) % len(band)])
            if reach and any(
                green(base[x + dx, y + dy])
                for dx in range(-reach, reach + 1)
                for dy in range(-reach, reach + 1)
                if 0 <= x + dx < w and 0 <= y + dy < h
            ):
                moss.add((x, y))

    foot = max(y for y in range(h) for x in range(w) if stone(base[x, y]))
    rise = smooth(rng, w, 0, 6, 5)
    for x in range(w):
        for y in range(foot - round(rise[x]), foot + 1):
            if 0 <= y < h and stone(base[x, y]):
                moss.add((x, y))

    for _ in range(4):
        cx, cy = rng.randrange(w), rng.randrange(h)
        r = rng.uniform(1.2, 2.0)
        for y in range(int(cy - r), int(cy + r) + 1):
            for x in range(int(cx - r), int(cx + r) + 1):
                if 0 <= x < w and 0 <= y < h and (x - cx) ** 2 + (y - cy) ** 2 <= r * r and stone(base[x, y]):
                    moss.add((x, y))

    for x, y in moss:
        above = (x, y - 1) in moss or (y > 0 and green(base[x, y - 1]))
        below = (x, y + 1) in moss
        px[x, y] = ((MOSS[2] if above else MOSS[3]) if below else MOSS[1]) + (255,)

    walls = [(x, y) for y in range(h) for x in range(w) if stone(base[x, y]) and y > foot - 14]
    spread = smooth(rng, w + h, 1, 5, 6)
    fringe = set()
    for y in range(h):
        for x in range(w):
            if base[x, y][3] == 255:
                continue
            d = min((max(abs(x - sx), abs(y - sy)) for sx, sy in walls if abs(x - sx) <= 6 and abs(y - sy) <= 6), default=99)
            if 1 <= d <= spread[x if y > foot else y]:
                fringe.add((x, y))
    for x, y in fringe:
        edge = (x, y + 1) not in fringe or (x - 1, y) not in fringe or (x + 1, y) not in fringe
        px[x, y] = (MOSS[1] if edge else MOSS[2]) + (255,)

    for y in range(h):
        for x in range(w):
            if px[x, y][3]:
                px[x, y] = graded(px[x, y])

    out.save(out_path)


if __name__ == "__main__":
    build(sys.argv[1] if len(sys.argv) > 1 else COLLECTION / "swamp_dungeon_entrance.png")
