import math, sys
from PIL import Image
from rod import centerline, paint

ROD_OUT = (66, 30, 23, 255)
ROD_LIGHT = (158, 97, 38, 255)
ROD_SHADE = (118, 61, 24, 255)
REMOVE = {(66,30,23),(118,61,24),(158,97,38),(84,60,21),(117,119,135),(215,220,248),(160,168,215)}
HAND = {(207,156,146),(191,129,118),(247,180,167),(153,45,24),(81,46,52)}

def frame(im, c, r):
    return im.crop((c*64, r*64, c*64+64, r*64+64)).convert('RGBA')

def strip(f):
    f = f.copy(); p = f.load(); holes = []
    for y in range(64):
        for x in range(64):
            if p[x,y][3] and p[x,y][:3] in REMOVE:
                p[x,y] = (0,0,0,0); holes.append((x,y))
    for _ in range(3):
        for (x,y) in holes:
            if p[x,y][3]: continue
            l, rr, u, d = [p[q] if 0<=q[0]<64 and 0<=q[1]<64 else (0,0,0,0) for q in ((x-1,y),(x+1,y),(x,y-1),(x,y+1))]
            if (l[3] and rr[3]) or (u[3] and d[3]):
                pick = l if (l[3] and rr[3]) else u
                p[x,y] = pick
    p = f.load()
    for y in range(64):
        for x in range(64):
            if p[x,y][3] and not any(p[x+dx,y+dy][3] for dx in (-1,0,1) for dy in (-1,0,1) if (dx or dy) and 0<=x+dx<64 and 0<=y+dy<64):
                p[x,y] = (0,0,0,0)
    return f

def hand(f):
    p = f.load()
    pts = [(x,y) for y in range(64) for x in range(64) if p[x,y][3] and p[x,y][:3] in HAND]
    mask = Image.new('RGBA', (64,64))
    for q in pts: mask.putpixel(q, p[q])
    return mask, pts

def rod_layer(grip_point, dirfn, length, a, bend):
    layer = Image.new('RGBA', (64, 64))
    tip = paint(layer, centerline(grip_point, dirfn, length, a, bend))
    return layer, tip

def project(facing, side):
    def f(a):
        fw, up = math.cos(math.radians(a)), math.sin(math.radians(a))
        if facing == 'right': return (fw, -up + side*0.35)
        if facing == 'left': return (-fw, -up + side*0.35)
        sd = side * max(0.0, up)
        if facing == 'down': return (sd, -up*0.8 + fw*0.8)
        return (sd, -up*0.8 - fw*0.8)
    return f

def norm(f):
    def g(a):
        x, y = f(a); m = math.hypot(x, y) or 1
        return (x/m*min(1, m*1.1), y/m*min(1, m*1.1))
    return g

def behind(facing, a):
    if facing in ('right','left'): return a > 112
    if facing == 'down': return a > 95
    return a < 85

IDLE_TIPS = [[33, 54], [35, 19], [0, 31], [63, 30]]

KEYS = [
    ('low', 55, 0),
    ('high', 95, 0),
    ('high', 128, 0),
    ('high', 150, 0),
    ('high', 100, -40),
    ('high', 55, -22),
    ('low', 22, -8),
    ('idle', 0, 0),
]
SIDE = {'right': 0.15, 'left': 0.15, 'down': 0.35, 'up': 0.35}

def build(src, out, current):
    throw = Image.open(src + 'player_fishing_throw.png')
    idle = Image.open(src + 'player_fishing.png')
    settled = Image.open(current + 'player_fishing.png')
    rows = ['down','up','left','right']
    sheet = Image.new('RGBA', (64*len(KEYS), 256))
    tips = [[None]*len(KEYS) for _ in range(4)]
    for r, facing in enumerate(rows):
        bodies = {'low': strip(frame(idle, 0, r)), 'high': strip(frame(throw, 2, r))}
        hands = {k: hand(v) for k, v in bodies.items()}
        for i, (which, a, bend) in enumerate(KEYS):
            if which == 'idle':
                sheet.alpha_composite(frame(settled, 0, r), (i*64, r*64))
                tips[r][i] = IDLE_TIPS[r]
                continue
            body = bodies[which]; hmask, hpts = hands[which]
            if hpts:
                gx = sum(x for x,_ in hpts)/len(hpts); gy = min(y for _,y in hpts)
            else:
                gx, gy = 40, 34
            grip = (gx, gy)
            rod, tip = rod_layer(grip, norm(project(facing, SIDE[facing])), 23, a, bend)
            cell = Image.new('RGBA', (64,64))
            if behind(facing, a):
                cell.alpha_composite(rod); cell.alpha_composite(body)
            else:
                cell.alpha_composite(body); cell.alpha_composite(rod)
            cell.alpha_composite(hmask)
            sheet.alpha_composite(cell, (i*64, r*64))
            tips[r][i] = list(tip)
    sheet.save(out)
    return sheet, tips

if __name__ == '__main__':
    s, tips = build(sys.argv[1], sys.argv[2], sys.argv[4])
    import json; print(json.dumps(tips))
    bg = Image.new('RGBA', s.size, (225,228,220,255)); bg.alpha_composite(s)
    bg.resize((s.width*4, s.height*4), Image.NEAREST).save(sys.argv[3])
