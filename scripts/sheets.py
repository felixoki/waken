"""Categorised entity spritesheets.

Every still-textured entity lives on one of a few tile-grid sheets, grouped by
kind (all barrels, all trees, ...). An item's icon sits left of its texture's
bottom row, the same convention as the icon sheets. Configs reference these
sheets with ordinary `spritesheet` + `tiles` and `icon` values.

`build` is incremental: entities already on their category sheet keep their
tiles. Anything whose texture points elsewhere (a new entity drawn from any
source sheet) is composed, given the house ground shadow if it has none, placed
in free space in its group's rows, and its config is rewritten.

    python3 scripts/sheets.py build      # place new entities, rewrite configs
    python3 scripts/sheets.py verify     # fails if an entity still needs placing
    python3 scripts/sheets.py unused     # sprites nothing loads, and loads from the collection
    python3 scripts/sheets.py preview <category> <out.png>
"""

from __future__ import annotations

import json
import re
import subprocess
import sys
from functools import lru_cache
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
SPRITES = ROOT / "client/public/assets/sprites"
CONFIGS = ROOT / "server/src/configs"
TILE = 16

CATEGORIES = {
    "items": lambda v, sheet: sheet.startswith("icons")
    or sheet == "items"
    or v["file"] in ("resources", "equipment", "food", "cloths", "fish"),
    "interior": lambda v, sheet: v["file"] == "interior",
    "nature": lambda v, sheet: v["file"] in ("flora", "rocks", "crops", "ingredients"),
    "buildings": lambda v, sheet: v["file"] in ("buildings", "transitions"),
}
COLUMNS = {"items": 24, "interior": 32, "nature": 32, "buildings": 48}
ICONS = "icons"

GROUPS = {
    "boxes_fish": "box",
    "fish_stand": "fish",
    "banquet_table": "table",
    "alchemist_table": "table",
    "mortar_and_pestle": "alchemy",
    "remains": "remains",
    "sleeping_bag": "bed",
    "pillows": "bed",
    "down_bed": "bed",
    "pelt_bed": "bed",
    "king_size_bed": "bed",
}
PATTERNS = [
    (r"^(apple)?tree\d*$", "tree"),
    (r"^((cave_)?rocks?|pebble)\d*$", "rock"),
    (r"_ore$", "ore"),
    (r"^(bush\d*|raspberry|strawberry_bush)$", "bush"),
    (r"^(glowshroom\d*|bearded_tooth_fungus)$", "mushroom"),
    (r"^reed\d*$", "reed"),
    (r"^stump\d*$", "stump"),
    (r"^ruin\d*$", "ruin"),
    (r"_plant$", "crop"),
]

NO_SHADOW: set[str] = {
    "rock9",
    "rock10",
    "rock11",
    "rock12",
    "rock13",
    "rock14",
    "rock15",
    "rock16",
    "rock17",
    "rock18",
    "rock19",
    "pebble1",
    "pebble2",
    "pebble3",
    "pebble4",
    "pebble5",
}
NO_SHADOW_FILES = {"crops", "ingredients"}
NO_SHADOW_PATTERN = re.compile(r"^(bush\d*|glowshroom\d*|reed\d*)$")
SHADOW_MAX_HEIGHT = 32
SOLID = 200
SHADOW = (42, 40, 61, 100)
SHADOW_OFFSET = (1, 2)


@lru_cache(maxsize=None)
def dump() -> dict:
    out = subprocess.run(
        ["npx", "tsx", "scripts/entities.ts"],
        cwd=ROOT, capture_output=True, text=True, check=True,
    )
    return json.loads(out.stdout)


def sheet_files() -> dict[str, str]:
    files = {}
    for m in dump()["maps"].values():
        for s in m["sheets"]:
            files[s["key"]] = s["file"]
    return files


@lru_cache(maxsize=None)
def image(key: str) -> Image.Image:
    path = SPRITES / sheet_files().get(key, f"{key}.png")
    if not path.exists():
        path = SPRITES / "collection" / f"{key}.png"
    if not path.exists():
        return Image.new("RGBA", (TILE, TILE))
    return Image.open(path).convert("RGBA")


def compose(texture: dict) -> Image.Image | None:
    tiles = texture.get("tiles") or []
    if not tiles:
        return None
    size = texture["tileSize"]
    src = image(texture["spritesheet"])
    columns = src.width // size
    width = max(t["end"] - t["start"] + 1 for t in tiles) * size
    out = Image.new("RGBA", (width, len(tiles) * size))
    for i, row in enumerate(tiles):
        for col in range(row["start"], row["end"] + 1):
            index = (row["row"] - 1) * columns + (col - 1)
            sx, sy = (index % columns) * size, (index // columns) * size
            out.paste(src.crop((sx, sy, sx + size, sy + size)), ((col - row["start"]) * size, i * size))
    return out


def icon_image(ref: dict) -> Image.Image:
    src = image(ref["spritesheet"])
    x, y = (ref["col"] - 1) * TILE, (ref["row"] - 1) * TILE
    return src.crop((x, y, x + TILE, y + TILE))


def unshadowed(v: dict) -> bool:
    return (
        v["name"] in NO_SHADOW
        or v["file"] in NO_SHADOW_FILES
        or bool(NO_SHADOW_PATTERN.match(v["name"]))
    )


def has_shadow(img: Image.Image) -> bool:
    count = 0
    for r, g, b, a in img.getdata():
        if 0 < a < SOLID and r * 0.299 + g * 0.587 + b * 0.114 < 90:
            count += 1
            if count > 4:
                return True
    return False


def solid_height(img: Image.Image) -> int:
    box = img.split()[3].point(lambda a: 255 if a >= SOLID else 0).getbbox()
    return box[3] - box[1] if box else 0


def shadowed(img: Image.Image) -> Image.Image:
    w, h = img.size
    src = img.load()
    out = img.copy()
    dst = out.load()
    dx, dy = SHADOW_OFFSET
    for y in range(h):
        for x in range(w):
            if dst[x, y][3]:
                continue
            sx, sy = x - dx, y - dy
            if 0 <= sx < w and 0 <= sy < h and src[sx, sy][3] >= SOLID:
                dst[x, y] = SHADOW
    return out


def natural(name: str):
    return [int(t) if t.isdigit() else t for t in re.split(r"(\d+)", name)]


def group_of(name: str, v: dict, names: set[str], category: str) -> str:
    if category == "items":
        return v["file"]
    for pattern, group in PATTERNS:
        if re.search(pattern, name):
            return group
    if category == "nature":
        return "plant"
    stem = re.sub(r"\d+$", "", name)
    if stem in GROUPS:
        return GROUPS[stem]
    head = stem.split("_")[0]
    stems = {re.sub(r"\d+$", "", n) for n in names}
    for candidate in (head[:-1], head[:-2]):
        if candidate and candidate in stems:
            return candidate
    if head.endswith("s") and not head.endswith("ss") and len(head) > 3:
        return head[:-1]
    return head


def source_block(file: str, name: str) -> tuple[str, int, int] | None:
    """The entity's definition text in its config file, or None for helper-built ones."""
    path = CONFIGS / "entities" / f"{file}.ts"
    text = path.read_text()
    key = name.upper()
    m = re.search(r"\[EntityName\.%s\]: \{" % re.escape(key), text)
    if not m:
        return None
    nxt = re.search(r"\n  \[EntityName\.[A-Z0-9_]+\]: ", text[m.end():])
    end = m.end() + nxt.start() if nxt else len(text)
    block = text[m.start():end]
    if not re.search(r'name: ComponentName\.TEXTURE,\s*config: \{\s*spritesheet: "', block):
        return None
    return str(path), m.start(), end


def entity_block(file: str, name: str) -> tuple[str, int, int]:
    path = CONFIGS / "entities" / f"{file}.ts"
    text = path.read_text()
    m = re.search(r"\[EntityName\.%s\]: \{" % re.escape(name.upper()), text)
    if not m:
        sys.exit(f"{name}: no literal definition in {file}.ts")
    nxt = re.search(r"\n  \[EntityName\.[A-Z0-9_]+\]: ", text[m.end():])
    return str(path), m.start(), m.end() + nxt.start() if nxt else len(text)


def config_span(text: str, start: int, end: int, component: str) -> tuple[int, int]:
    m = re.compile(r"name: ComponentName\.%s,\s*config: \{" % component).search(text, start, end)
    if not m:
        sys.exit(f"no {component} config between {start} and {end}")
    depth, i = 1, m.end()
    while depth:
        depth += {"{": 1, "}": -1}.get(text[i], 0)
        i += 1
    return m.end() - 1, i


def bracket_end(text: str, open_at: int) -> int:
    depth, i = 1, open_at + 1
    while depth:
        depth += {"[": 1, "]": -1}.get(text[i], 0)
        i += 1
    return i


TALL = 24


def strip_frame(cfg: dict, f: int) -> Image.Image:
    tiles, stride = cfg["tiles"], cfg.get("stride") or len(cfg["tiles"])
    wrap = cfg.get("wrap") or cfg["frames"]
    step, lane = f % wrap, f // wrap
    rows = []
    for t in tiles:
        width = t["end"] - t["start"] + 1
        if cfg["direction"] == "vertical":
            rows.append({"row": t["row"] + step * stride, "start": t["start"] + lane * width, "end": t["end"] + lane * width})
        else:
            rows.append({"row": t["row"] + lane * stride, "start": t["start"] + step * width, "end": t["end"] + step * width})
    return compose({"spritesheet": cfg["spritesheet"], "tileSize": cfg["tileSize"], "tiles": rows})


def wrap_of(frames: int, h: int) -> int:
    """Frames per column: one column unless that would run taller than TALL rows."""
    if frames * h <= TALL:
        return frames
    return max(1, TALL // h) if h <= TALL else 1


def animation_block(cfg: dict, wrap: int) -> Image.Image:
    frames = [strip_frame(cfg, f) for f in range(cfg["frames"])]
    w, h = frames[0].size
    lanes = -(-len(frames) // wrap)
    out = Image.new("RGBA", (w * lanes, h * wrap))
    for f, im in enumerate(frames):
        out.paste(im, ((f // wrap) * w, (f % wrap) * h))
    return out


def extras(entities: dict) -> list[dict]:
    """Animated, growing and connecting textures: blocks that move as a whole."""
    out = []
    for name, v in entities.items():
        a = v.get("animation")
        if a and a.get("tiles"):
            w = max(t["end"] - t["start"] + 1 for t in a["tiles"])
            h = len(a["tiles"])
            wrap = wrap_of(a["frames"], h)
            out.append({
                "name": name, "kind": "anim", "file": v["file"], "cfg": a, "sheet": a["spritesheet"],
                "w": w * -(-a["frames"] // wrap), "h": h * wrap, "wrap": wrap,
                "origin": (a["tiles"][0]["start"] - 1, a["tiles"][0]["row"] - 1),
                "aligned": a["direction"] == "vertical"
                and (not a.get("stride") or a["stride"] == h)
                and (a.get("wrap") or a["frames"]) == wrap,
            })
        g = v.get("growable")
        if g:
            for i, stage in enumerate(g["stages"]):
                out.append({
                    "name": name, "kind": "stage", "index": i, "file": v["file"], "cfg": g, "sheet": g["spritesheet"],
                    "w": max(t["end"] - t["start"] + 1 for t in stage["tiles"]), "h": len(stage["tiles"]),
                    "origin": (stage["tiles"][0]["start"] - 1, stage["tiles"][0]["row"] - 1), "aligned": True,
                    "tiles": stage["tiles"],
                })
        c = v.get("connectable")
        if c:
            out.append({
                "name": name, "kind": "connect", "file": v["file"], "cfg": c, "sheet": c["spritesheet"],
                "w": 4, "h": 4, "origin": ((c.get("col") or 1) - 1, (c.get("row") or 1) - 1), "aligned": True,
            })
    return out


def extra_category(e: dict, entities: dict) -> str | None:
    v = entities[e["name"]]
    for category, select in CATEGORIES.items():
        if category != "items" and select(v, e["sheet"]):
            return category
    return None


def extra_image(e: dict) -> Image.Image:
    if e["kind"] == "anim":
        return animation_block(e["cfg"], e["wrap"])
    if e["kind"] == "stage":
        return compose({"spritesheet": e["sheet"], "tileSize": e["cfg"]["tileSize"], "tiles": e["tiles"]})
    x, y = e["origin"]
    return image(e["sheet"]).crop((x * TILE, y * TILE, (x + 4) * TILE, (y + 4) * TILE))


def rewrite_extra(text: str, start: int, end: int, e: dict, category: str, x: int, y: int) -> str:
    rows = lambda w, h: [(y + 1 + i, x + 1, x + w) for i in range(h)]
    if e["kind"] == "connect":
        a, b = config_span(text, start, end, "CONNECTABLE")
        return text[:a] + f'{{ spritesheet: "{category}", tileSize: {TILE}, row: {y + 1}, col: {x + 1} }}' + text[b:]
    if e["kind"] == "anim":
        a, b = config_span(text, start, end, "TEXTURE_ANIMATION")
        cfg = text[a:b]
        w = max(t["end"] - t["start"] + 1 for t in e["cfg"]["tiles"])
        h = len(e["cfg"]["tiles"])
        cfg = re.sub(r'spritesheet: "[^"]+"', f'spritesheet: "{category}"', cfg, count=1)
        cfg = re.sub(r"\n\s*stride: \d+,", "", cfg)
        cfg = re.sub(r"\n\s*wrap: \d+,", "", cfg)
        cfg = re.sub(r'direction: "horizontal"', 'direction: "vertical"', cfg)
        if e["wrap"] != e["cfg"]["frames"]:
            cfg = re.sub(r"(\n(\s*)frames: \d+,)", lambda m: f"{m.group(1)}\n{m.group(2)}wrap: {e['wrap']},", cfg, count=1)
        t = cfg.index("tiles: [") + len("tiles: ") 
        t_end = bracket_end(cfg, t)
        indent = re.search(r"\n(\s*)tiles: \[", cfg).group(1)
        body = "".join(f"\n{indent}  {{ row: {r}, start: {s0}, end: {e0} }}," for r, s0, e0 in rows(w, h))
        cfg = cfg[:t] + f"[{body}\n{indent}]" + cfg[t_end:]
        return text[:a] + cfg + text[b:]
    a, b = config_span(text, start, end, "GROWABLE")
    cfg = text[a:b]
    cfg = re.sub(r'spritesheet: "[^"]+"', f'spritesheet: "{category}"', cfg, count=1)
    spans = [m.end() - 1 for m in re.finditer(r"tiles: \[", cfg)]
    t = spans[e["index"]]
    t_end = bracket_end(cfg, t)
    indent = re.findall(r"\n(\s*)tiles: \[", cfg[:t + 1])[-1]
    body = "".join(f"\n{indent}  {{ row: {r}, start: {s0}, end: {e0} }}," for r, s0, e0 in rows(e["w"], e["h"]))
    cfg = cfg[:t] + f"[{body}\n{indent}]" + cfg[t_end:]
    return text[:a] + cfg + text[b:]


def category_of(name: str, v: dict) -> str | None:
    texture = v.get("texture")
    if not texture or not texture.get("tiles") or not v.get("key"):
        return None
    for category, select in CATEGORIES.items():
        if select(v, texture["spritesheet"]):
            return category
    return None


class Sheet:
    def __init__(self, category: str):
        self.category = category
        self.columns = COLUMNS[category]
        self.cells: dict[tuple[int, int], str] = {}
        self.bands: dict[str, list[list[int]]] = {}
        self.blocks: dict[str, tuple[int, int, int, int]] = {}

    def height(self) -> int:
        return max((y + 1 for _, y in self.cells), default=0)

    def free(self, x: int, y: int, w: int, h: int) -> bool:
        return all((x + i, y + j) not in self.cells for j in range(h) for i in range(w))

    def occupy(self, owner: str, group: str, x: int, y: int, w: int, h: int) -> None:
        for j in range(h):
            for i in range(w):
                self.cells[(x + i, y + j)] = group
        self.blocks[owner] = (x, y, w, h)
        bands = self.bands.setdefault(group, [])
        for band in bands:
            if band[0] <= y + h and y <= band[1]:
                band[0], band[1] = min(band[0], y), max(band[1], y + h)
                return
        bands.append([y, y + h])

    def place(self, owner: str, group: str, w: int, h: int) -> tuple[int, int]:
        if w > self.columns:
            sys.exit(f"{owner} is {w} tiles wide; raise COLUMNS[{self.category!r}]")
        others = [b for g, bs in self.bands.items() if g != group for b in bs]
        for top, bottom in self.bands.get(group, []):
            limit = min([b[0] for b in others if b[0] >= bottom] + [10 ** 6])
            for y in range(top, limit - h + 1):
                if any(self.cells.get((i, y + j)) not in (None, group) for j in range(h) for i in range(self.columns)):
                    continue
                for x in range(self.columns - w + 1):
                    if self.free(x, y, w, h):
                        self.occupy(owner, group, x, y, w, h)
                        return x, y
        y = self.height()
        self.occupy(owner, group, 0, y, w, h)
        return 0, y


@lru_cache(maxsize=None)
def literal_refs() -> frozenset:
    found = set()
    for path in CONFIGS.rglob("*.ts"):
        for m in ICON_REF.finditer(path.read_text()):
            found.add((m.group(2), int(m.group(5)), int(m.group(8))))
    return frozenset(found)


def plan() -> tuple[dict, dict, dict]:
    """Placements per category, icon remaps, and config rewrites."""
    data = dump()
    entities = data["entities"]
    chosen: dict[str, dict] = {}
    for name, v in entities.items():
        category = category_of(name, v)
        if not category:
            continue
        literal = source_block(v["file"], name) is not None
        if literal or v["texture"]["spritesheet"] == category:
            chosen[name] = {**v, "category": category, "literal": literal}
    names_by: dict[str, set[str]] = {}
    for n, v in chosen.items():
        names_by.setdefault(v["category"], set()).add(n)

    sheets = {c: Sheet(c) for c in CATEGORIES}
    canvases: dict[str, dict[str, tuple[int, int, Image.Image]]] = {c: {} for c in CATEGORIES}
    rewrites: dict[str, dict] = {}
    icons: dict[tuple[str, int, int], dict] = {}

    def block_of(v: dict) -> tuple[Image.Image, Image.Image | None]:
        tex = compose(v["texture"])
        if not v.get("flat") and not unshadowed(v) and solid_height(tex) <= SHADOW_MAX_HEIGHT and not has_shadow(tex):
            tex = shadowed(tex)
        icon = icon_image(v["icon"]) if v.get("icon") else None
        return tex, icon

    pending = []
    seen_keys: dict[str, str] = {}
    for name in sorted(chosen, key=natural):
        v = {**chosen[name], "name": name}
        category = v["category"]
        group = group_of(name, v, names_by[category], category)
        texture = v["texture"]
        if v["key"] in seen_keys:
            continue
        seen_keys[v["key"]] = name
        w = max(t["end"] - t["start"] + 1 for t in texture["tiles"]) * texture["tileSize"] // TILE
        h = len(texture["tiles"]) * texture["tileSize"] // TILE
        has_icon = bool(v.get("icon"))
        on_sheet = texture["spritesheet"] == category and texture["tileSize"] == TILE
        icon_on_sheet = not has_icon or v["icon"]["spritesheet"] == category
        if on_sheet and icon_on_sheet:
            x = texture["tiles"][0]["start"] - 1 - (1 if has_icon else 0)
            y = texture["tiles"][0]["row"] - 1
            sheets[category].occupy(name, group, x, y, w + (1 if has_icon else 0), h)
            tex, icon = compose(texture), (icon_image(v["icon"]) if has_icon else None)
            canvases[category][name] = (x, y, tex, icon)
        elif v["literal"]:
            pending.append((name, v, category, group, w, h, has_icon))

    owned = {
        (v["icon"]["spritesheet"], v["icon"]["row"], v["icon"]["col"])
        for v in chosen.values()
        if v.get("icon")
    }
    for sheet, row, col in sorted(literal_refs()):
        if sheet in CATEGORIES and (sheet, row, col) not in owned:
            owner = f"{sheet}:{row}:{col}"
            sheets[sheet].occupy(owner, ICONS, col - 1, row - 1, 1, 1)
            canvases[sheet][owner] = (col - 1, row - 1, None, icon_image({"spritesheet": sheet, "row": row, "col": col}))

    moves = []
    blocks = extras(entities)
    for e in sorted(blocks, key=lambda e: (e["kind"] != "connect", natural(e["name"]), e.get("index", 0))):
        category = extra_category(e, entities)
        if not category:
            continue
        owner = e["name"] + ("" if e["kind"] == "anim" else f"#{e['kind']}{e.get('index', '')}")
        group = {"stage": "crop", "anim": "animation", "connect": "fence"}[e["kind"]]
        if e["sheet"] == category and e["aligned"]:
            x, y = e["origin"]
            sheets[category].occupy(owner, group, x, y, e["w"], e["h"])
            canvases[category][owner] = (x, y, extra_image(e), None)
        else:
            moves.append((e, category, group, owner))

    for name, v, category, group, w, h, has_icon in sorted(pending, key=lambda p: (p[2], p[3], natural(p[0]))):
        tex, icon = block_of(v)
        x, y = sheets[category].place(name, group, w + (1 if has_icon else 0), h)
        canvases[category][name] = (x, y, tex, icon)
        left = x + (1 if has_icon else 0)
        rewrites[name] = {
            "file": v["file"],
            "spritesheet": category,
            "tiles": [(y + 1 + i, left + 1, left + w) for i in range(h)],
            "icon": (category, y + h, x + 1) if has_icon else None,
            "old_icon": v.get("icon"),
        }
        if has_icon:
            ref = v["icon"]
            if (ref["spritesheet"], ref["row"], ref["col"]) not in literal_refs():
                sys.exit(f"{name}: its icon is not written literally in its config; give it a literal icon or leave it out")
            icons[(ref["spritesheet"], ref["row"], ref["col"])] = {"spritesheet": category, "row": y + h, "col": x + 1}

    literal = set()
    for path in CONFIGS.rglob("*.ts"):
        for m in ICON_REF.finditer(path.read_text()):
            literal.add((m.group(2), int(m.group(5)), int(m.group(8))))
    loose = sorted(k for k in literal if k not in icons and k[0] not in CATEGORIES)
    for key in sorted(loose, key=lambda k: (natural(k[0]), k[1], k[2])):
        sheet, row, col = key
        x, y = sheets["items"].place(f"{sheet}:{row}:{col}", ICONS, 1, 1)
        canvases["items"][f"{sheet}:{row}:{col}"] = (x, y, None, icon_image({"spritesheet": sheet, "row": row, "col": col}))
        icons[key] = {"spritesheet": "items", "row": y + 1, "col": x + 1}

    pending_growables = {e["name"] for e, *_ in moves if e["kind"] == "stage"}
    for e in blocks:
        if e["kind"] == "stage" and e["name"] in pending_growables and e["sheet"] == extra_category(e, entities):
            sys.exit(f"{e['name']}: growth stages split across sheets")
    for e, category, group, owner in moves:
        x, y = sheets[category].place(owner, group, e["w"], e["h"])
        canvases[category][owner] = (x, y, extra_image(e), None)
        rewrites.setdefault("#extras", []).append((e, category, x, y))

    return {"sheets": sheets, "canvases": canvases}, rewrites, icons


def render(sheets: dict, canvases: dict) -> dict[str, Image.Image]:
    out = {}
    for category, sheet in sheets.items():
        img = Image.new("RGBA", (sheet.columns * TILE, max(sheet.height(), 1) * TILE))
        for name, (x, y, tex, icon) in canvases[category].items():
            if tex is None:
                img.paste(icon, (x * TILE, y * TILE))
                continue
            left = x + (1 if icon is not None else 0)
            img.paste(tex, (left * TILE, y * TILE))
            if icon is not None:
                rows = tex.height // TILE
                img.paste(icon, (x * TILE, (y + rows - 1) * TILE))
        out[category] = img
    return out


def rewrite_texture(text: str, start: int, end: int, change: dict) -> str:
    block = text[start:end]
    m = re.search(r'name: ComponentName\.TEXTURE,\s*config: \{(\s*)spritesheet: "[^"]+",\s*tileSize: \d+,\s*tiles: \[', block)
    if not m:
        sys.exit(f"cannot find the texture of {change['file']}.ts entity")
    depth, i = 1, m.end()
    while depth:
        depth += {"[": 1, "]": -1}.get(block[i], 0)
        i += 1
    indent = m.group(1).lstrip("\n")
    rows = "".join(f"\n{indent}  {{ row: {r}, start: {s}, end: {e} }}," for r, s, e in change["tiles"])
    new = (
        f'name: ComponentName.TEXTURE,{block[m.start() + len("name: ComponentName.TEXTURE,"):m.start() + block[m.start():].index("config: {")]}config: {{'
        f'{m.group(1)}spritesheet: "{change["spritesheet"]}",{m.group(1)}tileSize: {TILE},'
        f'{m.group(1)}tiles: [{rows}\n{indent}]'
    )
    return text[:start] + block[:m.start()] + new + block[i:] + text[end:]


ICON_REF = re.compile(r'spritesheet:(\s*)"([a-z0-9_]+)",(\s*)row:(\s*)(\d+),(\s*)col:(\s*)(\d+)')


def rewrite_icons(text: str, icons: dict) -> str:
    def swap(m: re.Match) -> str:
        new = icons.get((m.group(2), int(m.group(5)), int(m.group(8))))
        if not new:
            return m.group(0)
        return (
            f'spritesheet:{m.group(1)}"{new["spritesheet"]}",{m.group(3)}row:{m.group(4)}{new["row"]},'
            f'{m.group(6)}col:{m.group(7)}{new["col"]}'
        )
    return ICON_REF.sub(swap, text)


def cmd_build(_args: list[str]) -> None:
    layout, rewrites, icons = plan()
    images = render(layout["sheets"], layout["canvases"])
    for category, img in images.items():
        img.save(SPRITES / f"{category}.png", optimize=True)

    extra_moves = rewrites.pop("#extras", [])
    for e, category, x, y in extra_moves:
        path, start, end = entity_block(e["file"], e["name"])
        text = Path(path).read_text()
        Path(path).write_text(rewrite_extra(text, start, end, e, category, x, y))

    by_file: dict[str, list[str]] = {}
    for name, change in rewrites.items():
        by_file.setdefault(change["file"], []).append(name)
    for file, names in by_file.items():
        path = CONFIGS / "entities" / f"{file}.ts"
        for name in names:
            text = path.read_text()
            _, start, end = source_block(file, name)
            path.write_text(rewrite_texture(text, start, end, rewrites[name]))

    changed = 0
    for path in CONFIGS.rglob("*.ts"):
        text = path.read_text()
        new = rewrite_icons(text, icons)
        if new != text:
            path.write_text(new)
            changed += 1

    for category, sheet in layout["sheets"].items():
        print(f"{category}: {len(sheet.blocks)} blocks, {sheet.columns}x{sheet.height()} tiles")
    print(f"{len(rewrites)} textures and {len(extra_moves)} animation, growth and connection blocks moved, {len(icons)} icons remapped in {changed} config files")


def cmd_verify(_args: list[str]) -> None:
    _, rewrites, icons = plan()
    rewrites.pop("#extras", None) if not rewrites.get("#extras") else None
    moved = [i for i in icons if not i[0] in CATEGORIES]
    if rewrites or moved:
        print(f"{len(rewrites)} textures and {len(moved)} icons are not on their category sheet")
        print("run: npm run sheets")
        sys.exit(1)
    print("every entity texture and icon is on its category sheet")


def unused() -> tuple[list[str], list[str]]:
    """Loads that point into the collection, and loaded-folder sprites nothing loads."""
    data = dump()
    files = {s["file"] for m in data["maps"].values() for s in m["sheets"]}
    into = sorted(f for f in files if f.startswith("collection/"))
    robes = {f"people/robes/{p.parent.name}/{p.name}" for p in (SPRITES / "people/robes").glob("*/*.png")}
    stray = sorted(
        p.relative_to(SPRITES).as_posix()
        for p in SPRITES.rglob("*.png")
        if not p.relative_to(SPRITES).as_posix().startswith("collection/")
        and p.relative_to(SPRITES).as_posix() not in files | robes
    )
    return into, stray


def cmd_unused(_args: list[str]) -> None:
    into, stray = unused()
    print("loads from the collection:", " ".join(into) or "none")
    print("sprites nothing loads (move them to collection/):", " ".join(stray) or "none")
    if into or stray:
        sys.exit(1)


def font(size: int):
    try:
        return ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", size)
    except OSError:
        return ImageFont.load_default()


def cmd_preview(args: list[str]) -> None:
    category, out = args[0], args[1]
    layout, _, _ = plan()
    img = render(layout["sheets"], layout["canvases"])[category]
    sheet = layout["sheets"][category]
    zoom = 3
    big = Image.new("RGBA", img.size, (92, 96, 106, 255))
    big.alpha_composite(img)
    big = big.resize((img.width * zoom, img.height * zoom), Image.NEAREST).convert("RGB")
    draw = ImageDraw.Draw(big)
    small = font(12)
    for owner, (x, y, w, h) in sheet.blocks.items():
        draw.rectangle((x * TILE * zoom, y * TILE * zoom, (x + w) * TILE * zoom - 1, (y + h) * TILE * zoom - 1), outline=(250, 210, 90))
        draw.text((x * TILE * zoom + 3, y * TILE * zoom + 2), owner, fill=(255, 255, 255), font=small)
    big.save(out)
    print(f"wrote {out}")


COMMANDS = {"build": cmd_build, "verify": cmd_verify, "unused": cmd_unused, "preview": cmd_preview}

if __name__ == "__main__":
    if len(sys.argv) < 2 or sys.argv[1] not in COMMANDS:
        sys.exit(__doc__)
    COMMANDS[sys.argv[1]](sys.argv[2:])
