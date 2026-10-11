"""A sister to the raven robe: blue-black, covered in the scale pattern of the Troll scales item,
with blue highlights on the scale tips, a few of which blink at their own moments."""

BASE = [0x1E1A28, 0x1E1A28, 0x1E1A28, 0x221F33, 0x25242D, 0x2C2A3A, 0x34364A, 0x3D3B59, 0x3D3B59, 0x25242D]

MATERIALS = {
    "void": 0x030304,
    "gap": 0x0E0C14,
    "shade": 0x1E1A28,
    "rim": 0x252341,
    "body": 0x2C2A52,
    "light": 0x3D3B59,
    "dim": 0x2E3B78,
    "blue": 0x445BB1,
    "bright": 0x6E85E4,
    "fade": 0x221F33,
    "ring": 0x3D3B59,
}

ITEM_SLOT = 1


def scale(x, y, y0, frame):
    row, ly = (y - y0) // 4, (y - y0) % 4
    column = x + (row % 2) * 3
    lx = column % 5
    if lx == 4:
        return "gap"
    if ly == 0:
        return "rim" if lx in (1, 2) else "shade"
    if ly == 1:
        return "rim" if lx == 2 else "body"
    seed = column // 5 * 37 + row * 101 + (column // 5) * row * 13
    spot = 3 - (seed // 3) % 2
    if lx == 0 and ly == spot:
        moment = seed % 24
        if moment >= 8:
            return "dim"
        gap = min((frame - moment) % 8, (moment - frame) % 8)
        return "bright" if gap == 0 else "blue" if gap == 1 else "dim"
    if ly == 2:
        return "light" if lx in (0, 3) else "body"
    return "light" if lx <= 1 else "shade"


def paint(pose, x, y, at):
    top = 18 if pose == "front" else 17
    if at.rim:
        return "ring"
    if y < top:
        row = (y - top) // 4
        hit = scale(x, y, top, at.frame)
        if row == -1:
            return {"gap": "gap", "shade": "shade", "rim": "shade", "body": "fade"}.get(hit, "rim")
        return None
    if pose == "front" and abs(x - 15.5) <= 1.5:
        return None
    hit = scale(x, y, top, at.frame)
    if at.hem == 0 and hit == "gap":
        return "void"
    return hit


def paint_item(kind, x, y, part):
    if part == "rim":
        return "ring"
    if part == "shell":
        return {"bright": "blue", "gap": "gap", "shade": "shade", "rim": "rim", "body": "body", "light": "light"}.get(scale(x, y, 0, 0), "dim")
