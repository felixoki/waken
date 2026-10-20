import argparse
import importlib.util
import os
import sys
from collections import Counter

from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".."))
SPRITES = os.path.join(ROOT, "client", "public", "assets", "sprites")
FOLDERS = ("animals", "creatures", "people")


def sheet_path(name):
    for folder in FOLDERS:
        path = os.path.join(SPRITES, folder, name)
        if os.path.exists(path):
            return path
    raise SystemExit(f"{name} not found in {', '.join(FOLDERS)}")
DESIGNS = os.path.join(os.path.dirname(__file__), "..", "designs")
GRASS = (120, 160, 90, 255)


def load_design(name):
    path = os.path.join(DESIGNS, f"{name}.py")
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def clamp(c):
    return max(0, min(255, round(c)))


def apply(design, im):
    im = im.convert("RGBA")
    px = im.load()
    cache = {}
    for y in range(im.height):
        for x in range(im.width):
            p = px[x, y]
            if p not in cache:
                out = design.remap(*p)
                cache[p] = p if out is None else tuple(clamp(c) for c in out)
            px[x, y] = cache[p]
    return im


def cmd_palette(args):
    im = Image.open(args.file).convert("RGBA")
    counts = Counter(p for p in im.getdata() if p[3] > 0)
    print(f"{len(counts)} colours")
    for p, n in counts.most_common(args.top):
        lum = 0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2]
        print(f"{str(p):24} {n:7}  lum {lum:5.1f}")


def cmd_compare(args):
    d = load_design(args.design)
    src = Image.open(sheet_path(f"{d.SOURCE}_{args.sheet}.png")).convert("RGBA")
    fw = src.height // args.rows
    w = fw * args.frames
    a = src.crop((0, 0, w, src.height))
    b = apply(d, a.copy())
    canvas = Image.new("RGBA", (w * 2, src.height), GRASS)
    canvas.alpha_composite(a, (0, 0))
    canvas.alpha_composite(b, (w, 0))
    canvas = canvas.resize((canvas.width * args.scale, canvas.height * args.scale), Image.NEAREST)
    canvas.save(args.out)
    print(args.out)


def cmd_build(args):
    d = load_design(args.design)
    for sheet in d.SHEETS:
        src = sheet_path(f"{d.SOURCE}_{sheet}.png")
        out = os.path.join(os.path.dirname(src), f"{d.TARGET}_{sheet}.png")
        apply(d, Image.open(src)).save(out)
        print(os.path.relpath(out, ROOT))


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("palette")
    p.add_argument("file")
    p.add_argument("--top", type=int, default=40)
    p.set_defaults(fn=cmd_palette)
    p = sub.add_parser("compare")
    p.add_argument("design")
    p.add_argument("out")
    p.add_argument("--sheet", default="idle")
    p.add_argument("--rows", type=int, default=4)
    p.add_argument("--frames", type=int, default=2)
    p.add_argument("--scale", type=int, default=4)
    p.set_defaults(fn=cmd_compare)
    p = sub.add_parser("build")
    p.add_argument("design")
    p.set_defaults(fn=cmd_build)
    args = ap.parse_args()
    args.fn(args)


if __name__ == "__main__":
    sys.exit(main())
