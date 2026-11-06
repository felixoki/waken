"""Builds collection/icons_honey.png: honey (the jam jar in amber) and the bee smoker (the watering can in tin, leather bellows, a wisp of smoke).

Layout (16px cells, 1-indexed): honey icon r2 c1, texture r1-2 c2-3; smoker icon r2 c4, texture r1-2 c5-6.
"""
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[4]
SPRITES = ROOT / "client/public/assets/sprites"

JAM_ICON = (21 * 16, 17 * 16)
JAM_TEXTURE = (22 * 16, 16 * 16)
CAN_ICON = (3 * 16, 13 * 16)
CAN_TEXTURE = (4 * 16, 12 * 16)

TIN = {
    (87, 0, 36): (52, 56, 68),
    (126, 12, 59): (96, 102, 116),
    (173, 21, 83): (140, 148, 158),
    (211, 67, 127): (190, 198, 204),
}
LEATHER = {
    (87, 0, 36): (62, 38, 28),
    (126, 12, 59): (100, 62, 40),
    (173, 21, 83): (130, 86, 54),
    (211, 67, 127): (164, 114, 72),
}
PUFF_SMALL = [(0, -1, 0), (-1, -2, 0), (0, -2, 1), (-1, -3, 1), (0, -4, 2)]
PUFF_BIG = [
    (0, -1, 0), (-1, -1, 0), (-1, -2, 0), (0, -2, 0), (-2, -3, 1), (-1, -3, 0),
    (0, -3, 1), (-2, -4, 1), (-1, -4, 1), (-1, -5, 2), (0, -6, 2), (0, -5, 2),
]
SMOKE = [(214, 214, 214, 210), (188, 188, 192, 160), (160, 160, 168, 110)]


def amber(img):
    out = img.copy()
    px = out.load()
    for y in range(out.height):
        for x in range(out.width):
            r, g, b, a = px[x, y]
            if not a or (r, g, b) == (42, 40, 61):
                continue
            if r > g + 30 and r > b:
                l = (r + g + b) / 3 / 255
                t = min(1.0, max(0.0, (l - 0.15) / 0.55))
                lo, hi = (120, 64, 14), (250, 196, 70)
                px[x, y] = tuple(round(lo[i] + (hi[i] - lo[i]) * t) for i in range(3)) + (a,)
    return out


def smoker(img, bellows_rows):
    out = img.copy()
    px = out.load()
    solid = [(x, y) for y in range(out.height) for x in range(out.width) if px[x, y][3] == 255]
    top = min(y for _, y in solid)
    left = min(x for x, _ in solid)
    cx = sum(x for x, _ in solid) / len(solid)
    for x, y in solid:
        rgb = px[x, y][:3]
        table = LEATHER if y < top + bellows_rows and x > cx - 1 else TIN
        if rgb in table:
            px[x, y] = table[rgb] + (255,)
    spout = min(y for x, y in solid if x == left)
    puff = PUFF_BIG if bellows_rows > 3 else PUFF_SMALL
    for dx, dy, i in puff:
        x, y = left + dx, spout + dy
        if 0 <= x < out.width and 0 <= y < out.height and not px[x, y][3]:
            px[x, y] = SMOKE[i]
    return out


def build(out_path):
    items = Image.open(SPRITES / "items.png").convert("RGBA")
    crop = lambda xy, w, h: items.crop((xy[0], xy[1], xy[0] + w, xy[1] + h))
    sheet = Image.new("RGBA", (6 * 16, 2 * 16))
    sheet.paste(amber(crop(JAM_ICON, 16, 16)), (0, 16))
    sheet.paste(amber(crop(JAM_TEXTURE, 32, 32)), (16, 0))
    sheet.paste(smoker(crop(CAN_ICON, 16, 16), 3), (48, 16))
    sheet.paste(smoker(crop(CAN_TEXTURE, 32, 32), 5), (64, 0))
    sheet.save(out_path)


if __name__ == "__main__":
    build(sys.argv[1] if len(sys.argv) > 1 else SPRITES / "collection/icons_honey.png")
