"""Second step of the bog troll, after `variant.py build bog_troll`: toad warts on
the skin and a lily pad worn on the head, placed per frame from the crown of the head.

    python3 .claude/skills/sprite-variants/scripts/variant.py build bog_troll
    python3 .claude/skills/sprite-variants/designs/bog_troll_extras.py build
    python3 .claude/skills/sprite-variants/designs/bog_troll_extras.py <out.png>   # preview only

The preview reads the recoloured sheets too, so run `variant.py build` before
previewing. Never run `build` twice in a row: it would draw a second hat.
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[4]
SRC = ROOT / "client/public/assets/sprites/creatures"
SHEETS = {"idle": 80, "walking": 80, "running": 80, "slashing": 80, "throwing": 112}

OUTLINE = (20, 37, 21)
WART = (124, 140, 88)
WART_SHADE = (46, 62, 38)
WART_RATE = 0.02
PAD = [(52, 88, 36), (86, 128, 48), (112, 152, 60), (156, 186, 86)]
VEIN = (70, 108, 40)
PETAL = (238, 230, 234)
PETAL_SHADE = (222, 176, 196)
STAMEN = (220, 196, 104)
PAD_RX, PAD_RY = 8, 2.6


def solid(px, w, h, x, y):
    return 0 <= x < w and 0 <= y < h and px[x, y][3] == 255


def skin(c):
    r, g, b = c[:3]
    return g > r + 4 and g > b + 4 and 0.299 * r + 0.587 * g + 0.114 * b > 50


def crown(fr):
    """Top of the head: the highest solid pixel near the body's centre line."""
    px = fr.load()
    w, h = fr.size
    rows = [y for y in range(h) if any(px[x, y][3] == 255 for x in range(w))]
    if not rows:
        return None
    y0, y1 = rows[0], rows[-1]
    mid = [x for y in range((y0 + y1) // 2, y1 + 1) for x in range(w) if px[x, y][3] == 255]
    cx = round(sum(mid) / len(mid))
    for y in range(y0, y1):
        xs = [x for x in range(cx - 5, cx + 6) if solid(px, w, h, x, y)]
        if len(xs) >= 3:
            return round(sum(xs) / len(xs)), y, cx
    return None


def wart_at(u, v):
    n = (u * 73856093) ^ (v * 19349663)
    n = (n ^ (n >> 13)) * 1274126177 & 0xFFFFFFFF
    return (n % 1000) / 1000 < WART_RATE


def warts(fr, top):
    px = fr.load()
    w, h = fr.size
    hx, hy, cx = top
    for y in range(hy, h - 1):
        for x in range(w):
            if abs(x - cx) > 9 or y > hy + 26:
                continue
            if not skin(px[x, y]) or not skin(px[x, y + 1]):
                continue
            if not all(solid(px, w, h, x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, -1), (0, 2))):
                continue
            if wart_at(x - hx, y - hy):
                px[x, y] = WART + (255,)
                px[x, y + 1] = WART_SHADE + (255,)


def hat(fr, top):
    px = fr.load()
    w, h = fr.size
    hx, hy, _ = top
    cy = hy
    cells = set()
    for y in range(int(cy - PAD_RY) - 1, int(cy + PAD_RY) + 2):
        for x in range(int(hx - PAD_RX) - 1, int(hx + PAD_RX) + 2):
            if ((x - hx) / PAD_RX) ** 2 + ((y - cy) / PAD_RY) ** 2 > 1:
                continue
            if y >= cy and abs(x - (hx - 2)) <= (y - cy) // 2:
                continue
            cells.add((x, y))
    for x, y in cells:
        if not (0 <= x < w and 0 <= y < h):
            continue
        if (x, y - 1) not in cells:
            c = PAD[3]
        elif (x, y + 1) not in cells:
            c = PAD[0]
        else:
            c = PAD[2] if (x + y) % 3 else PAD[1]
        px[x, y] = c + (255,)
    for x in range(hx + 1, hx + 6):
        if (x, cy) in cells:
            px[x, cy] = VEIN + (255,)
    for x, y in cells:
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if (nx, ny) not in cells and 0 <= nx < w and 0 <= ny < h and px[nx, ny][3] < 255:
                px[nx, ny] = OUTLINE + (255,)
    fx, fy = hx + 3, cy - 2
    for dx, dy, c in ((0, 0, STAMEN), (-1, 0, PETAL), (1, 0, PETAL_SHADE), (0, -1, PETAL), (-1, -1, PETAL_SHADE), (1, -1, PETAL)):
        if 0 <= fx + dx < w and 0 <= fy + dy < h:
            px[fx + dx, fy + dy] = c + (255,)
    for dx, dy in ((-2, 0), (2, 0), (-1, -2), (0, -2), (1, -2), (-2, -1), (2, -1)):
        x, y = fx + dx, fy + dy
        if 0 <= x < w and 0 <= y < h and px[x, y][3] < 255:
            px[x, y] = OUTLINE + (255,)


def dress(fr):
    top = crown(fr)
    if not top:
        return fr
    fr = fr.copy()
    warts(fr, top)
    hat(fr, top)
    return fr


def sheet(name):
    return Image.open(SRC / f"bog_troll_{name}.png").convert("RGBA")


def build():
    for name, size in SHEETS.items():
        im = sheet(name)
        out = Image.new("RGBA", im.size)
        for row in range(im.height // size):
            for col in range(im.width // size):
                box = (col * size, row * size, (col + 1) * size, (row + 1) * size)
                out.paste(dress(im.crop(box)), box[:2])
        out.save(SRC / f"bog_troll_{name}.png")
        print("wrote", name)


def preview(path):
    S = 4
    strips = []
    for name, size in SHEETS.items():
        im = sheet(name)
        cols = im.width // size
        for row in range(im.height // size):
            strips.append((name, row, [dress(im.crop((c * size, row * size, (c + 1) * size, (row + 1) * size))) for c in range(cols)], size))
    width = max(len(f) * s for _, _, f, s in strips) * S
    height = sum(s for *_, s in strips) * S + len(strips) * 14
    out = Image.new("RGBA", (width + 90, height), (24, 24, 24, 255))
    d = ImageDraw.Draw(out)
    y = 0
    for name, row, frames, size in strips:
        d.text((4, y + 4), f"{name} {['down', 'up', 'left', 'right'][row]}", fill=(240, 240, 240))
        for i, fr in enumerate(frames):
            bg = Image.new("RGBA", fr.size, (119, 133, 68, 255))
            bg.alpha_composite(fr)
            out.paste(bg.resize((size * S, size * S), Image.NEAREST), (90 + i * size * S, y + 14))
        y += size * S + 14
    out.save(path)
    print(path)


if __name__ == "__main__":
    if sys.argv[1:] == ["build"]:
        build()
    else:
        preview(sys.argv[1] if len(sys.argv) > 1 else str(ROOT / ".claude/previews/swamp/bog-troll-extras.png"))
