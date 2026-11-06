"""Seed a small hand-editable biome map with creeks, ground and grass.

Writes tiled/<map>.tmx with the same layer stack the water generator produces
(beach, water, ground, grass, grass_ground_border, objects), so the client's
water and meadow shaders treat it exactly like generated terrain. Run once to
get a starting point, then edit the map in Tiled. Never rerun on a map that has
been edited by hand: --force overwrites it.

    /usr/bin/python3 .claude/skills/create-biome/scripts/creeks.py swamp \
        --width 80 --height 60 --creeks 3 --branches 4 --pools 3 --seed 7
"""

from __future__ import annotations

import argparse
import math
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
sys.path.insert(0, str(ROOT / ".claude/skills/tiled/scripts"))
from tmx import Map  # noqa: E402

SIDES = ((0, -1), (0, 1), (-1, 0), (1, 0))
AROUND = SIDES + ((-1, -1), (1, -1), (-1, 1), (1, 1))

WATER = 207
GROUND = 105
GRASS = 33
BLOB = {
    (0, 0): 8, (1, 0): 9, (2, 0): 10,
    (0, 1): 32, (1, 1): 33, (2, 1): 34,
    (0, 2): 56, (1, 2): 57, (2, 2): 58,
}
NOTCH = {(1, 1): 11, (-1, 1): 12, (1, -1): 35, (-1, -1): 36}


class Noise:
    def __init__(self, rng: random.Random):
        self.waves = [(rng.uniform(0.6, 1.6) * f, rng.uniform(0, math.tau), a)
                      for f, a in ((0.07, 1.0), (0.16, 0.6), (0.33, 0.3))]

    def __call__(self, t: float) -> float:
        return sum(a * math.sin(f * t + p) for f, p, a in self.waves) / 1.9


class Field:
    """Smooth 2D value noise in [0, 1], for shorelines that wander in both axes."""

    def __init__(self, rng: random.Random, scale: float):
        self.scale = scale
        self.grid: dict = {}
        self.rng = random.Random(rng.random())

    def _at(self, x: int, y: int) -> float:
        if (x, y) not in self.grid:
            self.grid[(x, y)] = self.rng.random()
        return self.grid[(x, y)]

    def __call__(self, x: float, y: float) -> float:
        x, y = x / self.scale, y / self.scale
        x0, y0 = math.floor(x), math.floor(y)
        fx, fy = x - x0, y - y0
        fx, fy = fx * fx * (3 - 2 * fx), fy * fy * (3 - 2 * fy)
        top = self._at(x0, y0) * (1 - fx) + self._at(x0 + 1, y0) * fx
        bottom = self._at(x0, y0 + 1) * (1 - fx) + self._at(x0 + 1, y0 + 1) * fx
        return top * (1 - fy) + bottom * fy


def stamp(mask: set, w: int, h: int, x: float, y: float, r: float) -> None:
    for yy in range(int(y - r) - 1, int(y + r) + 2):
        for xx in range(int(x - r) - 1, int(x + r) + 2):
            if 0 <= xx < w and 0 <= yy < h and (xx + 0.5 - x) ** 2 + (yy + 0.5 - y) ** 2 <= r * r:
                mask.add((xx, yy))


def creek(mask, w, h, rng, x, y, heading, length, width, path, a_bend=1.3, pace=1.0) -> None:
    bend, swell = Noise(rng), Noise(rng)
    for step in range(length):
        a = heading + bend(step * pace) * a_bend
        x += math.cos(a)
        y += math.sin(a)
        if not (-2 <= x < w + 2 and -2 <= y < h + 2):
            return
        stamp(mask, w, h, x, y, width + swell(step) * 0.45)
        path.append((x, y, a))


def pool(mask, w, h, rng, cx, cy, r) -> None:
    lobes = [(rng.uniform(0, math.tau), rng.uniform(0.15, 0.35), rng.randint(2, 4)) for _ in range(3)]
    for y in range(int(cy - r * 1.6), int(cy + r * 1.6) + 1):
        for x in range(int(cx - r * 1.6), int(cx + r * 1.6) + 1):
            a = math.atan2(y - cy, x - cx)
            edge = r * (1 + sum(s * math.sin(k * a + p) for p, s, k in lobes))
            if 0 <= x < w and 0 <= y < h and math.hypot(x + 0.5 - cx, y + 0.5 - cy) <= edge:
                mask.add((x, y))


def inside(cell, w, h) -> bool:
    return 0 <= cell[0] < w and 0 <= cell[1] < h


def has(mask, cell, w, h) -> bool:
    """Off the map counts as more of the same, so nothing borders the edge."""
    return cell in mask or not inside(cell, w, h)


def thin(mask, w, h) -> set:
    return {(x, y) for x, y in mask
            if (not has(mask, (x, y - 1), w, h) and not has(mask, (x, y + 1), w, h))
            or (not has(mask, (x - 1, y), w, h) and not has(mask, (x + 1, y), w, h))}


def erode(mask, w, h) -> None:
    while (gone := thin(mask, w, h)):
        mask -= gone


def components(mask) -> list[set]:
    out, seen = [], set()
    for start in mask:
        if start in seen:
            continue
        blob, stack = set(), [start]
        seen.add(start)
        while stack:
            x, y = stack.pop()
            blob.add((x, y))
            for dx, dy in SIDES:
                c = (x + dx, y + dy)
                if c in mask and c not in seen:
                    seen.add(c)
                    stack.append(c)
        out.append(blob)
    return out


def distance(seeds, cells, reach, steps=AROUND) -> dict:
    dist = {c: 0 for c in seeds}
    frontier = list(seeds)
    for d in range(1, reach + 1):
        nxt = []
        for x, y in frontier:
            for dx, dy in steps:
                c = (x + dx, y + dy)
                if c in cells and c not in dist:
                    dist[c] = d
                    nxt.append(c)
        frontier = nxt
    return dist


def notches(mask, x, y, w, h) -> list[tuple[int, int]]:
    return [d for d in NOTCH if not has(mask, (x + d[0], y + d[1]), w, h)]


def settle(mask, w, h, least) -> None:
    """Grass with no 1-wide necks, no cell needing two inner corners, and no
    stray smudges. Every removal can open a new neck, so loop until stable."""
    while True:
        erode(mask, w, h)
        bad = {(x, y) for x, y in mask
               if all(has(mask, (x + dx, y + dy), w, h) for dx, dy in SIDES)
               and len(notches(mask, x, y, w, h)) > 1}
        bad |= {c for blob in components(mask) if len(blob) < least for c in blob}
        if not bad:
            return
        mask -= bad


def tile(mask, x, y, w, h) -> int:
    n, s, west, e = (has(mask, (x + dx, y + dy), w, h) for dx, dy in SIDES)
    if n and s and west and e:
        missing = notches(mask, x, y, w, h)
        return NOTCH[missing[0]] if missing else GRASS
    return BLOB[(0 if not west else 2 if not e else 1, 0 if not n else 2 if not s else 1)]


def opening(water, cells, r) -> set:
    """Only water a disk of radius r fits in, so every body is at least 2r wide
    and the shoreline leaves open water in it."""
    inside = distance(cells - water, cells, 99)
    core = {c for c, d in inside.items() if c in water and d > r}
    return {c for c, d in distance(core, water, math.ceil(r)).items()}


def necks(water, w, h, rng, gap, chance, radius) -> None:
    """Join some neighbouring bodies with a channel too narrow for open water,
    so the shader draws it as wet shallows: connected, but only just."""
    bodies = components(water)
    owner = {c: i for i, blob in enumerate(bodies) for c in blob}
    edges = [[c for c in blob if any((c[0] + dx, c[1] + dy) not in blob for dx, dy in SIDES)] for blob in bodies]
    pairs = {}
    for i, a_edge in enumerate(edges):
        for j in range(i + 1, len(edges)):
            best = None
            for ax, ay in a_edge[::2]:
                for bx, by in edges[j][::2]:
                    d = math.hypot(ax - bx, ay - by)
                    if d <= gap and (best is None or d < best[0]):
                        best = (d, (ax, ay), (bx, by))
            if best:
                pairs[(i, j)] = best
    for (_, _), (d, (ax, ay), (bx, by)) in pairs.items():
        if rng.random() > chance:
            continue
        steps = max(1, int(d * 2))
        for k in range(steps + 1):
            t = k / steps
            stamp(water, w, h, ax + (bx - ax) * t + 0.5, ay + (by - ay) * t + 0.5, radius)


def marsh(water, cells, w, h, rng, a) -> None:
    """Many short creeks packed close, each wide enough for open water, with only
    a thin strip of land between them; necks then join some of them."""
    halo: set = set()
    target = a.water * len(cells)
    for _ in range(a.attempts):
        if len(water) >= target:
            break
        piece: set = set()
        creek(piece, w, h, rng, rng.uniform(-2, w + 2), rng.uniform(-2, h + 2), rng.uniform(0, math.tau),
              rng.randint(*a.length), rng.uniform(*a.radius), [], a.bend, a.pace)
        if not piece or piece & halo:
            continue
        water |= piece
        halo |= set(distance(piece, cells, a.spacing))
    opened = opening(water, cells, a.open)
    water.clear()
    water |= opened
    necks(water, w, h, rng, a.gap, a.links, a.neck)


def build(a) -> None:
    rng = random.Random(a.seed)
    w, h = a.width, a.height
    cells = {(x, y) for y in range(h) for x in range(w)}
    water: set = set()
    paths: list = []

    if a.style == "marsh":
        marsh(water, cells, w, h, rng, a)

    for i in range(a.creeks if a.style == "creeks" else 0):
        x = w * (i + 0.5 + rng.uniform(-0.25, 0.25)) / a.creeks
        path: list = []
        creek(water, w, h, rng, x, -1, math.pi / 2 + rng.uniform(-0.3, 0.3), h * 3, a.width_tiles, path)
        paths.append(path)

    for _ in range(a.branches if paths else 0):
        src = rng.choice(paths)
        if len(src) < 20:
            continue
        x, y, heading = src[rng.randrange(8, len(src) - 8)]
        side = rng.choice((-1, 1))
        path: list = []
        creek(water, w, h, rng, x, y, heading + side * rng.uniform(0.9, 1.4),
              rng.randint(h // 3, h), a.width_tiles * 0.85, path)
        paths.append(path)

    for _ in range(a.pools if paths else 0):
        x, y, _ = rng.choice(rng.choice(paths))
        pool(water, w, h, rng, x + rng.uniform(-3, 3), y + rng.uniform(-3, 3), rng.uniform(3, 5.5))

    for _ in range(a.ponds if a.style == "creeks" else 0):
        pool(water, w, h, rng, rng.uniform(4, w - 4), rng.uniform(4, h - 4), rng.uniform(3.5, 5))

    for _ in range(20):
        erode(water, w, h)
        land = cells - water
        spurs = thin(land, w, h)
        spurs |= {c for blob in components(land) if len(blob) < a.least_land for c in blob}
        if not spurs:
            break
        water |= spurs
    land = cells - water

    shore = distance(water, land, a.ring[1])
    wobble = Field(rng, 5)
    ground = {c for c, d in shore.items()
              if d and d <= a.ring[0] + (a.ring[1] - a.ring[0]) * wobble(*c)}
    grass = land - ground
    settle(grass, w, h, a.least_grass)
    bare = {c for blob in components(land) if not blob & grass for c in blob}
    water |= bare
    land -= bare

    bed =set(distance(water, land, a.bed, SIDES)) | water

    path = ROOT / "tiled" / f"{a.map}.tmx"
    if path.exists():
        if not a.force:
            sys.exit(f"{path} exists; pass --force only if it has not been edited by hand")
        path.unlink()

    out = Map.new(a.map, w, h)
    src = Map("water")
    firstgid = {name: out.add_tileset_from(src, name)["firstgid"]
                for name in ("water_coasts", "grass_ground")}
    gg = lambda t: firstgid["grass_ground"] + t
    grid = lambda pick: [[pick((x, y)) for x in range(w)] for y in range(h)]

    layers = [
        ("beach", {"beach": True}, lambda c: gg(GROUND) if c in bed else 0),
        ("water", {"water": True}, lambda c: firstgid["water_coasts"] + WATER if c in water else 0),
        ("ground", None, lambda c: gg(GROUND) if c in land and c not in bed else 0),
        ("grass", {"meadow": True, "surface": "grass"},
         lambda c: gg(GRASS) if c in grass and tile(grass, *c, w, h) == GRASS else 0),
        ("grass_ground_border", {"meadow": True, "meadowEdge": True},
         lambda c: gg(t) if c in grass and (t := tile(grass, *c, w, h)) != GRASS else 0),
        ("objects", None, lambda c: 0),
    ]
    for name, props, pick in layers:
        out.set_grid(out.add_tile_layer(name, props=props), grid(pick))
    out.add_object_group("objects")
    out.save()

    print(f"{path.relative_to(ROOT)}  {w}x{h}  water {len(water)}  ground {len(land - grass)}  "
          f"grass {len(grass)}  land pieces {len(components(land))}")


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("map")
    p.add_argument("--width", type=int, default=80)
    p.add_argument("--height", type=int, default=60)
    p.add_argument("--style", choices=("creeks", "marsh"), default="creeks",
                   help="creeks: rivers from the north edge; marsh: many ponds and short creeks joined by shallow necks")
    p.add_argument("--water", type=float, default=0.75, help="marsh: stop adding creeks at this share of the map")
    p.add_argument("--length", type=int, nargs=2, default=(5, 22), help="marsh: creek length range, tiles")
    p.add_argument("--radius", type=float, nargs=2, default=(3.4, 4.2), help="marsh: creek radius range; 3 is the floor for open water")
    p.add_argument("--spacing", type=int, default=2, help="marsh: least land between two creeks")
    p.add_argument("--bend", type=float, default=1.6, help="marsh: how far a creek swings")
    p.add_argument("--pace", type=float, default=3.0, help="marsh: how quickly it swings; short creeks need it fast")
    p.add_argument("--attempts", type=int, default=40000)
    p.add_argument("--open", type=float, default=2.5, help="marsh: half the narrowest open water, in tiles")
    p.add_argument("--gap", type=float, default=7, help="marsh: widest land gap a neck may cross")
    p.add_argument("--links", type=float, default=0.75, help="marsh: chance two neighbouring bodies get a neck")
    p.add_argument("--neck", type=float, default=1.1, help="marsh: neck radius; keep under ~1.5 so it reads as shallows")
    p.add_argument("--creeks", type=int, default=2)
    p.add_argument("--branches", type=int, default=3)
    p.add_argument("--pools", type=int, default=3, help="larger pools along the creeks")
    p.add_argument("--ponds", type=int, default=4, help="small ponds anywhere")
    p.add_argument("--width-tiles", type=float, default=3.5, help="creek radius in tiles, 3.5 gives 6-8 wide")
    p.add_argument("--ring", type=int, nargs=2, default=(1, 4), help="ground shore width, min max")
    p.add_argument("--bed", type=int, default=4, help="lakebed reach onto land, as WATER_BED_REACH")
    p.add_argument("--least-land", type=int, default=12)
    p.add_argument("--least-grass", type=int, default=14)
    p.add_argument("--seed", type=int, default=1)
    p.add_argument("--force", action="store_true")
    build(p.parse_args())


if __name__ == "__main__":
    main()
