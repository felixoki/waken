#!/usr/bin/env python3
"""Generate a terraced mountain: grass at the foot, earth terraces, snow above.

  terraces.py <map-name> [--width 128] [--height 168] [--earth 10] [--snow 5]
              [--seed 7] [--stairs 12] [--from mountain] [--force]

A level is the region north of its contour. Contours only move in flat runs and
45 degree diagonals, because that is the shape vocabulary both tilesets have
pieces for. Every tile then follows from the per-column tables below, which were
read off the hand-built tiled/mountain.tmx and reproduce it exactly.

Tiles are written as (row, col), 1-based, the way the Tiled tileset view counts.
"""
from __future__ import annotations

import argparse
import math
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from tmx import ROOT, SPRITES, Map  # noqa: E402

FOREST, MOUNTAINS, STAIRS = "forest_ground_grass", "mountains_ground", "stairs_grass"
GROUND_DETAILS, SNOW_DETAILS = "ground_grass_details", "snow_details"
VILLAGE, SNOW_OBJECTS, REEDSHEET = "village_home", "snow_objects", "reed"

"""Which rows of each detail sheet suit which surface. Details are tile objects in
an object group carrying `renders: true` and `texture: <sheet>`, the way the
village does them -- free positions, not grid-aligned, drawn above the fills."""
DETAIL_ROWS = {"earth": range(1, 10), "grass": range(10, 19), "snow": range(1, 11)}

GROUND = (21, 3)
GRASS = (26, 3)
SNOWFILL = (5, 4)

"""Grass drawn over transparency, so a patch can sit on a layer above the earth
fill and let the earth show through its edge. A 3x3 blob plus the four inner
corners; there is no 1-wide piece, so patches are cleaned to a minimum width of
two rather than tiled with the strips further along the sheet."""
GRASS_BLOB = {
    (0, 0): (25, 2), (1, 0): (25, 3), (2, 0): (25, 4),
    (0, 1): (26, 2), (1, 1): (26, 3), (2, 1): (26, 4),
    (0, 2): (27, 2), (1, 2): (27, 3), (2, 2): (27, 4),
    "notch_br": (25, 5), "notch_bl": (25, 6),
    "notch_tr": (26, 5), "notch_tl": (26, 6),
}

TREES = ("Tree1", "Tree2", "Tree4", "Tree5")
ROCKS = ("Rock1", "Rock2", "Rock3", "Rock4", "Rock8", "Rocks1", "Rocks3", "Rocks5", "Rocks6")
SNOW_TREES = ("Tree6", "Tree7", "Tree8")
REEDS = ("Reed1", "Reed2", "Reed3")

EARTH_RIM = {"flat": (6, 5), "left": (6, 2), "right": (6, 3), "cap_l": (6, 4), "cap_r": (6, 6)}
EARTH_BOTTOM = {
    "grass": {"flat": (7, 15), "junc_l": (15, 12), "junc_r": (15, 13), "cap_r": (7, 16), "cap_l": (7, 14)},
    "earth": {"flat": (10, 5), "junc_l": (12, 5), "junc_r": (7, 8), "cap_r": (10, 6), "cap_l": (10, 4)},
}
EARTH_CRACK = {"west": (21, 2), "east": (21, 4)}
"""A 4-tall cliff: two levels merged into one face the player cannot jump. Rim,
two fills, base -- and caps at each end, two rows deep, with the neighbouring
2-tall ledge taking over beneath them."""
CLIFF = {
    "rim": (6, 5), "fill": (4, 5),
    "cap_l": ((6, 4), (4, 4)), "cap_r": ((6, 6), (4, 6)),
    "base": {"grass": (7, 15), "earth": (10, 5)},
    "base_l": {"grass": (7, 14), "earth": (10, 4)},
    "base_r": {"grass": (7, 16), "earth": (10, 6)},
}
EARTH_INNER = {"grass": {"west": (13, 12), "east": (13, 13)}, "earth": {"west": (7, 2), "east": (7, 3)}}
SNOW_FACE = {
    "earth": {"flat": ((6, 4), (7, 4)), "up_right": ((5, 16), (6, 16), (7, 16)), "up_left": ((5, 17), (6, 17), (7, 17))},
    "snow": {"flat": ((12, 4), (13, 4)), "up_right": ((11, 16), (12, 16), (13, 16)), "up_left": ((11, 17), (12, 17), (13, 17))},
}
"""Rim and lip for the snow column, then rim and lip for the shadow column beside
it. The shadow lip is easy to miss and its absence leaves a notch in the border
where a wall meets the face below it."""
SNOW_END = {
    "earth": {"west": ((6, 3), (7, 3), (6, 2), (7, 2)), "east": ((6, 5), (7, 5), (6, 6), (7, 6))},
    "snow": {"west": ((12, 3), (13, 3), (12, 2), (13, 2)), "east": ((12, 5), (13, 5), (12, 6), (13, 6))},
}
"""Where a border stops running along and turns to go down, the first row of the
wall is a corner, not a straight piece. Straight pieces there leave a squared-off
notch at every turn."""
SNOW_CORNER = {"west": (6, 8), "east": (6, 7)}
SNOW_WALL = {
    "earth": {"west": ((16, 10), (16, 9)), "east": ((16, 11), (16, 12))},
    "snow": {"west": ((10, 11), (10, 10)), "east": ((10, 12), (10, 13))},
}
"""Every tile this generator places that must stop the player, with the shape it
needs: a 10px band across the top of a rim, a 10px vertical band on a side or
crack, nothing on a base or lip. Applied to the copied tilesets, skipping tiles
that already carry a shape, so the map does not depend on the source map having
them."""
COLLISION = [
    (FOREST, (6, 2), (4, 0, 12, 10)), (FOREST, (6, 3), (0, 0, 13, 10)),
    (FOREST, (6, 4), (9, 0, 7, 10)), (FOREST, (6, 5), (0, 0, 16, 10)),
    (FOREST, (6, 6), (0, 0, 8, 10)), (FOREST, (7, 2), (0, 0, 10, 16)),
    (FOREST, (7, 3), (6, 0, 10, 16)), (FOREST, (13, 12), (0, 0, 10, 16)),
    (FOREST, (13, 13), (6, 0, 10, 16)), (FOREST, (21, 4), (0, 0, 10, 16)),
    (FOREST, (21, 2), (6, 0, 10, 16)),
    (FOREST, (4, 5), (0, 0, 16, 10)), (FOREST, (4, 6), (0, 0, 6, 10)),
    (FOREST, (4, 4), (9, 0, 7, 10)), (FOREST, (8, 5), (0, 0, 16, 10)),
    (MOUNTAINS, (5, 16), (6, 0, 10, 10)), (MOUNTAINS, (5, 17), (0, 0, 10, 10)),
    (MOUNTAINS, (6, 2), (6, 0, 10, 16)), (MOUNTAINS, (6, 3), (0, 0, 16, 10)),
    (MOUNTAINS, (6, 4), (0, 0, 16, 10)), (MOUNTAINS, (6, 5), (0, 0, 16, 10)),
    (MOUNTAINS, (6, 6), (0, 0, 10, 10)), (MOUNTAINS, (6, 16), (0, 0, 16, 10)),
    (MOUNTAINS, (6, 17), (0, 0, 16, 10)), (MOUNTAINS, (10, 11), (0, 0, 10, 16)),
    (MOUNTAINS, (10, 12), (6, 0, 10, 16)), (MOUNTAINS, (11, 16), (6, 0, 10, 10)),
    (MOUNTAINS, (11, 17), (0, 0, 10, 10)), (MOUNTAINS, (12, 2), (6, 0, 10, 16)),
    (MOUNTAINS, (12, 3), (0, 0, 16, 10)), (MOUNTAINS, (12, 4), (0, 0, 16, 10)),
    (MOUNTAINS, (12, 5), (0, 0, 16, 10)), (MOUNTAINS, (12, 16), (0, 0, 16, 10)),
    (MOUNTAINS, (12, 17), (0, 0, 16, 10)), (MOUNTAINS, (16, 10), (0, 0, 10, 16)),
    (MOUNTAINS, (16, 11), (6, 0, 10, 16)),
]
GONE = -2

STAIR_BLOCK = (((7, 6), (7, 7)), ((5, 6), (5, 7)), ((6, 6), (6, 7)))


def detail_formations(sheet: str) -> list[list[tuple[int, int]]]:
    """Group a detail sheet's tiles into formations.

    A detail is not always one tile: the sheets hold clumps that span 2x2, 2x3,
    even 3x3, and placing their tiles separately tears them apart. Connected runs
    of opaque pixels recover the grouping, and village.tmx confirms it -- its
    detail objects sit at exactly the offsets these formations imply.
    """
    from PIL import Image
    from collections import deque
    im = Image.open(SPRITES / f"{sheet}.png").convert("RGBA")
    w, h = im.size
    px = im.load()
    seen = [[False] * w for _ in range(h)]
    blobs = []
    for y0 in range(h):
        for x0 in range(w):
            if seen[y0][x0] or px[x0, y0][3] <= 40:
                continue
            queue, cells = deque([(x0, y0)]), []
            seen[y0][x0] = True
            while queue:
                x, y = queue.popleft()
                cells.append((x, y))
                for dx in (-1, 0, 1):
                    for dy in (-1, 0, 1):
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < w and 0 <= ny < h and not seen[ny][nx] and px[nx, ny][3] > 40:
                            seen[ny][nx] = True
                            queue.append((nx, ny))
            blobs.append({(y // 16 + 1, x // 16 + 1) for x, y in cells})

    merged: list[set] = []
    for blob in blobs:                       # two blobs sharing a tile are one detail
        touching = [m for m in merged if m & blob]
        for m in touching:
            merged.remove(m)
        merged.append(set().union(blob, *touching))
    return [sorted(m) for m in merged]


def detail_tiles(sheet: str, rows: range) -> list[list[tuple[int, int]]]:
    """Formations whose tiles all fall in those rows."""
    return [f for f in detail_formations(sheet) if all(r in rows for r, _ in f)]


def wander(n: int, rng: random.Random, amplitude: float,
           hold: tuple[int, int] = (4, 14), step: float = 1.1) -> list[float]:
    """A slow random walk, for breaking up lines that would otherwise be ruler-straight."""
    out, v, left, rate = [], 0.0, 0, 0.0
    for _ in range(n):
        if left <= 0:
            left, rate = rng.randint(*hold), rng.uniform(-step, step)
        v = max(-amplitude, min(amplitude, v + rate))
        left -= 1
        out.append(v)
    return out


def despike(t: list[int], limit) -> None:
    """Snow has a 45 degree piece and a wall piece, but nothing for a 2-row step:
    the corner lands with no wall between, which reads as a break in the slope."""
    for x in range(1, len(t)):
        if t[x] <= GONE or t[x - 1] <= GONE:
            continue
        step = t[x] - t[x - 1]
        if step == -2:
            t[x] = t[x - 1] - 1 if t[x - 1] - 1 <= limit(x) else t[x - 1] - 3
        elif step == 2:
            for want in (t[x - 1] + 1, t[x - 1] + 3):
                if want <= limit(x):
                    t[x] = want
                    break


def deneedle(t: list[int], limit, cap: int = 14) -> None:
    """Cap how far a contour may jump in one column. Relief can push a single
    column tens of rows past its neighbours, which draws as a needle of terrain
    spiking through the level above. Genuine walls are well under the cap."""
    for _ in range(3):
        for rng_ in (range(1, len(t)), range(len(t) - 2, -1, -1)):
            for x in rng_:
                near = t[x - 1] if x else t[x + 1]
                if t[x] <= GONE or near <= GONE:
                    continue
                if t[x] - near > cap:
                    t[x] = min(near + cap, limit(x))
                elif near - t[x] > cap:
                    t[x] = min(near - cap, limit(x))


def _runs(cols: list[int]) -> list[tuple[int, int]]:
    """Consecutive columns grouped into (first, last) runs."""
    out = []
    for x in cols:
        if out and x == out[-1][1] + 1:
            out[-1][1] = x
        else:
            out.append([x, x])
    return [(a, b) for a, b in out]


def fill_gaps(t: list[int], limit, widest: int = 5) -> None:
    """Close short gaps inside a level. A one-column gap is a slot of the level
    below spiking up through this one; it only looks like terrain when it is wide.
    Bounded by live columns on both sides, so this cannot march a level outward."""
    live = [x for x, v in enumerate(t) if v > GONE]
    for left, right in zip(live, live[1:]):
        if 1 < right - left <= widest + 1:
            span = right - left
            for step, x in enumerate(range(left + 1, right), 1):
                blend = t[left] + (t[right] - t[left]) * step / span
                t[x] = max(1, min(int(round(blend)), limit(x)))


def smooth(t: list[int], limit) -> None:
    """Remove one-column pits, bumps and stubs; the tilesets have no piece for those.

    A column the level does not reach is not a pit. Filling those in marches the
    level outward one column per pass, which walks terrain across the grass and
    out to the map edge.
    """
    for _ in range(12):
        done = True
        for x in range(1, len(t) - 1):
            if t[x] <= GONE:
                if t[x - 1] > GONE and t[x + 1] > GONE and min(t[x - 1], t[x + 1]) <= GONE + 1:
                    continue
                continue
            if t[x - 1] > t[x] and t[x + 1] > t[x] and t[x - 1] > GONE and t[x + 1] > GONE:
                raise_to = min(t[x - 1], t[x + 1], limit(x))
                if raise_to > t[x]:
                    t[x] = raise_to
                    done = False
            elif t[x - 1] < t[x] and t[x + 1] < t[x]:
                t[x] = max(t[x - 1], t[x + 1])
                done = False
            elif t[x] > GONE and t[x - 1] <= GONE and t[x + 1] <= GONE:
                t[x] = GONE
                done = False
        if done:
            return


def grass_patches(eligible, rng, count) -> set:
    """Stretches of grass across the earth terraces, so trees have somewhere to
    grow above the foot. Blobs first, then a cleanup: the blob set has no 1-wide
    piece, so every part of a patch has to be at least two tiles across."""
    mask: set[tuple[int, int]] = set()
    if not eligible or count <= 0:
        return mask
    cells = sorted(eligible)
    for _ in range(count):
        cx, cy = rng.choice(cells)
        rx, ry = rng.uniform(7, 30), rng.uniform(4.5, 15)
        harmonics = [(rng.uniform(0.10, 0.30), rng.randint(2, 5), rng.uniform(0, 6.3))
                     for _ in range(3)]
        for dy in range(-int(ry * 1.5) - 1, int(ry * 1.5) + 2):
            for dx in range(-int(rx * 1.5) - 1, int(rx * 1.5) + 2):
                angle = math.atan2(dy / ry, dx / rx)
                edge = 1.0 + sum(m * math.sin(k * angle + p) for m, k, p in harmonics)
                if (dx / rx) ** 2 + (dy / ry) ** 2 <= edge * edge:
                    cell = (cx + dx, cy + dy)
                    if cell in eligible:
                        mask.add(cell)

    sides = ((1, 0), (-1, 0), (0, 1), (0, -1))
    for _ in range(6):
        grew = fill_holes(mask, eligible, sides)
        mask |= grew
        shrank = erode(mask)
        if not grew and not shrank:
            break
    """Every pass that only takes cells away has to be followed by another erode:
    filling a hole, or dropping a whole patch, can leave a neck one tile wide
    behind it, and the blob set has no piece for that -- it draws as a half tile
    of grass hanging in the earth. Erode is last, so nothing one tile wide can
    survive it."""
    mask |= fill_holes(mask, eligible, sides)
    erode(mask)
    mask -= slivers(mask, sides)
    erode(mask)
    return mask


def erode(mask) -> bool:
    """Take away everything one tile wide, until nothing is."""
    gone = False
    while True:
        thin = {(x, y) for x, y in mask
                if ((x, y - 1) not in mask and (x, y + 1) not in mask)
                or ((x - 1, y) not in mask and (x + 1, y) not in mask)}
        if not thin:
            return gone
        mask -= thin
        gone = True


def slivers(mask, sides, least=14) -> set:
    """Patches too small to grow anything read as stray green smudges."""
    out, seen = set(), set()
    for start in mask:
        if start in seen:
            continue
        stack, blob = [start], set()
        seen.add(start)
        while stack:
            x, y = stack.pop()
            blob.add((x, y))
            for dx, dy in sides:
                cell = (x + dx, y + dy)
                if cell in mask and cell not in seen:
                    seen.add(cell)
                    stack.append(cell)
        if len(blob) < least:
            out |= blob
    return out


def fill_holes(mask, eligible, sides, most=40) -> set:
    """Where two blobs overlap they leave gaps, and a gap reads as a dirt box cut
    out of the grass. Anything bare, small and walled in by grass becomes grass."""
    out, seen = set(), set()
    for start in eligible - mask:
        if start in seen:
            continue
        stack, blob, open_ = [start], set(), False
        seen.add(start)
        while stack:
            x, y = stack.pop()
            blob.add((x, y))
            if len(blob) > most:
                open_ = True
                break
            for dx, dy in sides:
                cell = (x + dx, y + dy)
                if cell in mask:
                    continue
                if cell not in eligible:
                    open_ = True                  # runs out to rock, not a hole
                    continue
                if cell not in seen:
                    seen.add(cell)
                    stack.append(cell)
        seen |= blob
        if not open_:
            out |= blob
    return out


def patch_tiles(mask) -> dict:
    """The blob set, indexed by which sides of a cell carry more grass. Concave
    cells take an inner corner so the notch faces the missing diagonal."""
    out = {}
    for x, y in mask:
        n, s_, w_, e = ((x, y - 1) in mask, (x, y + 1) in mask,
                        (x - 1, y) in mask, (x + 1, y) in mask)
        if n and s_ and w_ and e:
            for (dx, dy), key in (((-1, -1), "notch_tl"), ((1, -1), "notch_tr"),
                                  ((-1, 1), "notch_bl"), ((1, 1), "notch_br")):
                if (x + dx, y + dy) not in mask:
                    out[(x, y)] = GRASS_BLOB[key]
                    break
            else:
                out[(x, y)] = GRASS_BLOB[(1, 1)]
            continue
        out[(x, y)] = GRASS_BLOB[(0 if not w_ else 2 if not e else 1,
                                  0 if not n else 2 if not s_ else 1)]
    return out


def scatter_entities(out, rng, a, surfaces, blocked, w, h) -> tuple[list[list[int]], dict]:
    """Trees and rocks, the village way: a real entity in the `objects` object
    group, and the same sprite stamped into a tile layer also named `objects` so
    the map reads right in the editor. The client skips that layer by name."""
    plan = (("meadow", TREES, a.foot_trees), ("grass", TREES, a.trees),
            ("meadow", REEDS, a.reeds), ("grass", REEDS, a.reeds),
            ("earth", ROCKS, a.rocks), ("snow", SNOW_TREES, a.snow_trees))
    grid = [[0] * w for _ in range(h)]
    group = out.add_object_group("objects")
    taken: set[tuple[int, int]] = set()
    counts: dict[str, int] = {}
    for surface, names, want in plan:
        cells = sorted(surfaces[surface])
        if want <= 0 or not cells:
            continue
        stamps = {n: out.stamp(n)[0] for n in names}
        target = int(len(cells) * want / 1000)
        if a.debug:
            print(f"   {surface}: {len(cells)} cells, target {target}")
        done, tries, budget = 0, 0, target * 60
        while done < target and tries < budget:
            cx, cy = rng.choice(cells)
            for _ in range(rng.randint(2, 7)):
                if done >= target:
                    break
                tries += 1
                name = rng.choice(names)
                rows = stamps[name]
                tw_, th_ = max(map(len, rows)), len(rows)
                x = cx + int(round(rng.gauss(0, 3.4)))
                y = cy + int(round(rng.gauss(0, 2.2)))
                if x < 0 or y < 0 or x + tw_ > w or y + th_ > h:
                    continue
                foot = [(x + dx, y + dy) for dy in range(max(0, th_ - 2), th_)
                        for dx in range(tw_)]
                if any(c not in surfaces[surface] or c in blocked for c in foot):
                    continue
                span = [(x + dx, y + dy) for dy in range(th_) for dx in range(tw_)]
                if any(c in taken for c in span):
                    continue
                taken.update(span)
                taken.update((c[0] + dx, c[1] + dy) for c in foot for dx in (-1, 0, 1) for dy in (0, 1))
                for dy, row in enumerate(rows):
                    for dx, g in enumerate(row):
                        grid[y + dy][x + dx] = g
                out.add_object(group, name, x * 16 + tw_ * 8, y * 16 + th_ * 8)
                counts[name] = counts.get(name, 0) + 1
                done += 1
    return grid, counts


def scatter_details(out, layers, gid, rng, a, snow_from, patches, blocked) -> dict:
    """Tile objects scattered in patches over grass, earth and snow, the way
    village.tmx does it: an object group per sheet with `renders` and `texture`,
    objects at free positions with y on the bottom edge."""
    if a.details <= 0:
        return {}
    h, w = len(layers["ground"]), len(layers["ground"][0])
    forest = out.tileset(FOREST)
    grass_gid = forest["firstgid"] + (GRASS[0] - 1) * forest["columns"] + GRASS[1] - 1
    earth_gid = forest["firstgid"] + (GROUND[0] - 1) * forest["columns"] + GROUND[1] - 1

    surfaces = {"grass": [], "earth": [], "snow": []}
    for y in range(h):
        for x in range(w):
            if (x, y) in blocked:
                continue
            if layers["snow"][y][x]:
                surfaces["snow"].append((x, y))
            elif (x, y) in patches or layers["ground"][y][x] == grass_gid:
                surfaces["grass"].append((x, y))
            elif layers["ground"][y][x] == earth_gid:
                surfaces["earth"].append((x, y))

    sheets = {"grass": GROUND_DETAILS, "earth": GROUND_DETAILS, "snow": SNOW_DETAILS}
    groups, placed = {}, {}
    for surface, cells in surfaces.items():
        if not cells:
            continue
        sheet = sheets[surface]
        ts = out.tileset(sheet)
        tiles = detail_tiles(sheet, DETAIL_ROWS[surface])
        if not tiles or ts is None:
            continue
        if sheet not in groups:
            groups[sheet] = out.add_object_group(sheet, {"renders": True, "texture": sheet})
        group = groups[sheet]
        want = int(len(cells) * a.details / 1000)
        eligible = set(cells)
        """Formations keep --detail-gap tiles clear of each other. Without it they
        stack on the same tiles and a clump reads as one blotch rather than as
        several things lying near each other."""
        used: set[tuple[int, int]] = set()
        skirt = [(dx, dy) for dx in range(-a.detail_gap, a.detail_gap + 1)
                 for dy in range(-a.detail_gap, a.detail_gap + 1)]
        done, tries, budget = 0, 0, want * 40
        while done < want and tries < budget:
            cx, cy = rng.choice(cells)
            for _ in range(rng.randint(3, 9)):
                if done >= want:
                    break
                tries += 1
                x = cx + rng.gauss(0, 4.6)
                y = cy + rng.gauss(0, 3.2)
                if (int(x), int(y)) not in eligible:
                    continue          # jitter can drift a tuft onto a rock face
                shape = rng.choice(tiles)
                r0, c0 = shape[0][0], min(c for _, c in shape)
                spots = [(int(x) + c - c0, int(y) + r - r0) for r, c in shape]
                if any(spot not in eligible for spot in spots):
                    continue          # a formation is placed whole or not at all
                if any(spot in used for spot in spots):
                    continue
                used.update((sx + dx, sy + dy) for sx, sy in spots for dx, dy in skirt)
                jx, jy = rng.uniform(-3, 3), rng.uniform(-3, 3)
                for (r, c) in shape:
                    out.add_tile_object(
                        group, ts["firstgid"] + (r - 1) * ts["columns"] + c - 1,
                        (x + c - c0) * 16 + jx, (y + r - r0 + 1) * 16 + jy)
                placed[surface] = placed.get(surface, 0) + 1
                done += 1
    return placed


def build(a) -> None:
    rng = random.Random(a.seed)
    w, h, levels = a.width, a.height, a.earth + a.snow
    snow_from = a.earth
    src = Map(a.src)

    out = Map.new(a.name, w, h)
    gids = {}
    for name in (FOREST, MOUNTAINS, STAIRS):
        ts = out.add_tileset_from(src, name)
        gids[name] = (ts["firstgid"], ts["columns"])
    for sheet, rc, box in COLLISION:
        out.add_tile_collision(sheet, rc, box)
    if a.details > 0:
        out.add_tileset_from(src, GROUND_DETAILS) if src.tileset(GROUND_DETAILS) else \
            out.add_tileset_from(Map("village"), GROUND_DETAILS)
        out.add_tileset(SNOW_DETAILS, "snow_details.png", 210, 21)
    if a.trees or a.rocks:
        out.add_tileset_from(src, VILLAGE) if src.tileset(VILLAGE) else \
            out.add_tileset_from(Map("village"), VILLAGE)
    if a.snow_trees:
        out.add_tileset(SNOW_OBJECTS, "snow_objects.png", 3293, 37)
    if a.reeds:
        out.add_tileset_from(Map("village"), REEDSHEET)

    def gid(sheet, rc):
        first, cols = gids[sheet]
        return first + (rc[0] - 1) * cols + (rc[1] - 1)

    """The mountain is a 2D elevation field, not a stack of lines.

    Contours are read out of it as level crossings, so each one is whatever shape
    the terrain cuts at that height: a spur reaches one level and not the next,
    a bowl splits another in two. Offsetting lines from each other, however much
    noise is added, always reads as one line copied N times.
    """
    """--stretch builds the mountain at height/stretch and then spaces the
    contours back out, so a taller map keeps the same silhouette with deeper
    terraces, rather than generating a different mountain."""
    stretch = max(1.0, a.stretch)
    h0, foot0 = int(round(h / stretch)), int(round(a.foot / stretch))
    terrain = h0 - foot0
    slope = levels / terrain                      # levels per row
    peak = levels + a.summit * slope + 0.7          # headroom so noise cannot shave the summit off

    """A single cone can only ever produce nested rings. A massif of several
    summits at different heights gives the upper levels separate islands and
    the middle levels shapes that wrap around saddles, so no two are alike."""
    summits = []
    count = rng.randint(3, 5)
    for i in range(count):
        rx_ = rng.uniform(0.20, 0.34) * (w - 2 * a.margin)
        lo, hi = a.margin + rx_ * 0.75, w - 1 - a.margin - rx_ * 0.75
        band = (hi - lo) / count                       # one summit per band, so they read as separate
        px = rng.uniform(lo + band * i, lo + band * (i + 1))
        # At or above the top edge, or the monotonic clamp shaves the summit off.
        # The main summit hugs the edge so its peak is actually on the map.
        py = rng.uniform(-0.05, -0.01) * terrain if i == 0 else rng.uniform(-0.34, -0.02) * terrain
        height = peak * (1.0 if i == 0 else rng.uniform(0.78, 0.97))
        rx = rx_
        ry = rng.uniform(0.95, 1.25) * terrain      # the fitting loop pulls this in if the foot overshoots
        summits.append((px, py, height, rx, ry))

    fit = {"height": 1.0, "reach": 1.0}

    def base_at(x: float, y: float) -> float:
        best = 0.0
        for px, py, height, rx, ry in summits:
            d = math.hypot((x - px) / (rx * fit["reach"]), (y - py) / (ry * fit["reach"]))
            v = height * fit["height"] * (1.0 - d ** a.dome)
            if v > best:
                best = v
        return best

    outline = [(rng.uniform(4, 13), rng.uniform(70, 300), rng.uniform(0, 6.3)) for _ in range(3)]
    """Borders get their own roughness, and it has to span scales. Two scales only
    (a broad swoop plus a fine ripple) reads as a smooth arc with the odd V cut
    into it: the swoop is the shape, the V is an outlier, and there is nothing in
    between to make the line look like rock. So: octaves from a few columns up to
    ~100, each contributing a slice of a terrace's height.

    It varies only along x, which is what lets it be this strong — the monotonic
    rule in y caps every other detail term, but not this one."""
    """Amplitude grows with wavelength so each octave contributes a similar slope
    (equal amplitudes would make the short ones near-vertical), and the total is
    then normalised to --rough *levels*. Without that cap a long octave reaches
    most of a level on its own, and where levels are packed the contours punch
    through each other and the slope shreds into slots."""
    ripple = []
    lam, shape = 11.0, []          # below ~10 columns the slope exceeds the tiles
    for _ in range(5):
        shape.append((lam ** 0.75, lam))
        lam *= 1.75
    total = sum(v for v, _ in shape)
    for value, lam in shape:
        ripple.append((a.rough * value / total, lam, rng.uniform(0, 6.3)))

    def edge_noise(x: float) -> float:
        slow = sum(m * math.sin(x / l + p) for m, l, p in outline) * slope
        # 2*pi, so l really is the wavelength in columns. Without it every octave
        # is 6.3x longer than intended and all the roughness lands on the shape
        # rather than on the border.
        fast = sum(m * math.sin(2 * math.pi * x / l + p) for m, l, p in ripple)
        return slow + fast


    waves = []
    for _ in range(2):
        mu = rng.uniform(150, 420)
        waves.append((rng.uniform(0.10, 0.15) * mu * slope, rng.uniform(180, 700),
                      mu, rng.uniform(0, 6.3), rng.choice((-1.0, 1.0))))
    for _ in range(3):
        mu = rng.uniform(12, 34)
        waves.append((rng.uniform(0.20, 0.28) * mu * slope, rng.uniform(60, 240),
                      mu, rng.uniform(0, 6.3), rng.choice((-1.0, 1.0))))

    """Escarpments: a fast drop of about one level over a couple of rows, across a
    stretch of columns. Two contours converge there, and the merge pass turns them
    into a 4-tall cliff. Without these the lower levels sit 10-20 rows apart and
    nothing ever stacks."""
    scarps = []
    for _ in range(a.scarps):
        scarps.append((rng.uniform(w * 0.12, w * 0.88), rng.uniform(26, 70),
                       rng.uniform(0.18, 0.80) * terrain, rng.uniform(1.15, 1.55)))

    blobs = []
    for _ in range(rng.randint(24, 34)):
        sy = rng.uniform(45, 95)
        blobs.append((rng.uniform(w * 0.04, w * 0.96), rng.uniform(-20, terrain),
                      rng.uniform(70, 280), sy, rng.choice((-1.0, 1.0)) * 0.020 * sy))
    for _ in range(rng.randint(40, 65)):
        sy = rng.uniform(16, 42)
        blobs.append((rng.uniform(w * 0.04, w * 0.96), rng.uniform(-20, terrain),
                      rng.uniform(48, 150), sy, rng.choice((-1.0, 1.0)) * 0.026 * sy))

    """Fit the massif to the map: scale the summit heights until the peak reaches
    the level asked for, and pull the cones in until the foot lands above the
    grass band. An offset would do the first job but lifts the far field too,
    raising terrain out in the middle of the grass."""
    def make_field() -> list[list[float]]:
        field = [[0.0] * w for _ in range(h0)]
        noise_x = [edge_noise(x) for x in range(w)]
        """Detail is masked by the local height of the massif, not just its
        outline at the top edge: masking per column lets a blob raise terrain far
        south of the mountain, and that tail drags the foot off the map."""
        local = [[0.0] * w for _ in range(h0)]
        for y in range(h0):
            row, loc = field[y], local[y]
            for x in range(w):
                b = base_at(x, y)
                row[x] = b + noise_x[x]
                if b < 0.35:
                    # Border noise runs the full width; without this it grows terrain
                    # out in the grass and drags the mountain to the map edge.
                    row[x] = min(row[x], 0.95)
                loc[x] = min(1.0, max(0.0, b / peak)) ** 0.6

        for amp, lx, ly, phase, sign in waves:
            sx = [math.sin(x / lx + phase) for x in range(w)]
            cxs = [math.cos(x / lx + phase) for x in range(w)]
            for y in range(h0):
                sy_, cy_ = math.sin(sign * y / ly), math.cos(sign * y / ly)
                row = field[y]
                loc = local[y]
                for x in range(w):
                    row[x] += loc[x] * amp * (sx[x] * cy_ + cxs[x] * sy_)

        for cx_, half, y0, amp in scarps:
            x0, x1 = max(0, int(cx_ - half)), min(w, int(cx_ + half) + 1)
            for y in range(h0):
                drop = amp / (1.0 + math.exp(-(y - y0) / 0.7))   # ~2 rows, or the levels land too far apart to stack
                row, loc = field[y], local[y]
                for x in range(x0, x1):
                    taper = 0.5 * (1.0 + math.cos(math.pi * (x - cx_) / half))
                    row[x] -= drop * taper * loc[x]

        for bx, by, sx_, sy_, amp in blobs:
            x0, x1 = max(0, int(bx - 3 * sx_)), min(w, int(bx + 3 * sx_) + 1)
            y0, y1 = max(0, int(by - 3 * sy_)), min(h0, int(by + 3 * sy_) + 1)
            for y in range(y0, y1):
                fy = ((y - by) / sy_) ** 2
                row = field[y]
                loc = local[y]
                for x in range(x0, x1):
                    row[x] += loc[x] * amp * math.exp(-0.5 * (((x - bx) / sx_) ** 2 + fy))

        """Elevation must never rise as you walk south, or a plateau would need a
        north-facing edge, which this tileset has no pieces for. The clamp also
        insists on a minimum descent: a dead-flat bench sitting exactly at a level
        threshold makes the contour jump tens of rows between neighbouring columns,
        which shows up as rectangular bites out of the terrain."""
        min_drop = slope * 0.3
        for x in range(w):
            for y in range(1, h0):
                ceiling = field[y - 1][x] - min_drop
                if field[y][x] > ceiling:
                    field[y][x] = ceiling

        return field

    want = levels + a.summit * slope
    room = min(min(px - a.margin, w - 1 - a.margin - px) / rx for px, _, _, rx, _ in summits)
    if a.debug:
        for px, py, hgt, rx, ry in summits:
            print(f'   summit x={px:.0f} y={py:.0f} h={hgt:.1f} rx={rx:.0f} ry={ry:.0f}')
    fit["reach"] = min(1.0, room)               # start inside the grass margin, not just stay inside
    for _ in range(5):
        field = make_field()
        highest = max(field[0][x] for x in range(w))
        foot = 0
        for x in range(w):
            y = 0
            while y < h0 and field[y][x] >= 1.0:
                y += 1
            foot = max(foot, y)
        if a.debug:
            print(f'   fit: height={fit["height"]:.2f} reach={fit["reach"]:.2f} '
                  f'room={room:.2f} peak={highest:.2f}/{want:.2f} foot={foot}/{terrain}')
        if abs(highest - want) < 0.12 and 0.85 * terrain <= foot <= terrain:
            break
        if highest > 0.5:
            fit["height"] *= want / highest
        if foot > terrain:
            fit["reach"] *= max(0.80, terrain / foot)
        elif foot < 0.85 * terrain:                 # grown, so the massif fills the map
            grow = min(1.25, (0.95 * terrain) / max(foot, 1))
            fit["reach"] = min(fit["reach"] * grow, room)   # but never past the grass margin

    tops: list[list[int]] = []
    for level in range(1, levels + 1):
        row = []
        for x in range(w):
            y = 0
            while y < h0 and field[y][x] >= level:
                y += 1
            row.append(y if y > 0 else GONE)
        # The foot stops short of the bottom edge so there is always grass below it
        limit = (lambda x: terrain) if not tops else (lambda x, p=tops[-1]: p[x] - a.gap)
        # note: still in unstretched rows here
        row = [min(v, limit(x)) if v > GONE else GONE for x, v in enumerate(row)]
        row = [v if v > GONE else GONE for v in row]
        deneedle(row, limit)
        fill_gaps(row, limit)
        smooth(row, limit)
        if level > snow_from:
            for _ in range(3):
                despike(row, limit)
                smooth(row, limit)
        tops.append(row)

    if stretch != 1.0:
        """Spread the levels apart, do not scale them. Multiplying every row
        doubles each border's wiggle along with its position, which coarsens the
        detail; shifting each contour down by a share of the extra height leaves
        every border exactly as drawn and just deepens the terraces between."""
        topmost = len(tops) - 1
        per = (h - h0) / max(1, topmost)
        for i, t in enumerate(tops):
            shift = int(round(per * (topmost - i)))
            tops[i] = [v + shift if v > GONE else GONE for v in t]

    """Cliffs. Ledges are jumpable both ways, so a 4-tall cliff is the only thing
    that can actually stop the player, which makes it the one real barrier the
    terrain has. Rather than wait for two levels to drift together, pick the
    stretches where they already run closest and pull them into contact there."""
    cliffs: list[set[int]] = [set() for _ in tops]
    budget = a.cliffs
    windows = []
    for i in range(min(snow_from, len(tops)) - 1):
        low, high = tops[i], tops[i + 1]
        above = tops[i + 2] if i + 2 < len(tops) else None
        for start in range(0, w - a.cliff_run):
            span = range(start, start + a.cliff_run)
            if any(low[x] <= GONE or high[x] <= GONE for x in span):
                continue
            if above is not None and any(above[x] > low[x] - 8 for x in span):
                continue
            windows.append((sum(low[x] - high[x] for x in span) / a.cliff_run, i, start))

    windows.sort()
    if a.debug:
        print(f'   cliff windows: {len(windows)}; best scores '
              f'{[round(w[0], 1) for w in windows[:5]]}')
    taken: list[tuple[int, int, int]] = []
    for score, i, start in windows:
        if budget <= 0:
            break
        if score > a.gap + 3:
            continue        # too far apart to pull together without denting the contour
        if any(j == i and not (start + a.cliff_run <= st or st + a.cliff_run <= start)
               for _, j, st in taken):
            continue
        taken.append((score, i, start))
        budget -= 1
        low, high = tops[i], tops[i + 1]
        for x in range(start, start + a.cliff_run):
            high[x] = low[x] - 2                      # exactly one cliff tall
            cliffs[i + 1].add(x)
    if a.debug:
        for score, i, start in taken:
            print(f'   cliff: levels {i+1}/{i+2} at columns {start}..{start + a.cliff_run - 1}'
                  f' (they ran {score:.0f} rows apart)')

    """Bridge the summit. Relief near the top can punch the highest level into
    separate islands, which reads as patches of snow rather than one cap."""
    for level in range(max(1, snow_from), len(tops)):
        top, below = tops[level], tops[level - 1]
        live = [x for x, v in enumerate(top) if v > GONE]
        for left, right in zip(live, live[1:]):
            if right - left < 2:
                continue
            span = right - left
            for step, x in enumerate(range(left + 1, right), 1):
                blend = top[left] + (top[right] - top[left]) * step / span
                top[x] = max(1, min(int(round(blend)), below[x] - a.gap))
        limit = lambda x, p=below: p[x] - a.gap
        smooth(top, limit)
        for _ in range(3):
            despike(top, limit)
            smooth(top, limit)

    layers = {n: [[0] * w for _ in range(h)] for n in ("ground", "snow", "ledges", "cliffs", "stairs")}

    def put(layer, x, y, sheet, rc):
        if 0 <= y < h and 0 <= x < w:
            layers[layer][y][x] = gid(sheet, rc)

    level_at = [[0] * w for _ in range(h)]
    for i, t in enumerate(tops, 1):
        for x in range(w):
            for y in range(max(0, min(t[x], h))):
                level_at[y][x] = i

    rims: set[tuple[int, int]] = set()
    bare: set[tuple[int, int]] = set()

    for i, t in enumerate(tops, 1):
        upper = "snow" if i > snow_from else "earth"
        lower = "snow" if i > snow_from + 1 else ("earth" if i > 1 else "grass")
        mark = bare.add if i == snow_from + 1 else (lambda cell: None)

        for x in range(w):
            c, tl, tr = t[x], t[x - 1] if x else GONE, t[x + 1] if x < w - 1 else GONE

            if upper == "earth":
                bottom, inner = EARTH_BOTTOM[lower], EARTH_INNER[lower]
                if c > GONE:
                    rim = "left" if tl > c else "right" if tr > c else "flat"
                    put("ledges", x, c, FOREST, EARTH_RIM[rim])
                    rims.add((x, c))
                    if tl == c + 1:
                        low = bottom["junc_l"]
                    elif tl > c:
                        low = inner["west"]
                    elif tr == c + 1:
                        low = bottom["junc_r"]
                    elif tr > c:
                        low = inner["east"]
                    else:
                        low = bottom["flat"]
                    put("ledges", x, c + 1, FOREST, low)
                for side, n in (("east", tl), ("west", tr)):
                    if n <= c:
                        continue
                    for y in range(max(0, c + 2), n):
                        put("ledges", x, y, FOREST, EARTH_CRACK[side])
                    if n > c + 1:
                        put("ledges", x, n, FOREST, EARTH_RIM["cap_r" if side == "east" else "cap_l"])
                    put("ledges", x, n + 1, FOREST, bottom["cap_r" if side == "east" else "cap_l"])
            else:
                face, ends, wall = SNOW_FACE[lower], SNOW_END[lower], SNOW_WALL[lower]
                if c > GONE:
                    if tl <= c - 2 or tr <= c - 2:
                        side = "west" if tl <= c - 2 else "east"
                        rim, lip, _, _ = ends[side]
                        put("ledges", x, c, MOUNTAINS, rim)
                        put("ledges", x, c + 1, MOUNTAINS, lip)
                        n = tl if side == "west" else tr
                        # From the neighbour's face row, not two below it: this wall
                        # sits in the high column, so it covers every row where the
                        # two columns differ. Starting at n+2 is the earth rule --
                        # there the crack is in the low column, under its own face --
                        # and borrowing it leaves a two row gap at the top of every
                        # wall, which draws the whole slope as a dashed line.
                        top = max(0, n)
                        for y in range(top, c):
                            piece = SNOW_CORNER[side] if y == top else wall[side][0]
                            put("ledges", x, y, MOUNTAINS, piece)
                            mark((x, y))
                    elif tr == c - 1 or tl == c - 1:
                        top, mid, low = face["up_right" if tr == c - 1 else "up_left"]
                        put("ledges", x, c - 1, MOUNTAINS, top)
                        put("ledges", x, c, MOUNTAINS, mid)
                        put("ledges", x, c + 1, MOUNTAINS, low)
                        mark((x, c - 1))
                    else:
                        mid, low = face["flat"]
                        put("ledges", x, c, MOUNTAINS, mid)
                        put("ledges", x, c + 1, MOUNTAINS, low)
                    rims.add((x, c))
                    mark((x, c))
                    mark((x, c + 1))
                for side, n in (("east", tl), ("west", tr)):
                    if n < c + 2:
                        continue
                    for y in range(max(0, c + 2), n):
                        put("ledges", x, y, MOUNTAINS, wall[side][1])
                    put("ledges", x, n, MOUNTAINS, ends[side][2])
                    put("ledges", x, n + 1, MOUNTAINS, ends[side][3])

    for i, columns in enumerate(cliffs):
        if not columns:
            continue
        below = "grass" if i == 1 else "earth"
        run = sorted(columns)
        for x in run:
            c = tops[i][x]
            for y in range(c, c + 4):
                if 0 <= y < h:
                    layers["ledges"][y][x] = 0          # the cliff replaces both faces
            put("cliffs", x, c, FOREST, CLIFF["rim"])
            put("cliffs", x, c + 1, FOREST, CLIFF["fill"])
            put("cliffs", x, c + 2, FOREST, CLIFF["fill"])
            put("cliffs", x, c + 3, FOREST, CLIFF["base"][below])
            rims.add((x, c))
        for start, end in _runs(run):
            left, right = start - 1, end + 1
            if 0 <= left < w and tops[i][start] > GONE:
                c = tops[i][start]
                put("cliffs", left, c, FOREST, CLIFF["cap_l"][0])
                put("cliffs", left, c + 1, FOREST, CLIFF["cap_l"][1])
            if 0 <= right < w and tops[i][end] > GONE:
                c = tops[i][end]
                put("cliffs", right, c, FOREST, CLIFF["cap_r"][0])
                put("cliffs", right, c + 1, FOREST, CLIFF["cap_r"][1])

    for y in range(h):
        for x in range(w):
            layers["ground"][y][x] = gid(FOREST, GROUND)
            at = level_at[y][x]
            if at == 0 and (x, y) not in rims:
                layers["ground"][y][x] = gid(FOREST, GRASS)
            if at > snow_from and (x, y) not in bare:
                layers["snow"][y][x] = gid(MOUNTAINS, SNOWFILL)

    placed = []
    if a.stairs:
        spots = []
        for i, t in enumerate(tops):
            if i + 1 > snow_from:
                continue
            for x in range(3, len(t) - 4):
                if all(t[x + d] == t[x] for d in range(-2, 4)) and 0 <= t[x] + 2 < h:
                    spots.append((i, x))
        rng.shuffle(spots)
        for i, x in spots:
            if len(placed) >= a.stairs:
                break
            if any(j == i and abs(px - x) < 14 for j, px in placed):
                continue
            c = tops[i][x]
            for dx in (0, 1):
                layers["ledges"][c][x + dx] = 0
                layers["ledges"][c + 1][x + dx] = 0
            for dy, row in enumerate(STAIR_BLOCK):
                for dx, rc in enumerate(row):
                    put("stairs", x + dx, c + dy, STAIRS, rc)
            placed.append((i, x))

    """Rock and anything touching it is off limits to grass, details and
    entities alike: a patch edge or a trunk sitting on a face reads as a glitch."""
    blocked = set()
    for y in range(h):
        for x in range(w):
            if not (layers["ledges"][y][x] or layers["cliffs"][y][x] or layers["stairs"][y][x]):
                continue
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    blocked.add((x + dx, y + dy))

    terrace = {(x, y) for y in range(h) for x in range(w)
               if 1 <= level_at[y][x] <= snow_from and (x, y) not in blocked}
    patches = grass_patches(terrace, rng, a.patches)
    layers["grass"] = [[0] * w for _ in range(h)]
    for (x, y), rc in patch_tiles(patches).items():
        layers["grass"][y][x] = gid(FOREST, rc)

    """The foot and the terrace patches are both grass, but they carry their own
    densities: the meadow below the mountain is where a forest belongs, a patch
    caught between two ledges holds a stand of a few trees."""
    surfaces = {"meadow": set(), "grass": set(), "earth": set(), "snow": set()}
    for y in range(h):
        for x in range(w):
            cell = (x, y)
            if cell in blocked:
                continue
            if layers["snow"][y][x]:
                surfaces["snow"].add(cell)
            elif cell in patches:
                surfaces["grass"].add(cell)
            elif layers["ground"][y][x] == gid(FOREST, GRASS):
                surfaces["meadow"].add(cell)
            elif level_at[y][x] <= snow_from:
                surfaces["earth"].add(cell)

    props = {
        "ledges": {"clearance": 20, "collides": True},   # 2 tall, jumpable both ways
        "cliffs": {"collides": True},                    # 4 tall, no clearance: a hard wall
        "snow": {"surface": "snow"},
    }
    for name in ("ground", "grass", "snow"):
        el = out.add_tile_layer(name, props=props.get(name))
        out.set_grid(el, layers[name])

    """Details sit between the fills and the rock, so a tuft never covers a cliff
    face and never hides under the ground it decorates."""
    detail_groups = scatter_details(out, layers, gid, rng, a, snow_from, patches, blocked)

    for name in ("ledges", "cliffs", "stairs"):
        if name == "cliffs" and not a.cliffs:
            continue                    # an empty layer still costs a Tile per cell
        el = out.add_tile_layer(name, props=props.get(name))
        out.set_grid(el, layers[name])

    stamps, entities = scatter_entities(out, rng, a, surfaces, blocked, w, h)
    el = out.add_tile_layer("objects")
    out.set_grid(el, stamps)
    out.save()

    print(f"{out.path.relative_to(ROOT)}  {w}x{h}, {a.earth} earth + {a.snow} snow levels, {len(placed)} stairs")
    if patches:
        print(f"  grass patches: {len(patches)} tiles over the earth terraces")
    if entities:
        print("  entities: " + ", ".join(f"{k} x{v}" for k, v in sorted(entities.items())))
    for i, t in enumerate(tops, 1):
        kind = "snow " if i > snow_from else "earth"
        live = [x for x, v in enumerate(t) if v > GONE]
        if not live:
            print(f"  level {i:>2} ({kind}) absent - raise --height or lower --gap/--foot")
            continue
        rows = [t[x] for x in live]
        span = f"{live[0]:>3}..{live[-1]:<4}"
        pieces = 1 + sum(1 for x2, x1 in zip(live[1:], live) if x2 - x1 > 1)
        print(f"  level {i:>2} ({kind}) columns {span} ({len(live):>4} wide, {pieces} piece(s))"
              f" rows {min(rows):>3}..{max(rows):<3} relief {max(rows) - min(rows):>3}")


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("name")
    p.add_argument("--width", type=int, default=152)
    p.add_argument("--height", type=int, default=160)
    p.add_argument("--margin", type=int, default=55, help="grass columns outside the lowest level")
    p.add_argument("--stretch", type=float, default=1.0, help="build at height/stretch, then spread the contours to fill the map")
    p.add_argument("--foot", type=int, default=16, help="grass rows below the lowest contour")
    p.add_argument("--gap", type=int, default=8, help="minimum rows between contours")
    p.add_argument("--dome", type=float, default=1.9, help="mountain profile exponent; higher = steeper sides")
    p.add_argument("--cliffs", type=int, default=0, help="4-tall cliff runs to place (0 = none); they cannot be jumped")
    p.add_argument("--scarps", type=int, default=6, help="steep drops in the terrain; changing this changes the mountain")
    p.add_argument("--cliff", type=int, default=4, help="rows between levels at which they merge into a 4-tall cliff")
    p.add_argument("--cliff-run", dest="cliff_run", type=int, default=6, help="shortest cliff worth drawing, in columns")
    p.add_argument("--rough", type=float, default=0.3, help="total border wobble, in levels (0.2-0.4 is the usable range)")
    p.add_argument("--earth", type=int, default=7)
    p.add_argument("--snow", type=int, default=4)
    p.add_argument("--summit", type=int, default=34, help="walkable rows on the top level")
    p.add_argument("--stairs", type=int, default=12)
    p.add_argument("--details", type=float, default=22.0, help="detail objects per 1000 eligible tiles")
    p.add_argument("--detail-gap", dest="detail_gap", type=int, default=1, help="tiles kept clear around each detail formation")
    p.add_argument("--patches", type=int, default=0, help="grass blobs spread over the earth terraces, so trees can grow above the foot")
    p.add_argument("--trees", type=float, default=0.0, help="trees per 1000 tiles of terrace grass patch")
    p.add_argument("--foot-trees", dest="foot_trees", type=float, default=0.0, help="trees per 1000 tiles of the grass at the foot")
    p.add_argument("--rocks", type=float, default=0.0, help="rocks per 1000 earth tiles")
    p.add_argument("--snow-trees", dest="snow_trees", type=float, default=0.0, help="snowy trees per 1000 snow tiles")
    p.add_argument("--reeds", type=float, default=0.0, help="reeds per 1000 tiles of either grass")
    p.add_argument("--seed", type=int, default=7)
    p.add_argument("--debug", action="store_true", help="print how the massif is fitted to the map")
    p.add_argument("--src", "--from", dest="src", default="mountain", help="map to copy the tilesets from")
    p.add_argument("--force", action="store_true", help="overwrite an existing map file")
    a = p.parse_args()
    if a.force:
        q = Path(a.name)
        q = q if q.suffix == ".tmx" else ROOT / "tiled" / (a.name + ".tmx")
        q.unlink(missing_ok=True)
    build(a)


if __name__ == "__main__":
    main()
