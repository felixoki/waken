"""Compact map tilesets.

Maps are painted in Tiled with whatever sheet holds the art, usually one from
`sprites/collection/`. The game never loads the collection: `build` copies every
tile a game map renders from a collection sheet onto a compact sheet, rewrites
the map to use it, and exports the map. Placements are kept in `tiled/tiles.json`
so a sheet only ever grows; tiles already placed never move.

Compact sheets: the still tiles of each building interior in
`sprites/buildings/<building>.png`, with each tile animation in its own file
(`blacksmith_forge.png`); outdoor tiles one file per kind in `sprites/tiles/`
(`grass_ground`, `road`, `ship`, ...). `RULES` (by source sheet) decides, then
`MAPS` (by map). A tileset with the Tiled property `editorOnly` is left alone:
painted for reference in the editor, never loaded by the game.

    python3 scripts/tiles.py build     # move painted collection tiles onto compact sheets
    python3 scripts/tiles.py verify    # fails while a game map renders a collection tile
"""

from __future__ import annotations

import copy
import json
import math
import os
import subprocess
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SPRITES = ROOT / "client/public/assets/sprites"
COLLECTION = SPRITES / "collection"
MANIFEST = ROOT / "tiled/tiles.json"
TILED_APP = "/Applications/Tiled.app/Contents/MacOS/Tiled"
TILE = 16
FLAGS = 0xE0000000
GAP = 1

sys.path.insert(0, str(ROOT / ".claude/skills/tiled/scripts"))
from tmx import Map  # noqa: E402

MAPS = {
    "village.tmx": None,
    "isles.tmx": None,
    "blacksmith.tmx": "blacksmith",
    "farm.tmx": "farm",
    "windmill.tmx": "farm",
    "fishing_hut.tmx": "fishing_hut",
    "glassblower.tmx": "glassblower",
    "herbalist.tmx": "herbalist",
    "home.tmx": "home",
    "market-house.tmx": "market",
    "tavern.tmx": "tavern",
}
BUILDINGS = {
    "blacksmith", "blacksmith_forge", "farm", "farm_fireplace", "fishing_hut", "glassblower",
    "glassblower_forge", "glassblower_master", "herbalist", "herbalist_boiler", "home", "market", "tavern",
}

VILLAGE_GRASS = {
    257, 290, 291, 292, 293, 294, 295, 300, 307, 308, 309, 310, 311, 317, 324, 325, 326,
    341, 342, 343, 344, 345, 358, 359, 360, 361, 362, 375, 376, 377,
}
VILLAGE_FENCES = {31, 32, 45, 46, 47, 62, 64, 79, 80, 81}
VILLAGE_ROAD = {132, 133, 134, 171, 172, 173, 188, 189, 190, 192, 197, 205, 206, 207}
VILLAGE_DETAILS = {480, 481, 497, 498} | set(range(897, 969))
FARM_FENCES = {485, 486, 487, 516, 518, 547, 548, 549, 574, 577, 579, 580}

RULES = {
    "village_terrain": lambda i: "grass_ground_details" if i in VILLAGE_DETAILS
    else "fences" if i in VILLAGE_FENCES else "road" if i in VILLAGE_ROAD else "grass_ground",
    "ground_grass": lambda i: "grass_ground",
    "forest_ground": lambda i: "grass_ground",
    "grass_stairs": lambda i: "grass_ground",
    "ground_grass_details": lambda i: "grass_ground_details",
    "herbalist_exterior": lambda i: "grass_ground_details",
    "farm_ground": lambda i: "water_coasts" if i == 525 else "grass_ground" if i in (499, 517)
    else "fences" if i in FARM_FENCES else "field",
    "farm_exterior": lambda i: "road",
    "road_stone": lambda i: "road",
    "road_walls_paving": lambda i: "walls" if i < 171 else "road",
    "camp_exterior": lambda i: "benches",
    "fishing_boat1": lambda i: "ship",
    "chimney_smoke": lambda i: "chimney",
    "bonfire": lambda i: "bonfire",
    "bridges": lambda i: "bridges",
    "fishing_dock": lambda i: "dock",
    "water_coasts": lambda i: "water_coasts",
    "water_details": lambda i: "water_details",
    "water_lilies": lambda i: "water_lilies",
    "isles_ground_grass": lambda i: "isles_ground",
    "isles_rocks": lambda i: "isles_rocks",
    "isles_clouds": lambda i: "isles_clouds",
    "isles_clouds_animated": lambda i: "isles_clouds_animated",
    "mountain_ground": lambda i: "snow",
    "snow_details": lambda i: "snow_details",
    "blacksmith_forge": lambda i: "blacksmith_forge",
    "glassblower_forge": lambda i: "glassblower_forge",
    "glassblower_master": lambda i: "glassblower_master",
    "herbalist_boiler": lambda i: "herbalist_boiler",
    "fireplace": lambda i: "farm_fireplace",
}


def folder(sheet: str) -> str:
    return "buildings" if sheet in BUILDINGS else "tiles"


def sheet_path(sheet: str) -> Path:
    return SPRITES / folder(sheet) / f"{sheet}.png"


def load_manifest() -> dict:
    return json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {}


def save_manifest(manifest: dict) -> None:
    MANIFEST.write_text(json.dumps(manifest, indent=1, sort_keys=True) + "\n")


class Source:
    def __init__(self, name: str, path: Path):
        self.name = name
        self.path = path
        self.image = Image.open(path).convert("RGBA")
        self.columns = self.image.width // TILE

    def tile(self, tid: int) -> Image.Image:
        x, y = (tid % self.columns) * TILE, (tid // self.columns) * TILE
        return self.image.crop((x, y, x + TILE, y + TILE))

    def blank(self, tid: int) -> bool:
        return not any(self.tile(tid).tobytes()[3::4])


def tile_meta(ts_el: ET.Element) -> dict[int, ET.Element]:
    return {int(t.get("id")): t for t in ts_el.findall("tile")}


def source_name(ts: dict) -> str:
    return ts["image"].stem


def is_source(ts: dict) -> bool:
    """Anything a map paints that is not already a compact or generation sheet, unless marked editorOnly."""
    image = ts["image"]
    if image is None or any(SPRITES / d in image.parents for d in ("tiles", "buildings")):
        return False
    props = {p.get("name"): p.get("value") for p in ts["el"].findall("properties/property")}
    return props.get("editorOnly") != "true"


def rendered(m: Map) -> list[tuple[ET.Element, str]]:
    """Layers whose tiles the game draws: tile layers except `objects`, and rendering object groups."""
    out = []
    for el in m.layers():
        if el.tag == "layer" and el.get("name") != "objects":
            out.append((el, "layer"))
        elif el.tag == "objectgroup":
            props = {p.get("name"): p.get("value") for p in el.findall("properties/property")}
            if props.get("renders") == "true" and props.get("texture"):
                out.append((el, "objects"))
    return out


def gids(m: Map, el: ET.Element, kind: str) -> list[int]:
    if kind == "layer":
        return [g for row in m.grid(el) for g in row if g]
    return [int(o.get("gid")) for o in el.findall("object") if o.get("gid")]


def owner(sets: list[dict], gid: int) -> dict | None:
    gid &= ~FLAGS
    return max((t for t in sets if t["firstgid"] <= gid < t["firstgid"] + t["tilecount"]), key=lambda t: t["firstgid"], default=None)


def target(map_sheet: str | None, source: str, tid: int) -> str:
    rule = RULES.get(source)
    sheet = rule(tid) if rule else map_sheet
    if not sheet:
        sys.exit(f"no sheet for {source} tile {tid}: add a rule to RULES in scripts/tiles.py")
    return sheet


def complete_frames(ids: set[int], metas: dict[int, ET.Element], columns: int) -> set[int]:
    """Every frame of a painted animated block, whole: the static tiles around the
    animated ones are copied along each frame offset, so each frame reads as one picture."""
    extra: set[int] = set()
    for group in clusters(set(ids), columns):
        shifts = set()
        for t in group:
            meta = metas.get(t)
            if meta is None:
                continue
            for f in meta.findall("animation/frame"):
                frame = int(f.get("tileid"))
                shifts.add((frame % columns - t % columns, frame // columns - t // columns))
        for dx, dy in shifts - {(0, 0)}:
            for t in group:
                x, y = t % columns + dx, t // columns + dy
                if 0 <= x < columns and y >= 0:
                    extra.add(y * columns + x)
    return extra


def clusters(ids: set[int], columns: int) -> list[list[int]]:
    left, out = set(ids), []
    while left:
        stack, group = [left.pop()], []
        while stack:
            t = stack.pop()
            group.append(t)
            x, y = t % columns, t // columns
            for n in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if 0 <= n[0] < columns and n[1] >= 0:
                    nid = n[1] * columns + n[0]
                    if nid in left:
                        left.remove(nid)
                        stack.append(nid)
        out.append(sorted(group))
    return sorted(out, key=lambda g: g[0])


def pack(sheet: str, manifest: dict, wanted: dict[str, set[int]], keep_meta: set[tuple[str, int]], sources: dict) -> None:
    """Place wanted (source, tile) pairs on a compact sheet; existing cells never move."""
    m = manifest.setdefault(sheet, {"columns": 0, "cells": {}})
    placed = {(s, t) for s, t in m["cells"].values()}
    taken = {tuple(map(int, c.split(","))) for c in m["cells"]}
    pixels = {}
    for cell, (s, t) in m["cells"].items():
        if (s, t) not in keep_meta:
            pixels.setdefault(sources[s].tile(t).tobytes(), cell)

    blocks = []
    for source, ids in sorted(wanted.items()):
        src = sources[source]
        aliased = {k for k in m.get("aliases", {})}
        new = {t for t in ids if (source, t) not in placed and f"{source}:{t}" not in aliased}
        plain_blank = {t for t in new if src.blank(t) and (source, t) not in keep_meta}
        for t in sorted(plain_blank):
            blocks.append((source, [t], src.columns, True))
        for group in clusters(new - plain_blank, src.columns):
            blocks.append((source, group, src.columns, False))

    if not m["columns"]:
        area = sum((max(t % c for t in g) - min(t % c for t in g) + 1) * (max(t // c for t in g) - min(t // c for t in g) + 1) for _, g, c, _ in blocks)
        widest = max((max(t % c for t in g) - min(t % c for t in g) + 1 for _, g, c, _ in blocks), default=1)
        m["columns"] = max(widest, 8 * math.ceil(math.sqrt(max(area, 1) * 1.6) / 8))
    columns = m["columns"]

    def free(x: int, y: int, w: int, h: int) -> bool:
        return x + w <= columns and all(
            (x + i, y + j) not in taken for j in range(-GAP, h + GAP) for i in range(-GAP, w + GAP)
        )

    order = sorted(blocks, key=lambda b: (b[3], -(max(t // b[2] for t in b[1]) - min(t // b[2] for t in b[1])), b[0], b[1][0]))
    for source, group, c, blank in order:
        src = sources[source]
        if blank or len(group) == 1:
            key = src.tile(group[0]).tobytes()
            if (source, group[0]) not in keep_meta and key in pixels:
                m.setdefault("aliases", {})[f"{source}:{group[0]}"] = pixels[key]
                continue
        x0, y0 = min(t % c for t in group), min(t // c for t in group)
        w = max(t % c for t in group) - x0 + 1
        h = max(t // c for t in group) - y0 + 1
        y = 0
        while True:
            spot = next((x for x in range(columns - w + 1) if free(x, y, w, h)), None)
            if spot is not None:
                break
            y += 1
        for t in group:
            cell = (spot + t % c - x0, y + t // c - y0)
            taken.add(cell)
            key = f"{cell[0]},{cell[1]}"
            m["cells"][key] = [source, t]
            if (source, t) not in keep_meta:
                pixels.setdefault(src.tile(t).tobytes(), key)


def resolve_cell(manifest: dict, sheet: str, source: str, tid: int) -> int | None:
    m = manifest.get(sheet)
    if not m:
        return None
    alias = m.get("aliases", {}).get(f"{source}:{tid}")
    if alias:
        x, y = map(int, alias.split(","))
        return y * m["columns"] + x
    for cell, (s, t) in m["cells"].items():
        if s == source and t == tid:
            x, y = map(int, cell.split(","))
            return y * m["columns"] + x
    return None


def render_sheet(sheet: str, manifest: dict, sources: dict) -> Image.Image:
    m = manifest[sheet]
    rows = max((int(c.split(",")[1]) + 1 for c in m["cells"]), default=1)
    img = Image.new("RGBA", (m["columns"] * TILE, rows * TILE))
    for cell, (s, t) in m["cells"].items():
        x, y = map(int, cell.split(","))
        img.paste(sources[s].tile(t), (x * TILE, y * TILE))
    return img


def ensure_tileset(m: Map, sheet: str, img: Image.Image) -> dict:
    columns = img.width // TILE
    count = columns * (img.height // TILE)
    rel = Path(os.path.relpath(sheet_path(sheet), m.path.parent)).as_posix()
    ts = m.tileset(sheet)
    if ts and ts["image"] != sheet_path(sheet).resolve():
        ts["el"].set("name", f"{sheet} (collection)")
        ts = None
    if ts:
        nxt = min((t["firstgid"] for t in m.tilesets() if t["firstgid"] > ts["firstgid"]), default=None)
        if nxt is not None and ts["firstgid"] + count > nxt:
            relocate(m, ts, max(t["firstgid"] + t["tilecount"] for t in m.tilesets()))
            ts = m.tileset(sheet)
        el = ts["el"]
        el.set("tilecount", str(count))
        el.set("columns", str(columns))
        image = el.find("image")
        image.set("source", rel)
        image.set("width", str(img.width))
        image.set("height", str(img.height))
        return m.tileset(sheet)
    first = max((t["firstgid"] + t["tilecount"] for t in m.tilesets()), default=1)
    i = m.depth(m.root) + 1
    el = ET.fromstring(
        f'<tileset firstgid="{first}" name="{sheet}" tilewidth="{TILE}" tileheight="{TILE}"'
        f' tilecount="{count}" columns="{columns}">\n'
        f'{" " * (i + 1)}<image source="{rel}" width="{img.width}" height="{img.height}"/>\n'
        f'{" " * i}</tileset>'
    )
    after = [j for j, c in enumerate(m.root) if c.tag in ("tileset", "editorsettings")]
    m.insert(m.root, (max(after) + 1) if after else 0, el)
    return m.tileset(sheet)


def remap_all(m: Map, fn) -> None:
    for el in m.layers():
        if el.tag == "layer":
            grid = m.grid(el)
            new = [[fn(g) if g else 0 for g in row] for row in grid]
            if new != grid:
                m.set_grid(el, new)
        elif el.tag == "objectgroup":
            for o in el.findall("object"):
                if o.get("gid"):
                    o.set("gid", str(fn(int(o.get("gid")))))


def relocate(m: Map, ts: dict, first: int) -> None:
    old = ts["firstgid"]
    end = old + ts["tilecount"]
    ts["el"].set("firstgid", str(first))
    remap_all(m, lambda g: (g & FLAGS) | ((g & ~FLAGS) - old + first) if old <= (g & ~FLAGS) < end else g)


def copy_meta(m: Map, compact_el: ET.Element, dst: int, src_tile: ET.Element, frame) -> None:
    if any(int(t.get("id")) == dst for t in compact_el.findall("tile")):
        return
    tile = copy.deepcopy(src_tile)
    tile.set("id", str(dst))
    for f in tile.findall("animation/frame"):
        f.set("tileid", str(frame(int(f.get("tileid")))))
    later = [c for c in compact_el if c.tag == "tile" and int(c.get("id")) > dst]
    at = list(compact_el).index(later[0]) if later else len(compact_el)
    m.insert(compact_el, at, tile)


def survey(keep: dict | None = None) -> tuple[dict, set, dict]:
    """Every collection tile each compact sheet needs, plus animation frames."""
    wanted: dict[str, dict[str, set[int]]] = {}
    keep_meta: set[tuple[str, int]] = set()
    sources: dict[str, Source] = {}
    metas_all: dict[str, dict[int, ET.Element]] = {}
    for file, sheet in MAPS.items():
        m = Map(str(ROOT / "tiled" / file))
        sets = m.tilesets()
        metas = {source_name(ts): tile_meta(ts["el"]) for ts in sets if is_source(ts)}
        for name, meta in metas.items():
            metas_all.setdefault(name, {}).update(meta)
        for el, kind in rendered(m):
            for g in gids(m, el, kind):
                ts = owner(sets, g)
                if not ts or not is_source(ts):
                    continue
                name = source_name(ts)
                sources.setdefault(name, Source(name, ts["image"]))
                stack = [(g & ~FLAGS) - ts["firstgid"]]
                while stack:
                    tid = stack.pop()
                    dest = target(sheet, name, tid)
                    bucket = wanted.setdefault(dest, {}).setdefault(name, set())
                    if tid in bucket:
                        continue
                    bucket.add(tid)
                    meta = metas[name].get(tid)
                    if meta is not None:
                        keep_meta.add((name, tid))
                        stack.extend(int(f.get("tileid")) for f in meta.findall("animation/frame"))
    for dest, by_source in list(wanted.items()):
        for name, ids in by_source.items():
            whole = complete_frames(ids, metas_all.get(name, {}), sources[name].columns)
            ids |= whole
    for dest, by_source in (keep or {}).items():
        for name, ids in by_source.items():
            sources.setdefault(name, Source(name, COLLECTION / f"{name}.png"))
            wanted.setdefault(dest, {}).setdefault(name, set()).update(ids)
            keep_meta.update((name, t) for t in ids)
    return wanted, keep_meta, sources


def cmd_build(args: list[str]) -> None:
    keep = json.loads(Path(args[args.index("--keep") + 1]).read_text()) if "--keep" in args else None
    manifest = load_manifest()
    wanted, keep_meta, sources = survey(keep)
    known = manifest.pop("#sources", {})
    for name, src in sources.items():
        known[name] = src.path.relative_to(SPRITES).as_posix()
    for sheet in manifest.values():
        for s, _ in sheet["cells"].values():
            sources.setdefault(s, Source(s, SPRITES / known[s]))
    for sheet, by_source in sorted(wanted.items()):
        pack(sheet, manifest, by_source, keep_meta, sources)
    images = {}
    for sheet in manifest:
        if sheet.startswith("#"):
            continue
        images[sheet] = render_sheet(sheet, manifest, sources)
        sheet_path(sheet).parent.mkdir(parents=True, exist_ok=True)
        images[sheet].save(sheet_path(sheet), optimize=True)
    save_manifest({**manifest, "#sources": known})

    changed = []
    for file, map_sheet in MAPS.items():
        m = Map(str(ROOT / "tiled" / file))
        before = ET.tostring(m.root)
        sets = m.tilesets()
        metas = {source_name(ts): tile_meta(ts["el"]) for ts in sets if is_source(ts)}
        moves: dict[int, tuple[str, int]] = {}
        textures: dict[ET.Element, str] = {}
        for el, kind in rendered(m):
            for g in gids(m, el, kind):
                ts = owner(sets, g)
                if not ts or not is_source(ts):
                    continue
                tid = (g & ~FLAGS) - ts["firstgid"]
                dest = target(map_sheet, source_name(ts), tid)
                moves[g & ~FLAGS] = (dest, resolve_cell(manifest, dest, source_name(ts), tid))
                if kind == "objects":
                    textures[el] = dest
        present = {ts["name"] for ts in sets if ts["name"] in images and not is_source(ts)}
        compact = {s: ensure_tileset(m, s, images[s]) for s in sorted({d for d, _ in moves.values()} | present)}
        sets = m.tilesets()
        rendered_els = {id(el) for el, _ in rendered(m)}
        for el in m.layers():
            if id(el) not in rendered_els:
                continue
            if el.tag == "layer":
                grid = m.grid(el)
                new = [[(g & FLAGS) | (compact[moves[g & ~FLAGS][0]]["firstgid"] + moves[g & ~FLAGS][1]) if g and (g & ~FLAGS) in moves else g for g in row] for row in grid]
                if new != grid:
                    m.set_grid(el, new)
            else:
                for o in el.findall("object"):
                    g = int(o.get("gid") or 0)
                    if g and (g & ~FLAGS) in moves:
                        dest, cell = moves[g & ~FLAGS]
                        o.set("gid", str((g & FLAGS) | (compact[dest]["firstgid"] + cell)))
                if el in textures:
                    for p in el.findall("properties/property"):
                        if p.get("name") == "texture":
                            p.set("value", textures[el])
        for old_gid, (dest, cell) in moves.items():
            ts = owner(sets, old_gid)
            if ts is None or not is_source(ts):
                continue
            tid = old_gid - ts["firstgid"]
            meta = metas[source_name(ts)].get(tid)
            if meta is not None:
                name = source_name(ts)
                copy_meta(m, compact[dest]["el"], cell, meta, lambda f, n=name: resolve_cell(manifest, target(map_sheet, n, f), n, f))
        used = set()
        for el in m.layers():
            for g in gids(m, el, "layer" if el.tag == "layer" else "objects"):
                ts = owner(m.tilesets(), g)
                if ts:
                    used.add(ts["name"])
        for ts in m.tilesets():
            if is_source(ts) and ts["name"] not in used:
                m.root.remove(ts["el"])
        if ET.tostring(m.root) != before:
            m.save()
            changed.append(m)
    for m in changed:
        export(m)
    for sheet in sorted(images):
        img = images[sheet]
        print(f"{folder(sheet)}/{sheet}.png: {img.width // TILE}x{img.height // TILE} tiles")
    print(f"{len(changed)} maps rewritten and exported")


def export(m: Map) -> None:
    exp = m.root.find("editorsettings/export")
    if exp is None:
        return
    out = (m.path.parent / exp.get("target")).resolve()
    subprocess.run([TILED_APP, "--export-map", exp.get("format", "json"), str(m.path), str(out)], check=True)


def cmd_verify(_args: list[str]) -> None:
    bad = []
    for file in MAPS:
        m = Map(str(ROOT / "tiled" / file))
        sets = m.tilesets()
        for el, kind in rendered(m):
            if any((ts := owner(sets, g)) and is_source(ts) for g in gids(m, el, kind)):
                bad.append(f"{file}: {el.get('name')}")
    if bad:
        print("game maps still render collection tiles:\n  " + "\n  ".join(bad))
        print("run: npm run tiles")
        sys.exit(1)
    print("every game map renders compact sheets only")


COMMANDS = {"build": cmd_build, "verify": cmd_verify}

if __name__ == "__main__":
    if len(sys.argv) < 2 or sys.argv[1] not in COMMANDS:
        sys.exit(__doc__)
    COMMANDS[sys.argv[1]](sys.argv[2:])
