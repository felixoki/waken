"""A pale mask on the back of the hood, a crescent on each side of the body.
The design itself lives in drafts/forty.py as `moon`; this file adopts it and adds its hood item."""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location("forty", Path(__file__).parent / "drafts" / "forty.py")
_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_mod)
_d = _mod.DESIGNS["moon"]

BASE, MATERIALS, paint = _d.BASE, _d.MATERIALS, _d.paint
ITEM_SLOT = 0


def paint_item(kind, x, y, part):
    cx, cy, r = (11, 14, 2.6) if kind == "texture" else (5, 8, 1.6)
    return "moon" if part == "shell" and (x - cx) ** 2 + (y - cy) ** 2 <= r * r else None
