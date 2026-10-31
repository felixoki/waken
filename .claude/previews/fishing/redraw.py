import sys, json, math
from PIL import Image
from rod import centerline, paint, grip, COLOURS

LENGTH = {0: 15, 2: 23, 3: 23}


def strip_rod(cell):
    p = cell.load()
    holes = []
    for y in range(64):
        for x in range(64):
            if p[x, y][3] and p[x, y][:3] in COLOURS:
                p[x, y] = (0, 0, 0, 0)
                holes.append((x, y))
    for _ in range(3):
        for (x, y) in holes:
            if p[x, y][3]:
                continue
            l, r, u, d = [p[q] if 0 <= q[0] < 64 and 0 <= q[1] < 64 else (0, 0, 0, 0)
                          for q in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1))]
            if l[3] and r[3]:
                p[x, y] = l
            elif u[3] and d[3]:
                p[x, y] = u


def redraw(src, out, cols, tips):
    sheet = Image.open(src).convert('RGBA')
    result = [[list(t) for t in row] for row in tips]
    for r, length in LENGTH.items():
        for c in range(cols):
            cell = sheet.crop((c * 64, r * 64, c * 64 + 64, r * 64 + 64))
            (gx, gy), hand = grip(cell)
            mask = Image.new('RGBA', (64, 64))
            for q in hand:
                mask.putpixel(q, cell.getpixel(q))
            tx, ty = tips[r][c]
            dx, dy = tx - gx, ty - gy
            m = math.hypot(dx, dy)
            direction = lambda _a, ux=dx / m, uy=dy / m: (ux, uy)
            strip_rod(cell)
            layer = Image.new('RGBA', (64, 64))
            tip = paint(layer, centerline((gx, gy), direction, length))
            cell.alpha_composite(layer)
            cell.alpha_composite(mask)
            sheet.paste(cell, (c * 64, r * 64))
            result[r][c] = list(tip)
    sheet.save(out)
    return result


if __name__ == '__main__':
    print(json.dumps(redraw(sys.argv[1], sys.argv[2], int(sys.argv[3]), json.loads(sys.argv[4]))))
