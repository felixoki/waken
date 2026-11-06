"""Builds collection/swamp_flora.png: forest bushes and grass tufts with the swamp meadow grade baked in.

Same formula as frags/meadow.ts graded() and the graded trees (TREE15-18):
mix(luma, c, saturation) * tint * brightness with MEADOW_GRADES.swamp.
Pass the texture configs as JSON (entity -> TEXTURE config, on the nature sheet); prints each entity's
new tiles on swamp_flora, laid out left to right with a one-tile gap.
"""
import json
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[4]
SPRITES = ROOT / "client/public/assets/sprites"
SATURATION, TINT, BRIGHTNESS = 0.62, (1.1, 1.0, 0.7), 0.92


def graded(img):
    out = img.copy()
    px = out.load()
    for y in range(out.height):
        for x in range(out.width):
            r, g, b, a = px[x, y]
            if not a:
                continue
            l = 0.299 * r + 0.587 * g + 0.114 * b
            px[x, y] = tuple(
                max(0, min(255, round((l + (c - l) * SATURATION) * t * BRIGHTNESS))) for c, t in zip((r, g, b), TINT)
            ) + (a,)
    return out


def build(textures):
    nature = Image.open(SPRITES / "nature.png").convert("RGBA")
    crops = []
    for name, cfg in textures.items():
        rows = cfg["tiles"]
        c0 = min(r["start"] for r in rows)
        c1 = max(r["end"] for r in rows)
        crops.append((name, graded(nature.crop(((c0 - 1) * 16, (rows[0]["row"] - 1) * 16, c1 * 16, rows[-1]["row"] * 16)))))

    height = max(img.height for _, img in crops)
    sheet = Image.new("RGBA", (sum(img.width + 16 for _, img in crops), height))
    layout, x = {}, 0
    for name, img in crops:
        top = height - img.height
        sheet.paste(img, (x, top))
        layout[name] = [
            {"row": top // 16 + r + 1, "start": x // 16 + 1, "end": x // 16 + img.width // 16} for r in range(img.height // 16)
        ]
        x += img.width + 16
    sheet.save(SPRITES / "collection/swamp_flora.png")
    print(json.dumps(layout))


if __name__ == "__main__":
    build(json.load(open(sys.argv[1])))
