import math, random, sys
from PIL import Image
N = 538
def tileable(seed, cx, cy):
    rng = random.Random(seed)
    lat = [[rng.random() for _ in range(cx)] for _ in range(cy)]
    def f(x, y):
        gx, gy = (x % N) / N * cx, (y % N) / N * cy
        ix, iy = int(gx), int(gy)
        fx, fy = gx - ix, gy - iy
        fx = fx * fx * fx * (fx * (fx * 6 - 15) + 10); fy = fy * fy * fy * (fy * (fy * 6 - 15) + 10)
        a = lat[iy % cy][ix % cx]; b = lat[iy % cy][(ix + 1) % cx]
        c = lat[(iy + 1) % cy][ix % cx]; d = lat[(iy + 1) % cy][(ix + 1) % cx]
        return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy
    return f
def make(seed, colors, out, coverage, core, preview):
    a = tileable(seed, 8, 12); b = tileable(seed + 1, 12, 8)
    wx = tileable(seed + 2, 16, 16); wy = tileable(seed + 3, 16, 16)
    tx = tileable(seed + 4, 134, 134); ty = tileable(seed + 5, 134, 134)
    vals = []
    for y in range(N):
        for x in range(N):
            px = x + (wx(x, y) - 0.5) * 21 + (tx(x, y) - 0.5) * 3
            py = y + (wy(x, y) - 0.5) * 13 + (ty(x, y) - 0.5) * 2
            vals.append(a(px, py) * 0.6 + b(px + 37, py + 11) * 0.4)
    sv = sorted(vals)
    t1 = sv[int(len(sv) * (1 - coverage))]; t2 = sv[int(len(sv) * (1 - core))]
    im = Image.new('RGB', (N, N))
    for i, v in enumerate(vals):
        im.putpixel((i % N, i // N), colors[2] if v > t2 else colors[1] if v > t1 else colors[0])
    im.save(out)
    big = Image.new('RGB', (N * 2, N * 2))
    for i in range(2):
        for j in range(2): big.paste(im, (i * N, j * N))
    big.resize((N * 2, N * 2), Image.NEAREST).save(preview)
hexc = lambda h: ((h >> 16) & 255, (h >> 8) & 255, h & 255)
which = sys.argv[1]
pal = {'grass': [0x7aad55, 0x6fa452, 0x63984f], 'isles': [0x60aaa2, 0x5aa09b, 0x528f8e]}[which]
make({'grass': 11, 'isles': 37}[which], [hexc(c) for c in pal], sys.argv[2], 0.42, 0.10, sys.argv[3])
