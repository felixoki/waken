"""Bellan's fleece: a leather robe under a pelt hood and a ragged mantle half way down, fleece round the face.
The fur texture copies the dark pelt on the drying rack in village_hunter_interior.png (rows 7-9, cols 2-4);
leather and fleece come from the rack and the fleece below it."""


def hexrgb(c):
    return ((c >> 16) & 255, (c >> 8) & 255, c & 255)


def cloth(dark, mid, light):
    d, m, l = hexrgb(dark), hexrgb(mid), hexrgb(light)
    out = []
    for i in range(10):
        a, b, t = (d, m, i / 4) if i <= 4 else (m, l, (i - 4) / 5)
        c = tuple(round(a[k] + (b[k] - a[k]) * t) for k in range(3))
        out.append((c[0] << 16) | (c[1] << 8) | c[2])
    return out


PELT = [0x252527, 0x2E2E31, 0x3B3B40, 0x44444D, 0x52525C, 0x595B66, 0x626674]
LEVEL = [0, 1, 1, 2, 3, 4, 5, 5, 6, 4]
NECK = {"front": 17, "back": 16, "side": 16}
MANTLE = 7


def fur_ramp(shift):
    return [PELT[max(0, min(6, LEVEL[i] + shift))] for i in range(10)]


BASE = cloth(0x382122, 0x664138, 0x8D5F45)

MATERIALS = {
    **{f"fur{k:+d}": fur_ramp(k) for k in (-2, -1, 0, 1)},
    "fleece": cloth(0x5E5047, 0x998374, 0xCDB88F),
    "void": 0x030304,
}

EDGES = {f"fur{k:+d}": 0x252527 for k in (-2, -1, 0, 1)}

ITEM_SLOT = 4


def noise(x, y):
    h = ((x * 73856093) ^ (y * 19349663) ^ (x * y * 83492791)) & 0xFF
    return -1 if h < 64 else 1 if h > 200 else 0


def tuft(x, salt=0):
    return ((x * 7 + salt * 13) ^ (x * 3 + salt)) % 3


def fur(x, y, hem):
    k = noise(x, y) - (hem <= 1)
    return f"fur{max(-2, min(1, k)):+d}"


def paint(pose, x, y, at):
    if at.rim:
        return "fleece"
    if y < NECK[pose] + MANTLE + tuft(x, 2):
        if at.hem == 0 and tuft(x, 3) == 1:
            return "void"
        return fur(x, y, at.hem)
    return None


def paint_item(kind, x, y, part):
    if part == "rim":
        return "fleece"
    if part == "shell":
        return f"fur{max(-1, min(1, noise(x, y) + 1)):+d}"
    return None
