"""Approximate what handlers/water.ts and the water frag show: open water or exposed bed.

Mirrors BEACH_REACH, BEACH_EDGE, BEACH_RESOLUTION and BEACH_BLUR from
server/src/globals.ts; update them here if those change.
Blue = open water, tan = bed showing through, green/brown = land.

    /usr/bin/python3 .claude/skills/create-biome/scripts/sim.py swamp out.png
"""
import sys
from collections import deque
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "tiled/scripts"))
from tmx import Map
from PIL import Image

REACH, EDGE, RES, BLUR = 3, 0.5, 4, 3
m = Map(sys.argv[1])
W = m.grid(m.layer('water')); B = m.grid(m.layer('beach'))
h, w = len(W), len(W[0])
N8 = [(1,0),(-1,0),(0,1),(0,-1),(1,1),(1,-1),(-1,1),(-1,-1)]
dist = [[-1]*w for _ in range(h)]
q = deque()
for y in range(h):
    for x in range(w):
        if not W[y][x]:
            dist[y][x] = 0; q.append((x, y))
while q:
    x, y = q.popleft()
    for dx, dy in N8:
        nx, ny = x+dx, y+dy
        if 0 <= nx < w and 0 <= ny < h and dist[ny][nx] == -1:
            dist[ny][nx] = dist[y][x]+1; q.append((nx, ny))
shore = [[1.0]*w for _ in range(h)]
for y in range(h):
    for x in range(w):
        if dist[y][x] > 0 and B[y][x]:
            shore[y][x] = min(1, dist[y][x]/REACH)
for y in range(h):
    for x in range(w):
        if dist[y][x] == 0 and any(0<=x+dx<w and 0<=y+dy<h and dist[y+dy][x+dx]>0 and B[y+dy][x+dx] for dx,dy in N8):
            shore[y][x] = 0
W2, H2 = w*RES, h*RES
a = [shore[yy//RES][xx//RES] for yy in range(H2) for xx in range(W2)]
for _ in range(2):
    b = [0.0]*(W2*H2)
    for yy in range(H2):
        row = a[yy*W2:(yy+1)*W2]
        for xx in range(W2):
            s = 0
            for k in range(-BLUR, BLUR+1):
                s += row[min(W2-1, max(0, xx+k))]
            b[yy*W2+xx] = s/(2*BLUR+1)
    for yy in range(H2):
        for xx in range(W2):
            s = 0
            for k in range(-BLUR, BLUR+1):
                s += b[min(H2-1, max(0, yy+k))*W2+xx]
            a[yy*W2+xx] = s/(2*BLUR+1)
img = Image.new('RGB', (W2, H2))
G = m.grid(m.layer('grass'))
open_ = 0
for yy in range(H2):
    for xx in range(W2):
        x, y = xx//RES, yy//RES
        if W[y][x]:
            vis = a[yy*W2+xx] >= EDGE
            open_ += vis
            img.putpixel((xx, yy), (78, 100, 170) if vis else (180, 150, 105))
        else:
            img.putpixel((xx, yy), (110, 160, 80) if G[y][x] or m.grid(m.layer('grass_ground_border'))[y][x] else (140, 115, 85))
total = sum(v > 0 for r in W for v in r) * RES * RES
print(f'open water {open_/max(1,total):.0%} of painted water')
img.resize((W2*2, H2*2), Image.NEAREST).save(sys.argv[2])
