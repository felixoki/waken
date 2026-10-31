import math
from PIL import Image

OUT = (66, 30, 23, 255)
LIGHT = (158, 97, 38, 255)
SHADE = (118, 61, 24, 255)
COLOURS = {OUT[:3], LIGHT[:3], SHADE[:3]}
HAND = {(207,156,146),(191,129,118),(247,180,167),(153,45,24),(81,46,52)}


def centerline(grip, direction, length, a=0.0, bend=0.0):
    x, y = grip
    steps = int(length * 4)
    pts = [(round(x), round(y))]
    for i in range(steps):
        t = i / steps
        dx, dy = direction(a + bend * t * t)
        x += dx * length / steps
        y += dy * length / steps
        q = (round(x), round(y))
        if q != pts[-1]:
            pts.append(q)
    clean = [pts[0]]
    for i in range(1, len(pts) - 1):
        p, n = clean[-1], pts[i + 1]
        if abs(n[0] - p[0]) <= 1 and abs(n[1] - p[1]) <= 1:
            continue
        clean.append(pts[i])
    clean.append(pts[-1])
    return clean


def paint(layer, pts):
    p = layer.load()
    n = len(pts)
    cells = {}

    def put(q, colour, rank):
        if 0 <= q[0] < 64 and 0 <= q[1] < 64 and cells.get(q, (None, -1))[1] < rank:
            cells[q] = (colour, rank)

    thick = round(n * 0.45)
    for i, (x, y) in enumerate(pts):
        a = pts[max(0, i - 2)]
        b = pts[min(n - 1, i + 2)]
        shallow = abs(b[0] - a[0]) >= abs(b[1] - a[1])
        up = (x, y - 1) if shallow else (x - 1, y)
        down = (x, y + 1) if shallow else (x + 1, y)
        if i < thick:
            put((x, y), LIGHT, 3)
            put(down, SHADE, 2)
            put(up, OUT, 1)
        elif i < n - 2:
            put((x, y), SHADE, 3)
            put(up, OUT, 1)
        else:
            put((x, y), OUT, 3)
    for q, (colour, _) in cells.items():
        p[q] = colour
    return pts[-1]


def grip(frame):
    p = frame.load()
    pts = [(x, y) for y in range(64) for x in range(64) if p[x, y][3] and p[x, y][:3] in HAND]
    if not pts:
        return None, pts
    return (sum(x for x, _ in pts) / len(pts), min(y for _, y in pts)), pts
