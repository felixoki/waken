"""The classic wizard's robe in warm red, scattered with yellow stars and moons.
The design itself lives in drafts/sixty.py as `wizard_stars`; this file adopts it and adds its hood item."""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location("sixty", Path(__file__).parent / "drafts" / "sixty.py")
_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_mod)
_d = _mod.DESIGNS["wizard_stars"]

BASE, MATERIALS, paint = _d.BASE, _d.MATERIALS, _d.paint
ITEM_SLOT = 3


def paint_item(kind, x, y, part):
    if part == "rim":
        return "gold"
    return "star" if part == "shell" and (x * 3 + y * 5) % 11 == 0 else None
