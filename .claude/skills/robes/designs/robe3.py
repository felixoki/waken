"""Plain dark cloth, frayed at the hem and moth-eaten.
The design itself lives in drafts/sixty.py as `rooftops`; this file adopts it and adds its hood item."""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location("sixty", Path(__file__).parent / "drafts" / "sixty.py")
_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_mod)
_d = _mod.DESIGNS["rooftops"]

BASE, MATERIALS, paint = _d.BASE, _d.MATERIALS, _d.paint
ITEM_SLOT = 2


def paint_item(kind, x, y, part):
    return "void" if part == "shell" and (x // 2 * 7 + y // 2 * 5) % 9 == 0 else None
