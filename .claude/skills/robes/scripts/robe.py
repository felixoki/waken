#!/usr/bin/env python3
"""Robe variants for Waken's player sheets. See ../SKILL.md."""
import argparse
import colorsys
import importlib.util
import inspect
import sys
from collections import Counter
from pathlib import Path
from types import SimpleNamespace

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[4]
SPRITES = ROOT / "client/public/assets/sprites"
DESIGNS = Path(__file__).resolve().parents[1] / "designs"

ROBE = [0x121930, 0x1F2B51, 0x27274E, 0x2D274E, 0x2A3F6E, 0x364D82, 0x406591, 0x436EA0, 0x4C84B1, 0x7594DB]
LIT = {0x323D5F: 4, 0x384F83: 5, 0x6A7B9F: 9, 0x1D1F3D: 1}
BASE_HUE = 220 / 360
OUTLINE = (3, 3, 4)
BG = (120, 150, 110, 255)

SHEETS = {
    "idle": 32, "walking": 32, "running": 32, "jumping": 32, "casting": 32, "rolling": 32, "sleeping": 32,
    "idle_with_lantern": 32, "walking_with_lantern": 32,
    "fishing": 64, "fishing_throw": 64, "fishing_bite": 64, "fishing_catch": 64,
    "felling": 64, "mining": 64, "raking": 64, "watering": 64,
}
ROWS = ["front", "back", "side", "side"]
ITEM_SHEET = "icons6"
ITEM_ROW = 5
FREE = {
    "sleeping": lambda row, frame: "sleep",
    "rolling": lambda row, frame: "ball" if 3 <= frame <= 4 else None,
}


def rgb(c):
    return ((c >> 16) & 255, (c >> 8) & 255, c & 255)


INDEX = {rgb(c): i for i, c in enumerate(ROBE)}
INDEX.update({rgb(c): i for c, i in LIT.items()})


def shade(color, hue, sat=1.0, val=1.0, lift=0.0, drift=0.5):
    h, s, v = colorsys.rgb_to_hsv(*(c / 255 for c in color))
    h = (hue / 360 + (h - BASE_HUE) * drift) % 1
    return tuple(round(c * 255) for c in colorsys.hsv_to_rgb(h, min(1, s * sat), min(1, v * val + lift)))


def resolve(spec, color):
    if spec is None:
        return color
    if isinstance(spec, dict):
        return shade(color, **spec)
    if isinstance(spec, int):
        return rgb(spec)
    return rgb(spec[INDEX[color]])


def load_design(name):
    """A design name in designs/, a path to a .py file, or path.py:key for a file holding a DESIGNS dict."""
    name, _, key = name.partition(":") if ".py:" in name else (name, "", "")
    path = Path(name) if name.endswith(".py") else DESIGNS / f"{name}.py"
    spec = importlib.util.spec_from_file_location(path.stem, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return (key, mod.DESIGNS[key]) if key else (path.stem, mod)


def cells(im, size):
    for row in range(im.height // size):
        for frame in range(im.width // size):
            yield row, frame, frame * size, row * size


def robe_mask(px, cx, cy, size):
    return {(x, y) for y in range(size) for x in range(size)
            if px[cx + x, cy + y][3] == 255 and px[cx + x, cy + y][:3] in INDEX}


def body(mask):
    """Largest 8-connected blob, so a stray sleeve or tool pixel never moves the anchor."""
    left, best = set(mask), set()
    while left:
        stack, blob = [left.pop()], set()
        while stack:
            x, y = stack.pop()
            blob.add((x, y))
            for n in ((x + i, y + j) for i in (-1, 0, 1) for j in (-1, 0, 1)):
                if n in left:
                    left.remove(n)
                    stack.append(n)
        if len(blob) > len(best):
            best = blob
    return best


def anchor(mask):
    blob = body(mask)
    top = min(y for _, y in blob)
    xs = [x for x, y in blob if top + 1 <= y <= top + 4]
    return (min(xs) + max(xs)) / 2, top


def references():
    im = Image.open(SPRITES / "player_idle.png").convert("RGBA")
    px = im.load()
    return [anchor(robe_mask(px, 0, row * 32, 32)) for row in range(4)]


def context(src, cx, cy, size, mask, sheet, row, frame):
    """Per-pixel facts a design can ask for: at(x, y).frame, .hem, .rim."""
    blob = body(mask)
    top, floor = min(y for _, y in blob), max(y for _, y in blob)
    bottoms = {}
    for x, y in mask:
        bottoms[x] = max(bottoms.get(x, 0), y)
    black = {(x, y) for y in range(size) for x in range(size) if src[cx + x, cy + y] == (0, 0, 0, 255)}
    side = lambda x, y: ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1))
    face = black | {(x, y) for y in range(size) for x in range(size)
                    if src[cx + x, cy + y][3] == 255 and (x, y) not in mask
                    and sum(n in black for n in side(x, y)) >= 2}

    def at(x, y):
        low = bottoms[x]
        return SimpleNamespace(
            sheet=sheet, row=row, frame=frame, x=x, y=y,
            hem=low - y if floor - low <= 3 else 99,
            rim=y < top + 14 and any(n in face for n in side(x, y)),
        )
    return at


def call(fn, n, args, at):
    return fn(*args, at) if len(inspect.signature(fn).parameters) > n else fn(*args)


def apply(design, sheet, im, refs):
    size = SHEETS[sheet]
    src = im.load()
    out = im.copy()
    px = out.load()
    base = getattr(design, "BASE", None)
    mats = getattr(design, "MATERIALS", {})
    edges = getattr(design, "EDGES", {})
    paint = getattr(design, "paint", None)
    paint_free = getattr(design, "paint_free", None)
    stamps = getattr(design, "stamps", None)
    for row, frame, cx, cy in cells(im, size):
        mask = robe_mask(src, cx, cy, size)
        if not mask:
            continue
        pose = FREE[sheet](row, frame) if sheet in FREE else None
        flip = row == 3
        at = context(src, cx, cy, size, mask, sheet, row, frame)
        hit = {}
        if pose:
            blob = body(mask)
            x0, x1 = min(x for x, _ in blob), max(x for x, _ in blob)
            y0, y1 = min(y for _, y in blob), max(y for _, y in blob)
            for x, y in mask:
                u, v = (x - x0) / max(1, x1 - x0), (y - y0) / max(1, y1 - y0)
                if paint_free:
                    hit[x, y] = call(paint_free, 5, (pose, 1 - u if flip else u, v, x - x0, y - y0), at(x, y))
                elif paint:
                    like = "back" if pose == "ball" else "side"
                    tx = round(10 + u * 13) if like == "side" else round(8 + u * 15)
                    hit[x, y] = call(paint, 3, (like, 31 - tx if flip and like == "back" else tx, round(5 + v * 21)), at(x, y))
                else:
                    hit[x, y] = None
        else:
            pose = ROWS[row % 4]
            ax, ay = anchor(mask)
            rx, ry = refs[row % 4]
            dx, dy = round(ax - rx), ay - ry
            for x, y in mask:
                tx = x - dx
                hit[x, y] = call(paint, 3, (pose, 31 - tx if flip else tx, y - dy), at(x, y)) if paint else None
            for x, y, m in (stamps(pose) if stamps else []):
                x, y = (31 - x if flip else x) + dx, y + dy
                if not (0 <= x < size and 0 <= y < size) or (m == "edge?" and src[cx + x, cy + y][3] != 0):
                    continue
                px[cx + x, cy + y] = (OUTLINE if m in ("outline", "edge?") else resolve(mats[m], rgb(ROBE[4]))) + (255,)
        face = getattr(design, "face", None)
        if face and pose in ROWS:
            first = min(y for _, y in body(mask))
            for y in range(first, min(size, first + 14)):
                for x in range(size):
                    pixel = src[cx + x, cy + y]
                    if pixel not in ((0, 0, 0, 255), (255, 255, 255, 255)):
                        continue
                    tx = x - dx
                    m = face(pose, 31 - tx if flip else tx, y - dy, SimpleNamespace(eye=pixel[0] == 255, frame=frame, sheet=sheet))
                    if m:
                        px[cx + x, cy + y] = resolve(mats[m], rgb(ROBE[4])) + (255,)
        for (x, y), m in hit.items():
            color = rgb(ROBE[INDEX[src[cx + x, cy + y][:3]]])
            if m in edges and any(hit.get(n, m) is None for n in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1))):
                px[cx + x, cy + y] = rgb(edges[m]) + (255,)
            else:
                px[cx + x, cy + y] = resolve(mats[m] if m else base, color) + (255,)
    return out


def flatten(im, zoom):
    out = Image.new("RGBA", (im.width * zoom, im.height * zoom), BG)
    big = im.resize(out.size, Image.NEAREST)
    out.paste(big, (0, 0), big)
    return out


def cmd_build(args):
    name, design = load_design(args.design)
    refs = references()
    out = Path(args.out) if args.out else SPRITES / "robes" / name
    out.mkdir(parents=True, exist_ok=True)
    preview = Path(args.preview) if args.preview else None
    if preview:
        preview.mkdir(parents=True, exist_ok=True)
    for sheet in args.sheets or SHEETS:
        im = Image.open(SPRITES / f"player_{sheet}.png").convert("RGBA")
        result = apply(design, sheet, im, refs)
        result.save(out / f"player_{sheet}.png")
        if preview:
            flatten(result, args.zoom).save(preview / f"{name}_{sheet}.png")
        print(f"{sheet}: {out / f'player_{sheet}.png'}")


HOOD = ("icons2.png", 0, 0)
HOOD_OUTLINE = 0x3B362E
HOOD_CLOTH = {0xB5BE80: 7, 0xA8AC76: 6, 0x949368: 5, 0x747155: 4}
HOOD_INSIDE = {0x544E40: 0, 0x605B48: 0.5, 0x6A664E: 1, 0x747155: 2.5}


def hood():
    """The hood block from icons2: {(x, y): (part, ramp index)}, part is shell, rim, inside or outline."""
    file, bx, by = HOOD
    px = Image.open(SPRITES / file).convert("RGBA").crop((bx, by, bx + 48, by + 32)).load()
    codes = {(x, y): (px[x, y][0] << 16) | (px[x, y][1] << 8) | px[x, y][2]
             for y in range(32) for x in range(48) if px[x, y][3] == 255}
    near = lambda x, y: ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1))
    inside = set()
    stack = [p for p, c in codes.items() if c == 0x6A664E]
    while stack:
        p = stack.pop()
        if p in inside or codes.get(p) not in HOOD_INSIDE:
            continue
        inside.add(p)
        stack.extend(near(*p))
    cells = {}
    for p, c in codes.items():
        if c == HOOD_OUTLINE:
            cells[p] = ("outline", 0)
        elif p in inside:
            cells[p] = ("inside", HOOD_INSIDE[c])
        else:
            cells[p] = ("rim" if any(n in inside for n in near(*p)) else "shell", HOOD_CLOTH[c])
    return cells


def ramp(spec, index):
    lo, hi = int(index), min(9, int(index) + (index % 1 > 0) * (2 if index > 2 else 1))
    a, b = resolve(spec, rgb(ROBE[lo])), resolve(spec, rgb(ROBE[hi]))
    return tuple((i + j) // 2 for i, j in zip(a, b)) if hi != lo else a


def item_block(design):
    block = Image.new("RGBA", (48, 32), (0, 0, 0, 0))
    px = block.load()
    base = getattr(design, "BASE", None)
    mats = getattr(design, "MATERIALS", {})
    paint = getattr(design, "paint_item", None)
    for (x, y), (part, index) in hood().items():
        if part == "outline":
            color = tuple(c * 3 // 5 for c in resolve(base, rgb(ROBE[0])))
        else:
            kind, lx, ly = ("texture", x - 16, y) if x >= 16 else ("icon", x, y - 16)
            m = paint(kind, lx, ly, part) if paint else None
            color = ramp(mats[m], index - 1) if m else ramp(base, index)
        px[x, y] = color + (255,)
    return block


def cmd_items(args):
    slots = {}
    for path in sorted(DESIGNS.glob("*.py")):
        name, design = load_design(str(path))
        slot = getattr(design, "ITEM_SLOT", None)
        if slot is None:
            continue
        if slot in slots:
            sys.exit(f"ITEM_SLOT {slot} is used by both {slots[slot][0]} and {name}")
        slots[slot] = (name, design)
    out = Path(args.out) if args.out else SPRITES / f"{ITEM_SHEET}.png"
    top = (ITEM_ROW - 1) * 16
    current = Image.open(SPRITES / f"{ITEM_SHEET}.png").convert("RGBA")
    width = max(current.width, 48 * (max(slots) + 1))
    sheet = Image.new("RGBA", (width, max(current.height, top + 32)), (0, 0, 0, 0))
    sheet.paste(current, (0, 0))
    sheet.paste(Image.new("RGBA", (width, 32), (0, 0, 0, 0)), (0, top))
    for slot, (name, design) in sorted(slots.items()):
        sheet.paste(item_block(design), (slot * 48, top))
        col = slot * 3 + 1
        print(f"{name}: icon {{ spritesheet: \"{ITEM_SHEET}\", row: {ITEM_ROW + 1}, col: {col} }}, "
              f"texture rows {ITEM_ROW}-{ITEM_ROW + 1}, cols {col + 1}-{col + 2}")
    sheet.save(out)
    print(out)
    if args.preview:
        flatten(sheet, args.zoom).save(args.preview)


def cmd_zoom(args):
    name, design = load_design(args.design)
    size = SHEETS[args.sheet]
    im = apply(design, args.sheet, Image.open(SPRITES / f"player_{args.sheet}.png").convert("RGBA"), references())
    frames = args.frames or [0]
    rows = im.height // size
    out = Image.new("RGBA", (rows * size * args.zoom, len(frames) * size * args.zoom), BG)
    for i, frame in enumerate(frames):
        for row in range(rows):
            cell = im.crop((frame * size, row * size, (frame + 1) * size, (row + 1) * size))
            cell = cell.resize((size * args.zoom, size * args.zoom), Image.NEAREST)
            out.paste(cell, (row * size * args.zoom, i * size * args.zoom), cell)
    out.save(args.out)
    print(args.out)


def cmd_sheet(args):
    names = []
    for name in args.designs:
        if name.endswith(".py") and ":" not in name:
            mod = load_design(name)[1]
            names += [f"{name}:{key}" for key in getattr(mod, "DESIGNS", {})] or [name]
        else:
            names.append(name)
    names = names[args.skip:args.skip + args.limit] if args.limit else names[args.skip:]
    refs = references()
    src = Image.open(SPRITES / "player_idle.png").convert("RGBA")
    z, pad, label = args.zoom, 8, 14
    cw, ch = 4 * 32 * z + pad, 32 * z + label
    rows = (len(names) + args.cols - 1) // args.cols
    out = Image.new("RGBA", (args.cols * cw + pad, rows * ch + pad), BG)
    draw = ImageDraw.Draw(out)
    for i, name in enumerate(names):
        title, design = load_design(name)
        im = apply(design, "idle", src, refs)
        ox, oy = pad + (i % args.cols) * cw, pad + (i // args.cols) * ch
        draw.text((ox + 2, oy), title, fill=(255, 255, 255, 255))
        for d in range(4):
            cell = im.crop((0, d * 32, 32, d * 32 + 32)).resize((32 * z, 32 * z), Image.NEAREST)
            out.paste(cell, (ox + d * 32 * z, oy + label - 6), cell)
    out.save(args.out)
    print(args.out, len(names), "designs")


def cmd_grid(args):
    size = SHEETS[args.sheet]
    im = Image.open(SPRITES / f"player_{args.sheet}.png").convert("RGBA")
    px = im.load()
    cx, cy = args.frame * size, args.row * size
    legend = {}
    print("   " + "".join(str(x % 10) for x in range(size)))
    for y in range(size):
        line = ""
        for x in range(size):
            p = px[cx + x, cy + y]
            if p[3] == 0:
                line += "."
            elif p[3] < 255:
                line += ","
            elif p[:3] in INDEX:
                line += str(INDEX[p[:3]])
            else:
                line += legend.setdefault(p[:3], "abcdefghijklmnopqrstuvwxyz"[len(legend) % 26])
        print(f"{y:2d} {line}")
    print("0-9 robe ramp dark to light:", " ".join(f"{c:06x}" for c in ROBE))
    for color, ch in legend.items():
        print(ch, "%02x%02x%02x" % color)
    mask = robe_mask(px, cx, cy, size)
    if mask:
        print("anchor (hood centre x, top y):", anchor(mask))


def cmd_palette(args):
    im = Image.open(args.file).convert("RGBA")
    count = Counter(p[:3] for p in im.getdata() if p[3] == 255)
    for color, n in count.most_common():
        h, s, v = colorsys.rgb_to_hsv(*(c / 255 for c in color))
        print("%02x%02x%02x %5d  h%3d s%.2f v%.2f" % (*color, n, h * 360, s, v))


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    sub = ap.add_subparsers(dest="cmd", required=True)
    b = sub.add_parser("build", help="apply a design to the player sheets")
    b.add_argument("design")
    b.add_argument("--sheets", nargs="*", choices=list(SHEETS))
    b.add_argument("--out")
    b.add_argument("--preview", help="directory for enlarged previews on a grass background")
    b.add_argument("--zoom", type=int, default=4)
    b.set_defaults(fn=cmd_build)
    z = sub.add_parser("zoom", help="render chosen frames of one sheet large, one column per direction")
    z.add_argument("design")
    z.add_argument("out")
    z.add_argument("--sheet", default="idle", choices=list(SHEETS))
    z.add_argument("--frames", nargs="*", type=int)
    z.add_argument("--zoom", type=int, default=10)
    z.set_defaults(fn=cmd_zoom)
    sh = sub.add_parser("sheet", help="contact sheet: idle frame 0 of many designs, four directions each")
    sh.add_argument("out")
    sh.add_argument("designs", nargs="+", help="names, .py paths, path.py:key, or a DESIGNS file for all of it")
    sh.add_argument("--zoom", type=int, default=4)
    sh.add_argument("--cols", type=int, default=3)
    sh.add_argument("--skip", type=int, default=0)
    sh.add_argument("--limit", type=int, default=0)
    sh.set_defaults(fn=cmd_sheet)
    g = sub.add_parser("grid", help="print one frame as characters with coordinates")
    g.add_argument("sheet", choices=list(SHEETS))
    g.add_argument("--frame", type=int, default=0)
    g.add_argument("--row", type=int, default=0)
    g.set_defaults(fn=cmd_grid)
    i = sub.add_parser("items", help="rebuild the robe item sheet (16px icon + 32px texture per design)")
    i.add_argument("--out")
    i.add_argument("--preview")
    i.add_argument("--zoom", type=int, default=12)
    i.set_defaults(fn=cmd_items)
    p = sub.add_parser("palette", help="list the opaque colours of any png")
    p.add_argument("file")
    p.set_defaults(fn=cmd_palette)
    args = ap.parse_args()
    args.fn(args)


if __name__ == "__main__":
    sys.exit(main())
