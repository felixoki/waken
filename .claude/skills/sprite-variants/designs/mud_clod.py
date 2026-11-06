"""Builds creatures/bog_troll_mud.png: the troll's throwing rock as a wet clod of marsh mud."""
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[4]
CREATURES = ROOT / "client/public/assets/sprites/creatures"

RAMP = [
    (34, 26, 20),
    (56, 42, 30),
    (78, 60, 38),
    (98, 76, 46),
    (118, 94, 58),
    (150, 132, 92),
]
MOSS = (86, 92, 44)
FLECKS = {(11, 14), (18, 12), (14, 19)}


def luma(c):
    return 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]


def build(out_path):
    rock = Image.open(CREATURES / "troll_throwing_rock.png").convert("RGBA")
    out = rock.copy()
    px = out.load()
    for y in range(out.height):
        for x in range(out.width):
            r, g, b, a = px[x, y]
            if not a:
                continue
            l = luma((r, g, b))
            if l < 70:
                c = RAMP[0]
            elif l < 115:
                c = RAMP[1]
            elif l < 160:
                c = RAMP[2]
            elif l < 200:
                c = RAMP[3]
            elif l < 235:
                c = RAMP[4]
            else:
                c = RAMP[5]
            if (x, y) in FLECKS:
                c = MOSS
            px[x, y] = c + (a,)
    out.save(out_path)


if __name__ == "__main__":
    build(sys.argv[1] if len(sys.argv) > 1 else CREATURES / "bog_troll_mud.png")
