#!/usr/bin/env python3
"""Inspect, render and edit Tiled .tmx maps without reformatting them.

  tmx.py info     <map>
  tmx.py cell     <map> <x> <y>
  tmx.py gids     <map> <layer>
  tmx.py stamp    <map> <entity>
  tmx.py render   <map> <out.png> [--scale 2] [--crop x,y,w,h] [--only a,b] [--hide a,b] [--entities] [--grid]
  tmx.py tileset  <map> --from <other-map> --name <tileset>
  tmx.py scatter  <map> --entity Tree1 --on grass --avoid ledges,cliffs --count 12 [--dry-run --preview p.png]
  tmx.py export   <map>
  tmx.py new      <map> --width 64 --height 48 [--from dungeon --tilesets a,b] [--layers floor,walls]
  tmx.py setpiece <map> [--floor floor] [--group setpiece1]

<map> is a path or a bare name under tiled/ (mountain -> tiled/mountain.tmx).
<layer> is a layer name, or #<id> when several layers share a name.
Cell coordinates are in tiles; object coordinates are in pixels.
"""
from __future__ import annotations

import argparse
import copy
import io
import math
import os
import random
import re
import subprocess
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
SPRITES = ROOT / "client/public/assets/sprites"
ENTITIES = ROOT / "server/src/configs/entities"
TILED = "/Applications/Tiled.app/Contents/MacOS/Tiled"

FLIP_H, FLIP_V, FLIP_D, FLAGS = 0x80000000, 0x40000000, 0x20000000, 0xF0000000
LAYER_TAGS = ("layer", "objectgroup", "imagelayer", "group")


def resolve(name: str) -> Path:
    p = Path(name)
    if p.suffix == ".tmx" and p.exists():
        return p.resolve()
    q = ROOT / "tiled" / (name if name.endswith(".tmx") else name + ".tmx")
    if q.exists():
        return q
    sys.exit(f"no map {name}")


def num(v: float) -> str:
    return str(int(v)) if float(v).is_integer() else f"{v:g}"


def esc(s: str) -> str:
    return s.replace("&", "&amp;").replace('"', "&quot;").replace("<", "&lt;").replace(">", "&gt;")


def texture(entity: str) -> dict | None:
    """TEXTURE component of an entity definition, parsed from server/src/configs/entities."""
    key = entity.upper()
    for f in sorted(ENTITIES.glob("*.ts")):
        src = f.read_text(encoding="utf-8")
        m = re.search(rf"\[EntityName\.{re.escape(key)}\]:\s*\{{", src)
        if not m:
            continue
        rest = src[m.end():]
        end = re.search(r"\n  \[EntityName\.", rest)
        body = rest[: end.start()] if end else rest
        t = re.search(r"ComponentName\.TEXTURE,(.*?)\bkey:", body, re.S)
        if not t:
            continue
        block = t.group(1)
        sheet = re.search(r'spritesheet:\s*"([^"]+)"', block)
        size = re.search(r"tileSize:\s*(\d+)", block)
        rows = re.findall(r"row:\s*(\d+),\s*start:\s*(\d+),\s*end:\s*(\d+)", block)
        if sheet and size and rows:
            return {
                "spritesheet": sheet.group(1),
                "tileSize": int(size.group(1)),
                "rows": [tuple(map(int, r)) for r in rows],
                "file": f.name,
            }
    return None


class Map:
    @staticmethod
    def new(path: str, w: int, h: int, tw: int = 16, th: int = 16, export: str | None = None) -> "Map":
        p = Path(path)
        if p.suffix != ".tmx":
            p = ROOT / "tiled" / (path if path.endswith(".tmx") else path + ".tmx")
        if p.exists():
            sys.exit(f"{p} already exists")
        target = export or f"../client/public/assets/maps/{p.stem}.json"
        p.write_text(
            '<?xml version="1.0" encoding="UTF-8"?>\n'
            f'<map version="1.10" tiledversion="1.11.2" orientation="orthogonal" renderorder="right-down"'
            f' width="{w}" height="{h}" tilewidth="{tw}" tileheight="{th}" infinite="0"'
            f' nextlayerid="1" nextobjectid="1">\n'
            f' <editorsettings>\n  <export target="{esc(target)}" format="json"/>\n </editorsettings>\n'
            "</map>\n",
            encoding="utf-8",
        )
        return Map(str(p))

    def __init__(self, name: str):
        self.path = resolve(name)
        self.root = ET.fromstring(self.path.read_bytes())
        r = self.root
        if r.get("infinite") == "1":
            sys.exit("infinite (chunked) maps are not supported")
        self.w, self.h = int(r.get("width")), int(r.get("height"))
        self.tw, self.th = int(r.get("tilewidth")), int(r.get("tileheight"))

    def tilesets(self) -> list[dict]:
        out = []
        for el in self.root.findall("tileset"):
            src, base = el, self.path.parent
            if el.get("source"):
                tsx = (self.path.parent / el.get("source")).resolve()
                src, base = ET.parse(tsx).getroot(), tsx.parent
            img = src.find("image")
            out.append({
                "el": el,
                "name": src.get("name"),
                "firstgid": int(el.get("firstgid")),
                "tilecount": int(src.get("tilecount")),
                "columns": int(src.get("columns")),
                "tw": int(src.get("tilewidth")),
                "th": int(src.get("tileheight")),
                "margin": int(src.get("margin", 0)),
                "spacing": int(src.get("spacing", 0)),
                "image": (base / img.get("source")).resolve() if img is not None else None,
            })
        return out

    def tileset(self, key: int | str) -> dict | None:
        sets = self.tilesets()
        if isinstance(key, str):
            return next((t for t in sets if t["name"] == key), None)
        gid = key & ~FLAGS
        return max((t for t in sets if t["firstgid"] <= gid), key=lambda t: t["firstgid"], default=None)

    def parents(self) -> dict:
        return {c: p for p in self.root.iter() for c in p}

    def layers(self) -> list[ET.Element]:
        out: list[ET.Element] = []

        def walk(parent: ET.Element) -> None:
            for el in parent:
                if el.tag in LAYER_TAGS:
                    out.append(el)
                    if el.tag == "group":
                        walk(el)

        walk(self.root)
        return out

    def matches(self, key: str, tag: str | None = None) -> list[ET.Element]:
        attr, val = ("id", key[1:]) if key.startswith("#") else ("name", key)
        return [el for el in self.layers() if el.get(attr) == val and (tag is None or el.tag == tag)]

    def layer(self, key: str, tag: str | None = None) -> ET.Element:
        hit = self.matches(key, tag)
        if not hit:
            sys.exit(f"no {tag or 'layer'} {key}")
        if len(hit) > 1:
            ids = ", ".join("#" + el.get("id") for el in hit)
            sys.exit(f"{tag or 'layer'} name {key} is ambiguous, use one of {ids}")
        return hit[0]

    def grid(self, el: ET.Element) -> list[list[int]]:
        data = el.find("data")
        if data is None or data.get("encoding") != "csv":
            sys.exit(f"layer {el.get('name')} is not CSV-encoded")
        vals = [int(v) for v in data.text.replace("\n", "").split(",") if v.strip()]
        w = int(el.get("width"))
        return [vals[y * w:(y + 1) * w] for y in range(int(el.get("height")))]

    def set_grid(self, el: ET.Element, grid: list[list[int]]) -> None:
        el.find("data").text = "\n" + ",\n".join(",".join(map(str, row)) for row in grid) + "\n"

    def depth(self, el: ET.Element) -> int:
        parents, d = self.parents(), 0
        while el in parents:
            el, d = parents[el], d + 1
        return d

    def insert(self, parent: ET.Element, index: int, el: ET.Element) -> None:
        pad = "\n" + " " * (self.depth(parent) + 1)
        if len(parent) == 0:
            parent.text = pad
            el.tail = "\n" + " " * self.depth(parent)
        elif index == 0:
            el.tail = pad
        else:
            el.tail = parent[index - 1].tail
            parent[index - 1].tail = pad
        parent.insert(index, el)

    def next_id(self, attr: str) -> int:
        n = int(self.root.get(attr))
        self.root.set(attr, str(n + 1))
        return n

    def add_tile_layer(self, name: str, before: ET.Element | None = None, props: dict | None = None) -> ET.Element:
        parent = self.parents()[before] if before is not None else self.root
        i = self.depth(parent) + 1
        a, b = " " * (i + 1), " " * (i + 2)
        xml = f'<layer id="{self.next_id("nextlayerid")}" name="{esc(name)}" width="{self.w}" height="{self.h}">\n'
        if props:
            xml += f"{a}<properties>\n"
            for k, v in props.items():
                kind = {bool: ' type="bool"', int: ' type="int"', float: ' type="float"'}.get(type(v), "")
                val = str(v).lower() if isinstance(v, bool) else str(v)
                xml += f'{b}<property name="{esc(k)}"{kind} value="{esc(val)}"/>\n'
            xml += f"{a}</properties>\n"
        zeros = ",\n".join(",".join(["0"] * self.w) for _ in range(self.h))
        xml += f'{a}<data encoding="csv">\n{zeros}\n</data>\n{" " * i}</layer>'
        el = ET.fromstring(xml)
        self.insert(parent, list(parent).index(before) if before is not None else len(parent), el)
        return el

    def add_object_group(self, name: str, props: dict | None = None) -> ET.Element:
        i = self.depth(self.root) + 1
        a, b = " " * (i + 1), " " * (i + 2)
        xml = f'<objectgroup id="{self.next_id("nextlayerid")}" name="{esc(name)}"'
        if not props:
            el = ET.fromstring(xml + "/>")
        else:
            xml += ">\n" + f"{a}<properties>\n"
            for k, v in props.items():
                kind = {bool: ' type="bool"', int: ' type="int"', float: ' type="float"'}.get(type(v), "")
                val = str(v).lower() if isinstance(v, bool) else str(v)
                xml += f'{b}<property name="{esc(k)}"{kind} value="{esc(val)}"/>\n'
            xml += f"{a}</properties>\n{' ' * i}</objectgroup>"
            el = ET.fromstring(xml)
        self.insert(self.root, len(self.root), el)
        return el

    def add_tileset_from(self, other: "Map", name: str) -> dict:
        have = self.tileset(name)
        if have:
            return have
        src = other.tileset(name)
        if not src:
            sys.exit(f"{other.path.name} has no tileset {name}")
        el = copy.deepcopy(src["el"])
        el.set("firstgid", str(max((t["firstgid"] + t["tilecount"] for t in self.tilesets()), default=1)))
        target = el if el.get("source") else el.find("image")
        path = (other.path.parent / target.get("source")).resolve()
        target.set("source", os.path.relpath(path, self.path.parent))
        after = [i for i, c in enumerate(self.root) if c.tag in ("tileset", "editorsettings")]
        self.insert(self.root, (max(after) + 1) if after else 0, el)
        return self.tileset(name)

    def add_tile_collision(self, sheet: str, rc: tuple[int, int], box: tuple[int, int, int, int]) -> bool:
        """Give a tile a collision shape, in the tileset embedded in this map."""
        ts = self.tileset(sheet)
        if not ts:
            sys.exit(f"{self.path.name} has no tileset {sheet}")
        el, tid = ts["el"], (rc[0] - 1) * ts["columns"] + rc[1] - 1
        tiles = el.findall("tile")
        if any(int(t.get("id")) == tid and t.find("objectgroup") is not None for t in tiles):
            return False
        x, y, w, h = box
        i = self.depth(el) + 1
        a, b = " " * (i + 1), " " * (i + 2)
        tile = ET.fromstring(
            f'<tile id="{tid}">\n{a}<objectgroup draworder="index" id="2">\n'
            f'{b}<object id="1" x="{x}" y="{y}" width="{w}" height="{h}"/>\n'
            f"{a}</objectgroup>\n{' ' * i}</tile>"
        )
        later = [c for c in el if c.tag == "tile" and int(c.get("id")) > tid]
        at = list(el).index(later[0]) if later else len(el)
        self.insert(el, at, tile)
        return True

    def add_tileset(self, name: str, image: str, tilecount: int, columns: int,
                    tw: int = 16, th: int = 16) -> dict:
        """Add a tileset for a sheet no other map uses yet."""
        have = self.tileset(name)
        if have:
            return have
        from PIL import Image as _Image
        src = ROOT / "client/public/assets/sprites" / image
        w, h = _Image.open(src).size
        first = max((t["firstgid"] + t["tilecount"] for t in self.tilesets()), default=1)
        rel = os.path.relpath(src, self.path.parent)
        i = self.depth(self.root) + 1
        el = ET.fromstring(
            f'<tileset firstgid="{first}" name="{esc(name)}" tilewidth="{tw}" tileheight="{th}"'
            f' tilecount="{tilecount}" columns="{columns}">\n'
            f'{" " * (i + 1)}<image source="{esc(rel)}" width="{w}" height="{h}"/>\n'
            f'{" " * i}</tileset>'
        )
        after = [j for j, c in enumerate(self.root) if c.tag in ("tileset", "editorsettings")]
        self.insert(self.root, (max(after) + 1) if after else 0, el)
        return self.tileset(name)

    def add_tile_object(self, group: ET.Element, gid: int, x: float, y: float,
                        w: int = 16, h: int = 16) -> ET.Element:
        """A tile object, as Tiled writes them: gid, and y is the bottom edge."""
        el = ET.Element("object", {
            "id": str(self.next_id("nextobjectid")), "gid": str(gid),
            "x": num(x), "y": num(y), "width": num(w), "height": num(h),
        })
        self.insert(group, len(group), el)
        return el

    def add_object(self, group: ET.Element, name: str, x: float, y: float) -> ET.Element:
        el = ET.Element("object", {
            "id": str(self.next_id("nextobjectid")),
            "name": name,
            "x": num(x),
            "y": num(y),
            "width": "1",
            "height": "1",
        })
        self.insert(group, len(group), el)
        return el

    def stamp(self, entity: str) -> tuple[list[list[int]], dict]:
        tex = texture(entity)
        if not tex:
            sys.exit(f"no TEXTURE component found for {entity} in {ENTITIES.relative_to(ROOT)}")
        ts = self.tileset(tex["spritesheet"])
        if not ts:
            sys.exit(f"{self.path.name} has no tileset {tex['spritesheet']}; add it with: tmx.py tileset "
                     f"{self.path.stem} --from <map-that-has-it> --name {tex['spritesheet']}")
        cols = ts["columns"]
        rows = [[ts["firstgid"] + (r - 1) * cols + (c - 1) for c in range(s, e + 1)] for r, s, e in tex["rows"]]
        return rows, tex

    def objects(self) -> list[tuple[ET.Element, ET.Element]]:
        return [(g, o) for g in self.layers() if g.tag == "objectgroup" for o in g.findall("object")]

    def save(self) -> None:
        buf = io.BytesIO()
        ET.ElementTree(self.root).write(buf, encoding="UTF-8", xml_declaration=False)
        body = buf.getvalue().decode("utf-8").replace(" />", "/>")
        self.path.write_text('<?xml version="1.0" encoding="UTF-8"?>\n' + body + "\n", encoding="utf-8")


def label(el: ET.Element) -> str:
    return f"#{el.get('id')} {el.get('name')}"


def cmd_info(m: Map, _a) -> None:
    r = m.root
    print(f"{m.path.relative_to(ROOT)}  {m.w}x{m.h} tiles of {m.tw}x{m.th}px"
          f"  nextlayerid={r.get('nextlayerid')} nextobjectid={r.get('nextobjectid')}")
    exp = r.find("editorsettings/export")
    reference = r.find("./properties/property[@name='reference']")
    if reference is not None and reference.get("value") == "true":
        print("export -> none, reference map (verify:maps skips it)")
    else:
        print(f"export -> {exp.get('target') if exp is not None else 'NONE (verify:maps will fail)'}")
    print("\ntilesets")
    for t in m.tilesets():
        last = t["firstgid"] + t["tilecount"] - 1
        print(f"  {t['firstgid']:>6}-{last:<6} {t['name']:<32} {t['columns']} cols  {t['image'].name if t['image'] else '-'}")
    print("\nlayers (document order = draw order)")
    for el in m.layers():
        props = {p.get("name"): p.get("value") for p in el.findall("properties/property")}
        pad = "  " * (m.depth(el) - 1)
        flags = " hidden" if el.get("visible") == "0" else ""
        if el.tag == "layer":
            n = sum(v != 0 for row in m.grid(el) for v in row)
            print(f"  {pad}#{el.get('id'):<4} tile   {el.get('name'):<24} {n:>6} tiles{flags}  {props or ''}")
        elif el.tag == "objectgroup":
            names: dict[str, int] = {}
            for o in el.findall("object"):
                names[o.get("name") or "?"] = names.get(o.get("name") or "?", 0) + 1
            summary = ", ".join(f"{k} x{v}" for k, v in sorted(names.items()))
            print(f"  {pad}#{el.get('id'):<4} object {el.get('name'):<24} {len(el.findall('object')):>6} objs{flags}  {props or ''}")
            if summary:
                print(f"  {pad}       {summary}")
        else:
            print(f"  {pad}#{el.get('id'):<4} {el.tag:<6} {el.get('name')}{flags}")


def cmd_cell(m: Map, a) -> None:
    x, y = a.x, a.y
    print(f"cell ({x},{y})  px ({x * m.tw},{y * m.th})")
    for el in m.layers():
        if el.tag != "layer":
            continue
        gid = m.grid(el)[y][x]
        if gid:
            ts = m.tileset(gid)
            lid = (gid & ~FLAGS) - ts["firstgid"]
            print(f"  #{el.get('id'):<4} {el.get('name'):<24} gid {gid:<6} {ts['name']}[{lid}]"
                  f" row {lid // ts['columns'] + 1} col {lid % ts['columns'] + 1}")


def cmd_gids(m: Map, a) -> None:
    counts: dict[int, int] = {}
    for row in m.grid(m.layer(a.layer)):
        for v in row:
            if v:
                counts[v] = counts.get(v, 0) + 1
    for gid, n in sorted(counts.items(), key=lambda kv: -kv[1]):
        ts = m.tileset(gid)
        lid = (gid & ~FLAGS) - ts["firstgid"]
        flip = "".join(f for f, bit in (("H", FLIP_H), ("V", FLIP_V), ("D", FLIP_D)) if gid & bit)
        print(f"  {gid:<10} x{n:<5} {ts['name']}[{lid}] row {lid // ts['columns'] + 1} col {lid % ts['columns'] + 1} {flip}")


def cmd_stamp(m: Map, a) -> None:
    rows, tex = m.stamp(a.entity)
    w, h = max(map(len, rows)), len(rows)
    print(f"{a.entity}: {tex['spritesheet']} ({tex['file']}), {w}x{h} tiles, origin 0.5/0.5")
    print(f"object point = stamp top-left px + ({w * m.tw / 2:g}, {h * m.th / 2:g})")
    for row in rows:
        print("  " + " ".join(f"{g:>5}" for g in row))


def cmd_tileset(m: Map, a) -> None:
    ts = m.add_tileset_from(Map(a.src), a.name)
    m.save()
    print(f"{a.name} at firstgid {ts['firstgid']} in {m.path.name}")


def cmd_render(m: Map, a) -> None:
    from PIL import Image, ImageDraw

    only = set(a.only.split(",")) if a.only else None
    hide = set(a.hide.split(",")) if a.hide else set()
    picked = lambda el: (only is None or el.get("name") in only or "#" + el.get("id") in only) \
        and el.get("name") not in hide and "#" + el.get("id") not in hide

    parents = m.parents()

    def visible(el: ET.Element) -> bool:
        while el is not None and el is not m.root:
            if el.get("visible") == "0" and not a.all:
                return False
            el = parents.get(el)
        return True

    sheets: dict[Path, Image.Image] = {}
    tiles: dict[int, Image.Image | None] = {}

    def sheet(path: Path) -> Image.Image:
        if path not in sheets:
            sheets[path] = Image.open(path).convert("RGBA")
        return sheets[path]

    def tile(gid: int) -> Image.Image | None:
        if gid in tiles:
            return tiles[gid]
        ts = m.tileset(gid)
        im = None
        if ts and ts["image"] and ts["image"].exists():
            lid = (gid & ~FLAGS) - ts["firstgid"]
            if 0 <= lid < ts["tilecount"]:
                c, r = lid % ts["columns"], lid // ts["columns"]
                x = ts["margin"] + c * (ts["tw"] + ts["spacing"])
                y = ts["margin"] + r * (ts["th"] + ts["spacing"])
                im = sheet(ts["image"]).crop((x, y, x + ts["tw"], y + ts["th"]))
                if gid & FLIP_D:
                    im = im.transpose(Image.Transpose.TRANSPOSE)
                if gid & FLIP_H:
                    im = im.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
                if gid & FLIP_V:
                    im = im.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
        tiles[gid] = im
        return im

    canvas = Image.new("RGBA", (m.w * m.tw, m.h * m.th), (24, 24, 28, 255))
    marks: list[tuple[str, float, float, float, float]] = []
    sprites: list[tuple[float, Image.Image, int, int]] = []

    for el in m.layers():
        if not visible(el) or not picked(el):
            continue
        if el.tag == "layer":
            for y, row in enumerate(m.grid(el)):
                for x, gid in enumerate(row):
                    im = gid and tile(gid)
                    if im:
                        canvas.alpha_composite(im, (x * m.tw, (y + 1) * m.th - im.height))
        elif el.tag == "objectgroup":
            for o in el.findall("object"):
                x, y = float(o.get("x", 0)), float(o.get("y", 0))
                w, h = float(o.get("width", 0)), float(o.get("height", 0))
                name = o.get("name") or ""
                if o.get("gid"):
                    im = tile(int(o.get("gid")))
                    if im:
                        canvas.alpha_composite(im, (int(x), int(y) - im.height))
                    continue
                tex = texture(name) if a.entities and name else None
                path = SPRITES / f"{tex['spritesheet']}.png" if tex else None
                if tex and path.exists():
                    src, size = sheet(path), tex["tileSize"]
                    cols = src.width // size
                    tw = max(e - s + 1 for _, s, e in tex["rows"]) * size
                    im = Image.new("RGBA", (tw, len(tex["rows"]) * size))
                    for i, (r, s, e) in enumerate(tex["rows"]):
                        for c in range(s, e + 1):
                            f = (r - 1) * cols + (c - 1)
                            fx, fy = (f % cols) * size, (f // cols) * size
                            im.paste(src.crop((fx, fy, fx + size, fy + size)), ((c - s) * size, i * size))
                    sprites.append((y, im, int(x - im.width / 2), int(y - im.height / 2)))
                marks.append((name, x, y, w, h))

    for _, im, x, y in sorted(sprites, key=lambda s: s[0]):
        canvas.alpha_composite(im, (x, y))

    if a.crop:
        cx, cy, cw, ch = (int(v) for v in a.crop.split(","))
        ox, oy = cx * m.tw, cy * m.th
        canvas = canvas.crop((ox, oy, ox + cw * m.tw, oy + ch * m.th))
    else:
        ox = oy = 0

    s = a.scale
    canvas = canvas.resize((canvas.width * s, canvas.height * s), Image.Resampling.NEAREST)
    draw = ImageDraw.Draw(canvas)

    if a.grid:
        for gx in range(0, canvas.width, m.tw * s):
            draw.line([(gx, 0), (gx, canvas.height)], fill=(255, 255, 255, 40))
        for gy in range(0, canvas.height, m.th * s):
            draw.line([(0, gy), (canvas.width, gy)], fill=(255, 255, 255, 40))
        for gx in range(0, canvas.width, m.tw * s * 5):
            draw.text((gx + 2, 2), str(gx // (m.tw * s) + ox // m.tw), fill=(255, 255, 0, 255))
        for gy in range(0, canvas.height, m.th * s * 5):
            draw.text((2, gy + 2), str(gy // (m.th * s) + oy // m.th), fill=(255, 255, 0, 255))

    if not a.no_marks:
        for name, x, y, w, h in marks:
            px, py = (x - ox) * s, (y - oy) * s
            if w > 1 or h > 1:
                draw.rectangle([px, py, px + w * s, py + h * s], outline=(255, 80, 200, 255))
            draw.ellipse([px - 3, py - 3, px + 3, py + 3], fill=(255, 60, 60, 255), outline=(0, 0, 0, 255))
            if name:
                draw.text((px + 5, py - 6), name, fill=(255, 255, 255, 255), stroke_width=2, stroke_fill=(0, 0, 0, 255))

    canvas.save(a.out)
    print(f"wrote {a.out} ({canvas.width}x{canvas.height})")


def parse_on(specs: list[str]) -> list[tuple[str, set[int] | None]]:
    out = []
    for spec in specs:
        name, _, gids = spec.partition("=")
        out.append((name, {int(g) for g in gids.split(",")} if gids else None))
    return out


def cmd_scatter(m: Map, a) -> None:
    rng = random.Random(a.seed)

    kinds = []
    for spec in a.entity:
        name, _, weight = spec.partition(":")
        rows, _ = m.stamp(name)
        kinds.append((name, rows, float(weight or 1)))

    on = [(m.grid(el), g) for n, g in parse_on(a.on) for el in m.matches(n, "layer")]
    avoid = [m.grid(el) for n in (a.avoid.split(",") if a.avoid else []) for el in m.matches(n, "layer")]
    if not on:
        sys.exit(f"no tile layer matches --on {a.on}")

    ok_on = [[any(g[y][x] and (s is None or g[y][x] in s) for g, s in on) for x in range(m.w)] for y in range(m.h)]
    blocked = [[any(g[y][x] for g in avoid) for x in range(m.w)] for y in range(m.h)]

    group = m.layer(a.group, "objectgroup")
    target = m.layer(a.layer, "layer") if m.matches(a.layer, "layer") else None
    if target is None and a.layer.startswith("#"):
        sys.exit(f"no tile layer {a.layer}; pass a name to create one")
    taken = [[False] * m.w for _ in range(m.h)]
    if target is not None:
        for y, row in enumerate(m.grid(target)):
            for x, v in enumerate(row):
                taken[y][x] = bool(v)

    points = [(float(o.get("x")), float(o.get("y")), a.clear_radius) for _, o in m.objects()]
    for c in a.clear or []:
        x, y, r = (float(v) for v in c.split(","))
        points.append((x, y, r))

    def fits(x0: int, y0: int, rows: list[list[int]]) -> bool:
        w, h = max(map(len, rows)), len(rows)
        if x0 < 0 or y0 < 0 or x0 + w > m.w or y0 + h > m.h:
            return False
        for y in range(y0, y0 + h):
            for x in range(x0, x0 + w):
                if not ok_on[y][x]:
                    return False
        p = a.pad
        for y in range(max(0, y0 - p), min(m.h, y0 + h + p)):
            for x in range(max(0, x0 - p), min(m.w, x0 + w + p)):
                if blocked[y][x]:
                    return False
        g = a.gap
        for y in range(max(0, y0 - g), min(m.h, y0 + h + g)):
            for x in range(max(0, x0 - g), min(m.w, x0 + w + g)):
                if taken[y][x]:
                    return False
        l, t, r, b = x0 * m.tw, y0 * m.th, (x0 + w) * m.tw, (y0 + h) * m.th
        for px, py, rad in points:
            dx = max(l - px, 0, px - r)
            dy = max(t - py, 0, py - b)
            if dx * dx + dy * dy < rad * rad:
                return False
        return True

    cells = [(x, y) for y in range(m.h) for x in range(m.w)]
    centers = []
    if a.clusters:
        seeds = [c for c in cells if any(fits(c[0], c[1], k[1]) for k in kinds)]
        centers = rng.sample(seeds, min(a.clusters, len(seeds)))

    def key(c: tuple[int, int]) -> float:
        if not centers:
            return rng.random()
        d = min(math.dist(c, z) for z in centers)
        weight = math.exp(-(d * d) / (2 * a.spread * a.spread)) + 1e-6
        return rng.random() ** (1 / weight)

    order = sorted(cells, key=key, reverse=True)
    placed = []
    for x, y in order:
        if len(placed) >= a.count:
            break
        pool = [k for k in kinds if fits(x, y, k[1])]
        if not pool:
            continue
        name, rows, _ = rng.choices(pool, weights=[k[2] for k in pool])[0]
        w, h = max(map(len, rows)), len(rows)
        for yy in range(y, y + h):
            for xx in range(x, x + w):
                taken[yy][xx] = True
        placed.append((name, x, y, rows))

    print(f"placed {len(placed)}/{a.count}")
    for name, x, y, rows in placed:
        w, h = max(map(len, rows)), len(rows)
        px, py = x * m.tw + w * m.tw / 2, y * m.th + h * m.th / 2
        print(f"  {name:<12} stamp ({x},{y}) {w}x{h}  object ({num(px)},{num(py)})")

    if not placed:
        return

    if target is None:
        target = m.add_tile_layer(a.layer, before=group)
    grid = m.grid(target)
    for name, x, y, rows in placed:
        for dy, row in enumerate(rows):
            for dx, gid in enumerate(row):
                grid[y + dy][x + dx] = gid
        w, h = max(map(len, rows)), len(rows)
        m.add_object(group, name, x * m.tw + w * m.tw / 2, y * m.th + h * m.th / 2)
    m.set_grid(target, grid)

    if a.preview:
        ns = argparse.Namespace(out=a.preview, scale=2, crop=None, only=None, hide=None,
                                entities=False, grid=False, all=False, no_marks=False)
        cmd_render(m, ns)
    if a.dry_run:
        print("dry run, nothing written")
        return
    m.save()
    print(f"saved {m.path.relative_to(ROOT)}")


def cmd_export(m: Map, _a) -> None:
    exp = m.root.find("editorsettings/export")
    if exp is None:
        sys.exit("no <editorsettings><export target=…> in the map; set one in Tiled via File > Export As")
    out = (m.path.parent / exp.get("target")).resolve()
    fmt = exp.get("format", "json")
    subprocess.run([TILED, "--export-map", fmt, str(m.path), str(out)], check=True)
    print(f"exported {out.relative_to(ROOT)}")


def cmd_new(_m, a) -> None:
    out = Map.new(a.map, a.width, a.height)
    if a.src:
        src = Map(a.src)
        for name in (a.tilesets or "").split(",") if a.tilesets else []:
            name = name.strip()
            if not name:
                continue
            if not src.tileset(name):
                sys.exit(f"{a.src} has no tileset {name}")
            ts = out.add_tileset_from(src, name)
            print(f"  tileset {name} at firstgid {ts['firstgid']}")
    for name in (a.layers or "").split(","):
        name = name.strip()
        if name:
            out.add_tile_layer(name)
            print(f"  tile layer {name}")
    out.add_object_group("objects")
    out.save()
    exp = out.root.find("editorsettings/export")
    print(f"{out.path.relative_to(ROOT)}  {a.width}x{a.height}  export -> {exp.get('target')}")
    print("next: add it to MapName, configs/maps.ts, a Scene, and the scene list (see SKILL.md)")


def cmd_setpiece(m: Map, a) -> None:
    """Room interiors as configs/biomes.ts expects them.

    Coordinates are relative to a corner of the room, one tile inside the floor,
    which is the anchor the dungeon's committed interiors were measured from."""
    floor = m.grid(m.layer(a.floor))
    cells = [(x, y) for y, row in enumerate(floor) for x, v in enumerate(row) if v]
    if not cells:
        sys.exit(f"layer {a.floor} is empty; --floor names the layer the room is drawn on")
    x0, x1 = min(c[0] for c in cells), max(c[0] for c in cells)
    y0, y1 = min(c[1] for c in cells), max(c[1] for c in cells)
    anchors = {
        "top-left": ((x0 + 1) * m.tw, (y0 + 1) * m.th),
        "top-right": (x1 * m.tw, (y0 + 1) * m.th),
        "bottom-left": ((x0 + 1) * m.tw, y1 * m.th),
        "bottom-right": (x1 * m.tw, y1 * m.th),
    }
    print(f"/** {a.floor} spans tiles {x0}..{x1} x {y0}..{y1} */")
    for group in m.layers():
        if group.tag != "objectgroup" or not group.findall("object"):
            continue
        if a.group and group.get("name") != a.group:
            continue
        props = {q.get("name"): q.get("value") for q in group.findall("properties/property")}
        origin = props.get("origin")
        if origin not in anchors:
            print(f"/** {group.get('name')}: skipped, origin property is {origin!r} */")
            continue
        ax, ay = anchors[origin]
        print("      {")
        print(f"        origin: RoomInteriorOrigin.{origin.replace('-', '_').upper()},")
        print("        entities: [")
        for o in group.findall("object"):
            name = (o.get("name") or "").upper()
            dx = round(float(o.get("x", 0)) - ax)
            dy = round(float(o.get("y", 0)) - ay)
            print(f"          {{ name: EntityName.{name}, x: {dx}, y: {dy} }},")
        print("        ],")
        print("      },")


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("info")
    s.add_argument("map")

    s = sub.add_parser("cell")
    s.add_argument("map")
    s.add_argument("x", type=int)
    s.add_argument("y", type=int)

    s = sub.add_parser("gids")
    s.add_argument("map")
    s.add_argument("layer")

    s = sub.add_parser("stamp")
    s.add_argument("map")
    s.add_argument("entity")

    s = sub.add_parser("tileset")
    s.add_argument("map")
    s.add_argument("--from", dest="src", required=True)
    s.add_argument("--name", required=True)

    s = sub.add_parser("render")
    s.add_argument("map")
    s.add_argument("out")
    s.add_argument("--scale", type=int, default=2)
    s.add_argument("--crop", help="x,y,w,h in tiles")
    s.add_argument("--only", help="comma-separated layer names or #ids")
    s.add_argument("--hide", help="comma-separated layer names or #ids")
    s.add_argument("--entities", action="store_true", help="draw TEXTURE entities at their object points, as in game")
    s.add_argument("--grid", action="store_true", help="tile grid with coordinates every 5 tiles")
    s.add_argument("--all", action="store_true", help="include hidden layers")
    s.add_argument("--no-marks", action="store_true", help="skip object markers and labels")

    s = sub.add_parser("scatter")
    s.add_argument("map")
    s.add_argument("--entity", action="append", required=True, help="Name or Name:weight, repeatable")
    s.add_argument("--on", action="append", required=True, help="layer or layer=gid,gid; footprint must be fully on one of these")
    s.add_argument("--avoid", help="comma-separated layers the footprint (plus --pad) must not touch")
    s.add_argument("--count", type=int, required=True)
    s.add_argument("--layer", default="objects", help="tile layer for the editor visual (default objects, skipped by the client)")
    s.add_argument("--group", default="objects", help="object group for the entities")
    s.add_argument("--gap", type=int, default=0, help="min tiles between footprints")
    s.add_argument("--pad", type=int, default=0, help="extra tiles around the footprint that must clear --avoid")
    s.add_argument("--clear", action="append", help="x,y,r in px to keep free, e.g. a spawn point")
    s.add_argument("--clear-radius", type=float, default=24, help="px kept free around every existing object")
    s.add_argument("--clusters", type=int, default=0, help="group placements around N random centers")
    s.add_argument("--spread", type=float, default=6, help="cluster radius in tiles")
    s.add_argument("--seed", type=int, default=1)
    s.add_argument("--dry-run", action="store_true")
    s.add_argument("--preview", help="render the result to this png")

    s = sub.add_parser("export")
    s.add_argument("map")

    s = sub.add_parser("new")
    s.add_argument("map")
    s.add_argument("--width", type=int, required=True)
    s.add_argument("--height", type=int, required=True)
    s.add_argument("--from", dest="src", help="map to copy tilesets from")
    s.add_argument("--tilesets", help="comma-separated tileset names to copy")
    s.add_argument("--layers", default="", help="comma-separated tile layers to create, in draw order")

    s = sub.add_parser("setpiece")
    s.add_argument("map")
    s.add_argument("--floor", default="floor", help="tile layer the room is drawn on; its bounds give the anchor")
    s.add_argument("--group", help="one object group, default every group with objects")

    a = p.parse_args()
    m = None if a.cmd == "new" else Map(a.map)
    {
        "info": cmd_info, "cell": cmd_cell, "gids": cmd_gids, "stamp": cmd_stamp, "tileset": cmd_tileset,
        "render": cmd_render, "scatter": cmd_scatter, "export": cmd_export,
        "new": cmd_new, "setpiece": cmd_setpiece,
    }[a.cmd](m, a)


if __name__ == "__main__":
    main()
