"""Copy a tileset with a meadow grade baked in, for tile art the meadow shader does not paint (details).

Applies the same formula as frags/meadow.ts graded(): mix(luma, c, saturation) * tint * brightness,
with the values of MEADOW_GRADES[<grade>] in server/src/globals.ts.

    /usr/bin/python3 .claude/skills/create-biome/scripts/grade.py grass_ground_details swamp_details swamp
"""
import json
import re
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[4]
ASSETS = ROOT / "client/public/assets"


def grade(name: str) -> tuple[float, tuple[float, float, float], float]:
    text = (ROOT / "server/src/globals.ts").read_text()
    m = re.search(name + r":\s*\{\s*saturation:\s*([\d.]+),\s*tint:\s*\[([\d.]+),\s*([\d.]+),\s*([\d.]+)\],\s*brightness:\s*([\d.]+)", text)
    if not m:
        sys.exit(f"no MEADOW_GRADES entry {name}")
    v = [float(x) for x in m.groups()]
    return v[0], (v[1], v[2], v[3]), v[4]


def main(source: str, target: str, name: str) -> None:
    saturation, tint, brightness = grade(name)
    img = Image.open(ASSETS / "sprites/tiles" / f"{source}.png").convert("RGBA")
    px = img.load()
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = px[x, y]
            if not a:
                continue
            l = 0.299 * r + 0.587 * g + 0.114 * b
            px[x, y] = tuple(
                max(0, min(255, round((l + (c - l) * saturation) * t * brightness)))
                for c, t in zip((r, g, b), tint)
            ) + (a,)
    img.save(ASSETS / "sprites/tiles" / f"{target}.png")

    meta = json.loads((ASSETS / "tilesets" / f"{source}.json").read_text())
    meta["name"] = target
    meta["image"] = f"../sprites/tiles/{target}.png"
    (ASSETS / "tilesets" / f"{target}.json").write_text(json.dumps(meta, indent=2) + "\n")
    print(f"wrote tiles/{target}.png and tilesets/{target}.json")


if __name__ == "__main__":
    main(*sys.argv[1:4])
