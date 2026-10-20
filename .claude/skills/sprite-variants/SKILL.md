---
name: sprite-variants
description: Copy an existing Waken entity's spritesheets and recolour them with Python Pillow into a new variant - a darker or lighter animal, a legendary or relic version, a seasonal or regional palette, a tinted NPC - or update the colours of an existing variant. Use when the user wants a colour variant of a creature, animal, NPC or prop ("a black bear from the brown bear", "a snow wolf", "a sick sheep"), wants an existing variant's colours tweaked, or asks to inspect a sprite's palette. Covers reading the palette, writing a design file, the side-by-side compare loop, building every sheet, and handing off to new-entity for registration. Not for player robes (use robes).
---

# Sprite variants

A variant is a **design file** (`designs/<target>.py`) that holds a per-pixel `remap`
function. `scripts/variant.py` runs it over the source entity's sheets and writes
`client/public/assets/sprites/<folder>/<target>_<sheet>.png`, in the same
`animals/`, `creatures/` or `people/` folder as the source. The frame layout stays identical,
so frame sizes and frame counts carry over from the source unchanged. Needs Python 3
with Pillow. Run it without `-I`, because Pillow lives in the user site-packages.

```
python3 .claude/skills/sprite-variants/scripts/variant.py palette client/public/assets/sprites/animals/bear_idle.png
python3 .claude/skills/sprite-variants/scripts/variant.py compare bellan /tmp/c.png --sheet walking --frames 3
python3 .claude/skills/sprite-variants/scripts/variant.py build bellan
```

## Design file

```python
SOURCE = "bear"
TARGET = "bellan"
SHEETS = ["idle", "walking", "running", "standing", "slashing"]

def remap(r, g, b, a):
    ...
    return (r2, g2, b2, a)   # or None to leave the pixel untouched
```

`SHEETS` are the file suffixes on disk, not the state names. The bear's `warning` state
loads `bear_standing.png`, so check `maps.ts` for the real file names. `remap` is cached
per unique colour, so it can be as expensive as you like. Return values get rounded and clamped.

## Workflow

1. **Palette first.** Run `palette` on the source. Most sheets have 20 to 40 colours.
   Sort them into groups: the drop shadow (semi-transparent, always leave it alone), the
   outline, the fur or body ramp, the highlights (muzzle, paws, belly) and the accents (eyes).
2. **Map by luminance, not hue.** Keep the source's light-to-dark order inside each group
   and you keep its shading. Compute `0.299r + 0.587g + 0.114b`, then push it through a
   curve into the new colour. Pick accents out with an explicit test and return `None` for
   them, the way `bellan.py` keeps the amber eyes.
3. **Compare on grass.** `compare` draws the source and the variant side by side on a
   grass-green background at 4x nearest-neighbour. Look at it with Read. A dark variant has
   to read against the ground and its own outline. If the body merges into the outline, lift
   the body ramp before you darken the outline.
4. **Keep it subtle.** No glow, no posterize, no added pixels unless asked. A variant is a
   palette change. Even a legendary entity's sheet stays understated, and any spectacle
   belongs in effects.
5. **Build**, then hand off to the `new-entity` skill for the enum, definition, animations
   and `maps.ts` keys. Copy the source's animation timings and spritesheet entries exactly.

## Updating an existing variant

Edit its design file and run `build` again. That overwrites every sheet in `SHEETS`.
Design files are the source of truth, so never hand-edit a generated PNG. If you did,
the next build would erase the edit.
