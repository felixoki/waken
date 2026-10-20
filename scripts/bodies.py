"""Collision body suggestions from sprite pixels.

Draw order follows the sprite centre (entity.y), so a prop's body has to
straddle it: the player's body runs from 4px above its centre to 8px below, so a
prop body's bottom edge must sit below centre - 4 and its top edge above
centre + 8. barrels1 (32x10 at 8,20 on a 48px sprite) is the reference.

    python3 scripts/bodies.py fit <entity>
    python3 scripts/bodies.py audit [review.png]   # every entity's body against its art
"""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SPRITES = ROOT / "client/public/assets/sprites"
SOLID = 200
FRONT = 12


def dump() -> dict:
    out = subprocess.run(
        ["npx", "tsx", "scripts/entities.ts"],
        cwd=ROOT, capture_output=True, text=True, check=True,
    )
    return json.loads(out.stdout)


def entities() -> dict:
    return dump()["entities"]


def compose(texture: dict, sheet: str) -> Image.Image | None:
    tiles = texture.get("tiles") or []
    if not tiles:
        return None
    size = texture["tileSize"]
    image = Image.open(SPRITES / sheet).convert("RGBA")
    columns = image.width // size
    width = max(t["end"] - t["start"] + 1 for t in tiles) * size
    out = Image.new("RGBA", (width, len(tiles) * size))
    for i, row in enumerate(tiles):
        for col in range(row["start"], row["end"] + 1):
            index = (row["row"] - 1) * columns + (col - 1)
            sx, sy = (index % columns) * size, (index // columns) * size
            out.paste(image.crop((sx, sy, sx + size, sy + size)), ((col - row["start"]) * size, i * size))
    return out


def fit(image: Image.Image) -> dict:
    alpha = image.split()[3].load()
    w, h = image.size
    centre = h / 2
    rows = [y for y in range(h) if any(alpha[x, y] >= SOLID for x in range(w))]
    base = rows[-1] + 1
    bottom = min(max(base - FRONT, centre - 3), base)
    xs = [x for x in range(w) if any(alpha[x, y] >= SOLID for y in range(int(centre), base))]
    left, right = min(xs), max(xs)
    span = right - left + 1
    inset = max(1, round(span * 0.08)) if span > 10 else 0
    width = span - 2 * inset
    top = bottom - max(4, min(12, round(width * 0.3)))
    if top >= centre + 8:
        top = int(centre + 7)
    return {"width": width, "height": int(bottom - top), "offsetX": left + inset, "offsetY": int(top)}


def cmd_fit(args: list[str]) -> None:
    name = args[0]
    v = entities().get(name)
    if not v or not v.get("sheet"):
        sys.exit(f"{name}: no still TEXTURE component")
    image = compose(v["texture"], v["sheet"])
    b = fit(image)
    print(f"{name}: {image.width}x{image.height} sprite, centre y={image.height / 2:g}")
    print(f"suggested: {{ width: {b['width']}, height: {b['height']}, offsetX: {b['offsetX']}, offsetY: {b['offsetY']} }}")
    body = v.get("body")
    if body:
        print(f"current:   {{ width: {body['width']}, height: {body['height']}, offsetX: {body['offsetX']}, offsetY: {body['offsetY']} }}")


WALL_MOUNTED = {"torch1", "candles1", "candles2", "candles3", "lever", "remains2", "remains3"}
NO_BODY = {"books1", "mortar_and_pestle", "remains", "cave_exit", "cloudladder", "ladder", "village_portal", "dragon"}
CONNECTED = {"fence"}
PLAYER_BODY = {"width": 8, "height": 12, "offsetX": 12, "offsetY": 12}


def sheet_image(key: str, files: dict) -> Image.Image | None:
    path = SPRITES / files.get(key, f"{key}.png")
    return Image.open(path).convert("RGBA") if path.exists() else None


def sprite_of(name: str, v: dict, data: dict) -> tuple[Image.Image | None, str]:
    files = {s["key"]: s for m in data["maps"].values() for s in m["sheets"]}
    growable = v.get("growable")
    if growable:
        stage = growable["stages"][-1]
        return compose({"tileSize": growable["tileSize"], "tiles": stage["tiles"]}, f"{growable['spritesheet']}.png"), "prop"
    texture = v.get("texture") or v.get("animation")
    if texture and texture.get("tiles"):
        sheet = texture["spritesheet"]
        src = files.get(sheet, {}).get("file", f"{sheet}.png")
        return compose(texture, src), "prop"
    for state in v.get("states") or []:
        entry = files.get(f"{name}-{state}")
        if not entry:
            continue
        img = sheet_image(entry["key"], {k: f["file"] for k, f in files.items()})
        if img is None:
            continue
        fw, fh = entry.get("frameWidth") or 64, entry.get("frameHeight") or 64
        union = Image.new("RGBA", (fw, fh))
        for st in v.get("states") or []:
            e2 = files.get(f"{name}-{st}")
            if not e2 or st not in ("idle", "walking"):
                continue
            sheet = sheet_image(e2["key"], {k: f["file"] for k, f in files.items()})
            if sheet is None or (e2.get("frameWidth") or 64, e2.get("frameHeight") or 64) != (fw, fh):
                continue
            for y in range(0, sheet.height - fh + 1, fh):
                for x in range(0, sheet.width - fw + 1, fw):
                    union.alpha_composite(sheet.crop((x, y, x + fw, y + fh)))
        return union, "mover"
    return None, "none"


def solid_box(img: Image.Image):
    return img.split()[3].point(lambda a: 255 if a >= SOLID else 0).getbbox()


def check(name: str, v: dict, img: Image.Image, kind: str) -> list[str]:
    body = v.get("body")
    components = set(v.get("components") or [])
    if not body:
        if kind == "mover":
            return ["no body"]
        if "pickable" in components or v.get("flat") or name in WALL_MOUNTED:
            return []
        return ["no body"]
    box = solid_box(img)
    if not box:
        return ["sprite has no solid pixels"]
    w, h = img.size
    centre = h / 2
    top, bottom = body["offsetY"], body["offsetY"] + body["height"]
    left, right = body["offsetX"], body["offsetX"] + body["width"]
    issues = []
    if left < 0 or right > w or top < 0 or bottom > h:
        issues.append(f"body leaves the {w}x{h} frame")
    inside = max(0, min(right, box[2]) - max(left, box[0])) * max(0, min(bottom, box[3]) - max(top, box[1]))
    if inside < 0.5 * body["width"] * body["height"]:
        issues.append("body mostly outside the art")
    lower = img.crop((0, int(centre), w, h))
    span = solid_box(lower) or box
    if body.get("collides") is False:
        if body["width"] < 0.5 * (span[2] - span[0]) * 0.7:
            issues.append(f"trigger {body['width']}px wide under {span[2] - span[0]}px of art")
        if abs((left + right) / 2 - (span[0] + span[2]) / 2) > (span[2] - span[0]) / 4:
            issues.append("trigger off-centre from the art")
        if bottom <= centre:
            issues.append("trigger above the sprite centre")
        return issues
    if kind == "mover":
        if abs((left + right) / 2 - (box[0] + box[2]) / 2) > (box[2] - box[0]) / 4:
            issues.append("body off-centre from the art")
        if (top + bottom) / 2 < centre:
            issues.append("body above the sprite centre (should sit at the feet)")
        if bottom < box[3] - 16:
            issues.append(f"body bottom {bottom} far above the feet at {box[3]}")
        return issues
    if not v.get("flat"):
        if top >= centre + 8:
            issues.append(f"top {top} not above centre+8 ({centre + 8:g}): player can stop in front while drawn behind")
        if bottom <= centre - 4:
            issues.append(f"bottom {bottom} not below centre-4 ({centre - 4:g}): player can stop behind while drawn in front")
        if abs((left + right) / 2 - (span[0] + span[2]) / 2) > (span[2] - span[0]) / 4:
            issues.append("body off-centre from the art")
    return issues


def cmd_audit(args: list[str]) -> None:
    data = dump()
    rows = []
    for name, v in sorted(data["entities"].items()):
        img, kind = sprite_of(name, v, data)
        if img is None:
            continue
        if name in NO_BODY or name in CONNECTED:
            continue
        issues = check(name, v, img, kind)
        rows.append((name, v, img, kind, issues))
    bad = [r for r in rows if r[4]]
    print(f"{len(rows)} entities with a sprite, {len(bad)} with body problems")
    for name, v, img, kind, issues in bad:
        print(f"  {name} ({kind}, {v['file']}): " + "; ".join(issues))
    if args:
        review(bad, args[0])


def review(rows: list, out: str) -> None:
    from PIL import ImageDraw, ImageFont

    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 13)
    except OSError:
        font = ImageFont.load_default()
    zoom, cols = 3, 6
    cw = max(r[2].width for r in rows) * zoom + 20
    ch = max(r[2].height for r in rows) * zoom + 60
    sheet = Image.new("RGB", (cw * cols, ch * ((len(rows) + cols - 1) // cols)), (36, 40, 48))
    draw = ImageDraw.Draw(sheet)
    for i, (name, v, img, kind, issues) in enumerate(rows):
        ox, oy = (i % cols) * cw + 8, (i // cols) * ch + 40
        bg = Image.new("RGBA", img.size, (92, 96, 106, 255))
        bg.alpha_composite(img)
        sheet.paste(bg.resize((img.width * zoom, img.height * zoom), Image.NEAREST).convert("RGB"), (ox, oy))
        draw.line((ox, oy + img.height / 2 * zoom, ox + img.width * zoom, oy + img.height / 2 * zoom), fill=(255, 220, 0))
        b = v.get("body")
        if b:
            draw.rectangle((ox + b["offsetX"] * zoom, oy + b["offsetY"] * zoom, ox + (b["offsetX"] + b["width"]) * zoom - 1, oy + (b["offsetY"] + b["height"]) * zoom - 1), outline=(255, 70, 70), width=2)
        draw.text((ox, oy - 36), name, fill=(240, 240, 240), font=font)
        draw.text((ox, oy - 20), issues[0][:44], fill=(255, 150, 150), font=font)
    sheet.save(out)
    print(f"wrote {out}")


COMMANDS = {"fit": cmd_fit, "audit": cmd_audit}

if __name__ == "__main__":
    if len(sys.argv) < 2 or sys.argv[1] not in COMMANDS:
        sys.exit(__doc__)
    COMMANDS[sys.argv[1]](sys.argv[2:])
