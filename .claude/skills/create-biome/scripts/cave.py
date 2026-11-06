"""Paint a glowing-cave map (the Nether): cave walls, floor, dark ground and pits.

    /usr/bin/python3 .claude/skills/create-biome/scripts/cave.py nether --pack <Glowing_cave.tmx> --seed 3 [--force]

The layout is decided per tile (wall, floor, pit), then each family is drawn
with the piece grammar of `glowing_cave_ground` (local tile ids):

walls, dark set over floor (layer `walls`, collides):
    rim 281 282 283 (floor north)   body 310, west edge 299/327, east edge 300/328
    face top 337 338 339, face 365 366 367 (floor south), shadow 393 394 395 on the floor below
pits, opaque floor pieces (layer `ground`, the first void row on `pits`):
    above 432 433 434, sides 460/462 (first row) 440/439 (lower rows),
    first void row 461, below 523 436 525
    void pixels in these pieces are transparent; `void` draws the black under every cell that holds one
dark ground, 9-slice 575..633, inner corners 579 580 607 608 (layer `ground_dark`)

Walls need 3 rows between floors (rim, face top, face), pits 3 floor tiles of
clearance, so the layout enforces both.
"""

from __future__ import annotations

import argparse
import math
import re
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[4]
sys.path.insert(0, str(ROOT / ".claude/skills/tiled/scripts"))
from tmx import Map  # noqa: E402

COLS = 28
T = 16
FLOOR, BLACK = 450, 310
PIT_SET = {r * 28 + c for r in range(15, 19) for c in range(28)} - {450}
SHEETS = [("Ground_walls", "ground"), ("Water_coasts", "water"), ("Details", "details"),
          ("Walls_shinies", "shinies"), ("Objects", "objects")]
WALL_BOXES = {
    310: (0, 0, 16, 16), 299: (4, 0, 12, 16), 327: (4, 0, 12, 16), 300: (0, 0, 12, 16), 328: (0, 0, 12, 16),
    281: (4, 4, 12, 12), 282: (0, 4, 16, 12), 283: (0, 4, 12, 12),
    337: (2, 0, 14, 16), 338: (0, 0, 16, 16), 339: (0, 0, 14, 16), 324: (0, 0, 16, 16), 325: (0, 0, 16, 16),
    365: (2, 0, 14, 12), 366: (0, 0, 16, 14), 367: (0, 0, 14, 12), 352: (0, 0, 16, 14), 353: (0, 0, 16, 14),
}


def noise(rng, shape, waves=6, scale=0.06):
    h, w = shape
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    out = np.zeros(shape, np.float32)
    for _ in range(waves):
        a = rng.uniform(0, math.pi)
        f = scale * rng.uniform(0.6, 1.4)
        out += np.sin((xx * math.cos(a) + yy * math.sin(a)) * f + rng.uniform(0, 6.3))
    return out / waves


def morph(mask, r, grow):
    p = np.pad(mask, r, constant_values=not grow)
    out = np.zeros_like(mask) if grow else np.ones_like(mask)
    h, w = mask.shape
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            win = p[r + dy:r + dy + h, r + dx:r + dx + w]
            out = (out | win) if grow else (out & win)
    return out


def ellipse(shape, cx, cy, rx, ry, wobble=None, amount=0.0, power=2.0):
    h, w = shape
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32) + 0.5
    d = np.abs((xx - cx) / rx) ** power + np.abs((yy - cy) / ry) ** power
    if wobble is not None:
        d = d * (1 - amount * wobble)
    return d <= 1


def capsule(shape, pts, half, wobble, amount):
    h, w = shape
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32) + 0.5
    best = np.full(shape, 1e9, np.float32)
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        dx, dy = x1 - x0, y1 - y0
        t = np.clip(((xx - x0) * dx + (yy - y0) * dy) / (dx * dx + dy * dy), 0, 1)
        best = np.minimum(best, np.hypot(xx - (x0 + t * dx), yy - (y0 + t * dy)))
    return best <= half * (1 + amount * wobble)


def settle(floor: np.ndarray) -> np.ndarray:
    """Fill wall runs too thin to draw: under 3 rows between floors, under 2 columns."""
    f = floor.copy()
    h, w = f.shape
    for _ in range(4):
        changed = False
        for x in range(w):
            y = 0
            while y < h:
                if f[y, x]:
                    y += 1
                    continue
                start = y
                while y < h and not f[y, x]:
                    y += 1
                if start > 0 and y < h and y - start < 3:
                    f[start:y, x] = True
                    changed = True
        for y in range(h):
            x = 0
            while x < w:
                if f[y, x]:
                    x += 1
                    continue
                start = x
                while x < w and not f[y, x]:
                    x += 1
                if start > 0 and x < w and x - start < 2:
                    f[y, start:x] = True
                    changed = True
        for y in range(h):
            x = 0
            while x < w:
                if not f[y, x]:
                    x += 1
                    continue
                start = x
                while x < w and f[y, x]:
                    x += 1
                if x - start < 2:
                    f[y, start:x] = False
                    changed = True
        for x in range(w):
            y = 0
            while y < h:
                if not f[y, x]:
                    y += 1
                    continue
                start = y
                while y < h and f[y, x]:
                    y += 1
                if y - start < 2:
                    f[start:y, x] = False
                    changed = True
        if not changed:
            break
    return f


JUMP = 3
ROOMS = [
    [(42, 101, 10, 6.0, 2.2)],
    [(32, 86, 13, 5.5, 3.0), (17, 83, 6, 4.5, 2.4), (44, 89, 6, 3.0, 2.4)],
    [(48, 71, 12, 4.5, 4.0), (63, 68.5, 5, 4.0, 2.6), (34, 73, 5, 3.0, 2.6)],
]


def reach(walk: np.ndarray, start: tuple[int, int]) -> np.ndarray:
    """Cells reachable on foot, counting straight jumps over up to JUMP void tiles."""
    h, w = walk.shape
    seen = np.zeros_like(walk)
    stack = [start]
    while stack:
        y, x = stack.pop()
        if not (0 <= y < h and 0 <= x < w) or seen[y, x] or not walk[y, x]:
            continue
        seen[y, x] = True
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            for k in range(1, JUMP + 2):
                ny, nx = y + dy * k, x + dx * k
                if not (0 <= ny < h and 0 <= nx < w):
                    break
                if walk[ny, nx]:
                    stack.append((ny, nx))
                    break
    return seen


def tidy(void: np.ndarray, allowed: np.ndarray) -> np.ndarray:
    """No floor strip one tile thick between voids, no voids touching only at a corner."""
    v = void & allowed
    h, w = v.shape
    for _ in range(6):
        changed = False
        for y in range(h):
            for x in range(w):
                if v[y, x] or not allowed[y, x]:
                    continue
                if (0 < x < w - 1 and v[y, x - 1] and v[y, x + 1]) or (0 < y < h - 1 and v[y - 1, x] and v[y + 1, x]):
                    v[y, x] = True
                    changed = True
        for y in range(h - 1):
            for x in range(w - 1):
                a, b, c, d = v[y, x], v[y, x + 1], v[y + 1, x], v[y + 1, x + 1]
                if (a and d and not b and not c) or (b and c and not a and not d):
                    for yy, xx in ((y, x + 1), (y + 1, x), (y, x), (y + 1, x + 1)):
                        if not v[yy, xx] and allowed[yy, xx]:
                            v[yy, xx] = True
                            changed = True
                            break
        if not changed:
            break
    return v


def layout(w, h, seed):
    rng = np.random.default_rng(seed)
    hw, hh = w // 2, h // 2
    coarse = (hh, hw)
    s = 0.5
    floor = ellipse(coarse, 41 * s, 36 * s, 30 * s, 26 * s, noise(rng, coarse, 7, 0.35), 0.45, power=3.2)
    border = np.zeros(coarse, bool)
    border[3:hh - 2, 2:hw - 2] = True
    floor &= border
    floor = morph(morph(floor, 1, True), 1, False) & border
    full = np.zeros((h, w), bool)
    up = np.kron(floor, np.ones((2, 2), bool))
    full[:up.shape[0], :up.shape[1]] = up
    shape = (h, w)
    rooms = []
    for parts in ROOMS:
        r = np.zeros(shape, bool)
        for cx, cy, rx, ry, pw in parts:
            r |= ellipse(shape, cx, cy, rx, ry, noise(rng, shape, 6, 0.25), 0.25, power=pw)
        rooms.append(r)
        full |= r
    floor = settle(full)
    spawn = (ROOMS[0][0][0], ROOMS[0][0][1] + 2)

    chasms = []
    regions = [rooms[0], rooms[1], rooms[2], floor & ~(rooms[0] | rooms[1] | rooms[2])]
    for lower, upper in zip(regions, regions[1:]):
        lo = lower & floor
        up_ = upper & floor
        cols = [x for x in range(w) if lo[:, x].any() and up_[:, x].any()]
        cols = cols[2:-2]
        if len(cols) > 14:
            mid = (cols[0] + cols[-1]) // 2
            cols = list(range(mid - 7, mid + 7))
        top = max(int(np.where(up_[:, x])[0].max()) for x in cols) + 1
        bottom = min(int(np.where(lo[:, x])[0].min()) for x in cols)
        floor[top:bottom, cols[0]:cols[-1] + 1] = True
        tall = int(rng.integers(2, 4))
        mid = (top + bottom) // 2
        c0 = max(top, mid - tall // 2)
        chasm = np.zeros(shape, bool)
        chasm[c0:c0 + tall, cols[0]:cols[-1] + 1] = True
        floor |= chasm
        chasms.append(chasm)
    floor = settle(floor)

    allowed = floor & ~morph(~floor, 2, True)
    allowed[:-2] &= ~(~floor)[2:]
    allowed &= ~ellipse(shape, 41, 33, 9, 7)
    for r in rooms:
        allowed &= ~morph(r, 3, True)

    void = np.zeros(shape, bool)
    wob = lambda: noise(rng, shape, 5, 0.3)

    for _ in range(2):
        y0 = rng.uniform(44, 52)
        pts = [(rng.uniform(8, 14), y0)]
        for x in (24, 36, 48, 60, 74):
            pts.append((x + rng.uniform(-2, 2), pts[-1][1] + rng.uniform(-5, 5)))
        void |= capsule(shape, pts, rng.uniform(0.9, 1.4), wob(), 0.5)
        break
    pts = [(rng.uniform(26, 34), 8.0)]
    for y in (14, 20, 26):
        pts.append((pts[-1][0] + rng.uniform(-4, 2), y + rng.uniform(-1, 1)))
    void |= capsule(shape, pts, rng.uniform(0.8, 1.2), wob(), 0.5)
    pts = [(rng.uniform(56, 62), 22.0)]
    for y in (28, 34):
        pts.append((pts[-1][0] + rng.uniform(-2, 4), y))
    void |= capsule(shape, pts, rng.uniform(0.7, 1.0), wob(), 0.4)

    for cx, cy in [(20, 34), (58, 38), (24, 16), (50, 14), (66, 28), (16, 44)]:
        rx, ry = rng.uniform(1.6, 3.6), rng.uniform(1.4, 2.8)
        void |= ellipse(shape, cx + rng.uniform(-2, 2), cy + rng.uniform(-2, 2), rx, ry, wob(), 0.5)
    for _ in range(4):
        cx, cy = rng.uniform(14, 68), rng.uniform(10, 56)
        if rng.random() < 0.5:
            void[int(cy), int(cx - rng.integers(2, 4)):int(cx + rng.integers(2, 4))] = True
        else:
            void[int(cy - rng.integers(2, 4)):int(cy + rng.integers(2, 4)), int(cx)] = True

    void = tidy(void, allowed)

    inside = floor & ~morph(~floor, 2, True)
    inside[:-2] &= ~(~floor)[2:]
    feature = ellipse(shape, 31, 86, 3.4, 1.8, wob(), 0.4)
    feature |= ellipse(shape, 36, 85, 1.6, 1.4, wob(), 0.3)
    for k, x in enumerate((44, 48, 52)):
        feature[70 + (k % 2):72 + (k % 2) + 1, x] = True
    void |= tidy(feature, inside & (rooms[1] | rooms[2]))
    for chasm in chasms:
        void |= chasm
    walk = floor & ~void
    seen = reach(walk, (spawn[1], spawn[0]))
    if not seen[33, 41]:
        sys.exit("arena centre unreachable from spawn, even with jumps; try another --seed")
    lost = walk & ~seen
    if lost.sum():
        void = tidy(void | lost, allowed | lost)
    return floor, void, spawn


def paint_walls(floor: np.ndarray, rng) -> np.ndarray:
    h, w = floor.shape
    F = lambda x, y: 0 <= x < w and 0 <= y < h and bool(floor[y, x])
    out = np.full((h, w), -1, np.int32)
    face_x: dict[tuple[int, int], str] = {}
    for y in range(h):
        for x in range(w):
            if floor[y, x]:
                continue
            west, east = F(x - 1, y), F(x + 1, y)
            if F(x, y + 1):
                kind = "face"
            elif F(x, y + 2):
                kind = "top"
            elif F(x, y - 1):
                kind = "rim"
            else:
                kind = None
            if kind == "face":
                out[y, x] = 365 if west else 367 if east else 366
                face_x[(x, y)] = "l" if west else "r" if east else "m"
            elif kind == "top":
                out[y, x] = 337 if west else 339 if east else 338
            elif kind == "rim":
                out[y, x] = 281 if west else 283 if east else 282
            elif west:
                out[y, x] = 299 if y % 2 == 0 else 327
            elif east:
                out[y, x] = 300 if y % 2 == 0 else 328
            else:
                out[y, x] = BLACK

    for y in range(h):
        x = 0
        while x < w - 1:
            if face_x.get((x, y)) == "m" and face_x.get((x + 1, y)) == "m" and rng.random() < 0.3:
                out[y, x], out[y, x + 1] = 352, 353
                if out[y - 1, x] == 338 and out[y - 1, x + 1] == 338:
                    out[y - 1, x], out[y - 1, x + 1] = 324, 325
                x += 2
                continue
            x += 1

    for (x, y), end in face_x.items():
        if y + 1 < h and floor[y + 1, x]:
            above = out[y, x]
            out[y + 1, x] = 381 if above == 353 else 380 if above == 352 else {"l": 393, "r": 395, "m": 394}[end]
    return out


def paint_pits(floor: np.ndarray, void: np.ndarray, rng) -> tuple[np.ndarray, np.ndarray]:
    """Floor pieces around the void on `ground`; the face that hangs into the first void row on `pits`."""
    h, w = floor.shape
    V = lambda x, y: 0 <= x < w and 0 <= y < h and bool(void[y, x])
    pick = lambda *ids: int(rng.choice(ids))
    ground = np.where(floor, FLOOR, -1).astype(np.int32)
    over = np.full((h, w), -1, np.int32)
    for y in range(h):
        for x in range(w):
            if not floor[y, x]:
                continue
            if void[y, x]:
                ground[y, x] = -1
                if not V(x, y - 1):
                    lw = V(x - 1, y) and V(x - 1, y - 1)
                    le = V(x + 1, y) and V(x + 1, y - 1)
                    over[y, x] = 505 if lw and not le else 507 if le and not lw else pick(506, 461)
                continue
            n, s, e, wst = V(x, y - 1), V(x, y + 1), V(x + 1, y), V(x - 1, y)
            ne, nw, se, sw = V(x + 1, y - 1), V(x - 1, y - 1), V(x + 1, y + 1), V(x - 1, y + 1)
            if s and wst and not n:
                t = 477 if nw else 458
            elif s and e and not n:
                t = 479 if ne else 457
            elif s:
                t = pick(478, 433, 426)
            elif n and wst:
                t = 421
            elif n and e:
                t = 423
            elif n:
                t = pick(524, 524, 482)
            elif wst:
                t = 462 if not nw else pick(449, 439)
            elif e:
                t = 460 if not ne else pick(451, 468)
            elif se:
                t = pick(432, 425)
            elif sw:
                t = pick(434, 427)
            elif ne:
                t = pick(523, 481)
            elif nw:
                t = pick(525, 483)
            else:
                continue
            ground[y, x] = t
    return ground, over


def paint_dark(region: np.ndarray) -> np.ndarray:
    h, w = region.shape
    D = lambda x, y: not (0 <= x < w and 0 <= y < h) or bool(region[y, x])
    out = np.full((h, w), -1, np.int32)
    for y in range(h):
        for x in range(w):
            if not region[y, x]:
                continue
            n, s, e, wst = D(x, y - 1), D(x, y + 1), D(x + 1, y), D(x - 1, y)
            if not n and not wst:
                t = 575
            elif not n and not e:
                t = 577
            elif not s and not wst:
                t = 631
            elif not s and not e:
                t = 633
            elif not n:
                t = 576
            elif not s:
                t = 632
            elif not wst:
                t = 603
            elif not e:
                t = 605
            elif not D(x + 1, y + 1):
                t = 579
            elif not D(x - 1, y + 1):
                t = 580
            elif not D(x + 1, y - 1):
                t = 607
            elif not D(x - 1, y - 1):
                t = 608
            else:
                t = 604
            out[y, x] = t
    return out


def dark_region(floor, pits, walls, rng):
    h, w = floor.shape
    plain = floor & ~morph(pits, 2, True) & (walls < 0)
    plain &= ~morph(~floor, 1, True)
    n = noise(rng, (h, w), 6, 0.22)
    region = (n > 0.28) & plain
    region = morph(morph(region, 1, False), 1, True) & plain
    for _ in range(3):
        thin = np.zeros_like(region)
        for y in range(h):
            for x in range(w):
                if not region[y, x]:
                    continue
                vert = (y > 0 and region[y - 1, x]) or (y + 1 < h and region[y + 1, x])
                horiz = (x > 0 and region[y, x - 1]) or (x + 1 < w and region[y, x + 1])
                if not vert or not horiz:
                    thin[y, x] = True
        region &= ~thin
    return region


def source(pack: Path) -> Path:
    t = pack.read_text()
    t = re.sub(r' <tileset firstgid="\d+" source="[^"]+"/>\n', "", t)
    for a, b in SHEETS:
        t = t.replace(f'name="{a}"', f'name="glowing_cave_{b}"').replace(
            f'source="{a}.png"', f'source="../client/public/assets/sprites/collection/glowing_cave_{b}.png"')
    t = re.sub(r'<image source="(?!\.\./client)[^"]+"', '<image source="missing.png"', t)
    out = ROOT / "tiled/_cave_src.tmx"
    out.write_text(t)
    return out


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("map")
    ap.add_argument("--pack", required=True)
    ap.add_argument("--seed", type=int, default=1)
    ap.add_argument("--width", type=int, default=82)
    ap.add_argument("--height", type=int, default=112)
    ap.add_argument("--force", action="store_true")
    a = ap.parse_args()
    rng = np.random.default_rng(a.seed)

    floor, pits, spawn = layout(a.width, a.height, a.seed)
    walls = paint_walls(floor, rng)
    ground, over = paint_pits(floor, pits, rng)
    dark = paint_dark(dark_region(floor, pits, walls, rng))

    path = ROOT / "tiled" / f"{a.map}.tmx"
    if path.exists():
        if not a.force:
            sys.exit(f"{path} exists; --force to overwrite")
        path.unlink()
    m = Map.new(a.map, a.width, a.height)
    src = source(Path(a.pack))
    try:
        s = Map(str(src))
        for _, b in SHEETS:
            m.add_tileset_from(s, f"glowing_cave_{b}")
    finally:
        src.unlink()
    first = m.tileset("glowing_cave_ground")["firstgid"]
    gid = lambda arr: [[first + int(v) if v >= 0 else 0 for v in row] for row in arr]

    h, w = floor.shape
    under = np.where(floor, ground, FLOOR)
    rims = np.isin(under, list(PIT_SET)) | np.isin(over, list(PIT_SET))
    void = np.where(floor & ((under < 0) | rims), BLACK, -1)
    for name, arr in [("void", void), ("water", None), ("ground", under), ("ground_dark", dark), ("pits", over)]:
        props = {"void": True} if name == "void" else {"faces": True} if name == "pits" else None
        el = m.add_tile_layer(name, props=props)
        if arr is not None:
            m.set_grid(el, gid(arr))
    el = m.add_tile_layer("walls", props={"clearance": 10, "collides": True})
    m.set_grid(el, gid(walls))
    for name in ["details", "objects"]:
        m.add_tile_layer(name)
    m.add_object_group("objects")

    for i in sorted({int(v) for v in walls.ravel() if v in WALL_BOXES}):
        m.add_tile_collision("glowing_cave_ground", (i // COLS + 1, i % COLS + 1), WALL_BOXES[i])
    m.save()
    print(f"wrote {path.relative_to(ROOT)}  spawn px {spawn[0] * T + 8},{spawn[1] * T + 8}  pits {int(pits.sum())} cells")


if __name__ == "__main__":
    main()
