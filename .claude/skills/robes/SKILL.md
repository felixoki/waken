---
name: robes
description: Create a new player robe for Waken by editing the pixels of the player sprite sheets - a recolour, or a hand-designed motif such as an animal pelt, trim, emblem or pattern painted per direction - and apply it to all 17 player animation sheets at once. Use when the user wants a new robe, cloak, outfit or player skin, a colour variant of the player, a change to an existing robe (the fox robe), or asks whether the player sprite can be recoloured or drawn on. Covers reading the sheets, writing a design file, the draft and zoom loop, building every animation, and what is not wired into the game yet.
---

# Player robes

A robe is a **design file** (`designs/<name>.py`) that says how to recolour the blue robe and
what to paint on it. `scripts/robe.py` applies it to every player sheet and writes
`client/public/assets/sprites/robes/<name>/player_*.png`, same file names and frame layout
as the originals. Needs Python 3 with Pillow.

```
python3 .claude/skills/robes/scripts/robe.py grid idle --row 1          # look at a frame, with coordinates
python3 .claude/skills/robes/scripts/robe.py zoom fox /tmp/z.png        # 10x, one column per direction
python3 .claude/skills/robes/scripts/robe.py zoom fox /tmp/z.png --sheet walking --frames 0 3 5
python3 .claude/skills/robes/scripts/robe.py build fox --preview /tmp/p # all 17 sheets + 4x previews
python3 .claude/skills/robes/scripts/robe.py palette client/public/assets/sprites/fox_idle.png
```

`build` without `--out` writes straight into the sprites folder. While drafting, pass
`--out` to the scratchpad and only build into the project once the user has picked.

## What the user wants

- **A motif with an idea, not a repeating pattern.** Rings, slashes and waves were all
  called "too generic to use". The fox pelt hugging the player from behind is the bar: a
  thing drawn on the robe, different from each direction.
- **Drafts first.** Offer two or three clearly different directions as idle-only drafts,
  describe each in a line, let the user pick, then refine. Do not build all sheets for a
  draft.
- **Use colours already in the game.** For an animal or item, run `palette` on its sprite
  and use those exact colours as the material ramps.
- **No stray dots.** Two-by-two accent marks (paws, buttons) read as noise at this size
  and were removed on request. Cool dark greys also read as green on a red robe.
- **Not too dark.** A deep wine base was rejected as "way too dark"; keep the base around
  the brightness of the original blue.
- Look at every result yourself at 10x before showing it, and say plainly which view is
  weak. The front view usually is, because the face opening leaves little cloth.

## How the sheets work

- 17 sheets, listed in `SHEETS` in the script with their cell size (32, or 64 for tool
  animations). Four rows: front, back, facing left, facing right. The right row is an exact
  mirror of the left one, so a design only describes `front`, `back` and `side`.
- The robe is exactly ten blues (`ROBE`, dark to light; index 4 `2a3f6e` is the main body
  colour, index 9 `7594db` is the hem dots). Outline, face, eyes, feet, hands, tools and
  the shadow are other colours and are never touched. The lantern sheets have a few lit
  robe blues, mapped in `LIT`.
- A design paints in **idle frame 0 coordinates**. For every other frame the script finds
  the robe blob, measures the hood (top row and hood centre) and shifts the design by that
  offset. This holds up for walking, running, jumping, casting and all tool sheets.
- Two poses do not fit that template and get `paint_free` instead, with coordinates
  normalised to the robe's bounding box: `sleep` (the whole sleeping sheet, one curled
  figure) and `ball` (rolling frames 3 and 4). They are listed in `FREE`.

Idle frame 0 landmarks, x then y, for placing things:

| | hood | face opening | neck | body | hem |
|---|---|---|---|---|---|
| front | y 6-16, x 9-22 | y 9-15, x 12-19 | y 17 | y 18-26, x 8-23 | y 26-27 |
| back | y 5-16, x 9-22 | none | y 16 | y 17-25, x 8-23 | y 25-26 |
| side (faces left) | y 5-15, x 9-23, back of hood at x 18+ | y 8-14, x 11-17 | y 16 | y 17-25, x 10-23 | y 25-26 |

The figure is centred on x 15.5, so `abs(x - 15.5)` gives symmetric shapes on front and back.
Run `grid` rather than trusting this table when a pixel matters.

## Design file

```python
BASE = dict(hue=0, sat=1.25, val=1.15, drift=-0.5)   # or None to keep the blue

MATERIALS = {
    "fur": [0x6C2C2B, ...ten colours, dark to light...],   # explicit ramp, one per robe shade
    "gold": dict(hue=45, sat=1.1, val=1.4, lift=0.1),      # or a shade transform
}

EDGES = {"fur": 0x4E2025}        # optional 1px rim where that material meets bare robe

def paint(pose, x, y):           # pose is "front", "back" or "side"; return a material or None
    ...

def paint_free(pose, u, v, x, y):  # pose is "ball" or "sleep"; u, v in 0..1 across the robe
    ...

def stamps(pose):                # optional pixels outside the silhouette, e.g. ears
    return [(x, y, "outline" or material), ...]
```

- `BASE` and dict materials are hue and brightness transforms of the original blue, so the
  cloth shading survives. `hue` is degrees, `sat` and `val` multiply, `lift` adds
  brightness, `drift` is how much of the original shadow hue shift to keep (negative
  flips it, which keeps red shadows from going orange).
- A ten-colour ramp gives exact palette colours and still follows the folds, because each
  robe shade maps to the ramp entry at the same index.
- A pure recolour is a file with only `BASE`.
- `EDGES` is what makes a motif readable when its colour is close to the base. The fox on
  red needed it; without the rim the pelt and robe merged.
- `stamps` change the silhouette. Check the game's hitbox and y-sort are unaffected before
  shipping a design that uses them, and note it to the user.

A material can also be a single int (`"core": 0xFFB43A`), a flat colour that ignores the
cloth shading; use it for things that glow.

`paint` and `paint_free` may take one extra last argument, `at`, with facts about the
pixel in the actual frame rather than the idle template:

- `at.frame`: the frame number, for anything that should move from frame to frame.
- `at.hem`: how many pixels this one is above the lowest robe pixel in its column (0 is
  the hem itself, 99 if that column does not reach the hem). Use it for anything that
  must sit on the hem in every pose; template y does not follow a swinging hem.
- `at.rim`: true for the cloth pixels bordering the face opening.

A design may also define `face(pose, x, y, at)` to repaint the black face opening and the
eyes, in the same idle coordinates (`front` and `side` only). `at.eye` is true where the
original frame has an eye pixel, so drawing the eye there keeps the blink and the glances.
This is how a different character is made on the same body: `designs/gandalf.py` is the
same hood and cloak in grey with skin, brows, hair and a beard that runs from the face
down onto the chest. A character with a different body (no hood, visible limbs, another
height) cannot be made this way and would need every frame drawn.

`designs/fox.py` is the reference for a drawn motif. `designs/robe2.py` is the
reference for the `at` argument: scales that stop at `at.hem`, a ring on `at.rim`, and
blue dots that blink with `at.frame`. For anything animated the user wants it subtle and
slow: change every second frame at most, a few pixels at a time, blinking in place at
scattered moments rather than moving across the robe. The flame robe that first used
`at` was removed.

`designs/drafts/` holds unapproved one-frame ideas, shown together in `previews/`. They
were only checked on idle frame 0 and have no `paint_free` or item. Pass the full path to
run one (`zoom .claude/skills/robes/designs/drafts/rings_mail.py out.png`), and move it
up into `designs/` once the user picks it. Currently: three first takes on linked red rings on dark blue (`rings_bands`,
`rings_mail`, `rings_hanging`), all with a red ring round the face opening. The user
picked `rings_mail` as the direction but "a bit too much, more minimalist", so
`rings_chest`, `rings_hem` and `rings_trio` cut it down to one row or three rings. `moon`
is the Moon phases idea the user liked: full moon on the back of the hood, a crescent on
each side of the body. A first version with small phase discs down the spine was unreadable.

`pullover_checker`, `pullover_gingham` and `pullover_argyle` are drafts of a warm-coloured
checked pullover the user asked for: plain hood, checked body, ribbed neck band and hem.

The checked pullovers were turned down ("hm no"). The user then gave three reference
images of classic mage robes, drafted as `azure` (bright blue, gold four-dot diamonds, gold
trim, crimson lining), `earth` (moss green under a brown hooded mantle, tan trim, belt)
and `arcane` (deep purple, gold trim and clasps, glowing blue runes at the hem), shown in
`previews/azure_earth_arcane.png`. Working from a reference picture the user supplies
lands better than pitching ideas in words.

The user called `azure` "great" and asked for colourways: `azure_crimson`, `_emerald`,
`_violet`, `_ivory`, `_midnight`, `_coral` (`previews/azure_colours.png`). `feather` follows a
reference of a dark slate, teal-feathered outfit; the user asked for its exact colours, so
every colour is a flat value read from the reference's palette. Two first versions with
feathers over hood and body were "too many feathers, and the colors get too light": a
sparse third version was "you cannot see that those are feathers; copy the shapes rather
than the colors, look at the bottom of the reference". The current one is a feather cape:
plain dark hood, a collar of cyan-tipped feathers, then wide plumes that taper to points
of uneven length. The ragged hem is faked inside the silhouette by painting the gaps
between tips in the outline colour (`"void": 0x030304`) using `at.hem`; that trick works
for any torn, fringed or spiked hem. When a reference is given, match its shapes first.

`designs/drafts/forty.py` holds forty more drafts in one file (a `DESIGNS` dict), shown in
`previews/forty.png`. The user asked for forty ideas that fit the game, all different,
with colours taken from the icon sheets. Address one as `forty.py:name`:

```
python3 .claude/skills/robes/scripts/robe.py sheet /tmp/all.png .claude/skills/robes/designs/drafts/forty.py --cols 4
python3 .claude/skills/robes/scripts/robe.py zoom ".claude/skills/robes/designs/drafts/forty.py:moon" /tmp/z.png
```

`designs/drafts/sixty.py` is a second batch of sixty in the same form (`previews/sixty.png`),
asked for straight after the forty; it imports its helpers from `forty.py`.

`designs/drafts/hundred.py` is a third batch of a hundred (`previews/hundred.png`), asked for
straight after that. It is written as layers: `robe(name, base, doc, *layers, **materials)`,
where each layer is a small function and the first one to claim a pixel wins, with ready
layers such as `rim`, `hem`, `neck`, `hood`, `crown`, `back` (a bitmap), `bdisc`, `bring`,
`bsegs`, `drips`, `grow` and `ragged`. This is the fastest way to write many drafts. A
material cannot be called `name`, `base` or `doc`. Two hundred drafts now exist in these
three files; check them before pitching an idea as new.

`designs/drafts/garments.py` is a fourth batch of a hundred (`previews/garments.png`). The
user asked for "100 more, no icons on them": no pictures, emblems or symbols, only what a
tailor could do with cut, colour, trim, lining, hems and cloth. Its extra layers are the
vocabulary for that: `mantle`, `cape`, `stole`, `sash`, `belt`, `panel`, `collar`, `halves`,
`quarters`, `diagonal`, stripes, `chevron`, `tiers`, `pleats`, `quilt`, `dip`, `fade`, `fur`,
`piping`, `sheen`, `speckle`, `fringe`, `scallop`, `hemkey`. After two hundred motif drafts
this is the direction the user steered to, so default to garment-only ideas unless asked.

`designs/drafts/feathers.py` is thirty feather capes (`previews/feathers.png`), asked for by
name after the garment batch: the feather cape is the look the user keeps returning to. It
is one generator, `cape(name, doc, hood, rows, dark, ...)`, with these knobs: `shape`
(shingle, barred, tipped, downy, small, long, quill, broad, eyed), `cover` (cape, mantle,
collar, tail, hooded), `rows` and `mode` (one colour, cycling rows, or an ombre that clamps),
`lengths` for how ragged the hem is, `glint` and `every`, `fade` into the hood, `crest`,
`robe` for the cloth under a short mantle. `original` reproduces the approved `feather.py`.

`designs/drafts/playful.py` is a hundred playful drafts (`previews/playful.png`): the user asked
for funny and cute ideas and nods to other games. They fall into game references, jokes
about games (missing texture, health bar), animal onesies, food and everyday objects. Two
helpers there do most of the charm: `visage(rows, key, fill, eye)` repaints the face
(masks, visors, skin, big eyes), and `atop(rows, key, ox, lift, mirror, side)` stands small
parts on the hood (ears, sprouts, horns, candles) with an automatic outline. Stamps use
the material `"edge?"` for outline pixels that are only drawn where the frame is empty.
The game references imitate other companies' characters: fine as drafts, a legal question
before shipping, so say so when one is picked.

Thirteen drafts were picked and built in full on request: sandman, kintsugi, wizard_stars,
smoke, rooftops, moth_eaten, mask, sleepwanderer, moon, crystal, dawn, raven and
azure_emerald. Each has a file in `designs/` that adopts the draft from its batch file
(`BASE, MATERIALS, paint = ...`) and adds `ITEM_SLOT` and `paint_item`; slots 0 to 14 are
taken. A design with no `paint_free` now gets a fallback on the curled-up rolling and
sleeping frames: its normal `paint` is stretched over them (back view for the ball, side
view for sleeping), which was good enough for all thirteen.

The robes that survived in-game testing are named plainly: entities `ROBE1` to `ROBE4`, sprite
folders and design files `robe1` to `robe4`. Robe1 "It had no name" (indigo, a No-Face-like
mask on the back of the hood, crescents), Robe2 "Scales of night" (blue-black troll-scale
pattern, blinking blue dots), Robe3 "Moth-eaten" (plain dark torn cloth), Robe4 "Noble garb"
(warm red with stars and moons). Every other built robe was deleted after the user tried
it in game; name new ones `robeN` the same way.

`sheet` is the quickest way to show many drafts: idle frame 0, four directions each. In
zsh, quote `file.py:name` or write `"${F}:name"`; a bare `$F:name` is a history modifier.
The file's helpers are worth reusing: `cloth(dark, mid, light)` builds a shaded ten-step
ramp from three icon colours, `bm` stamps a small text bitmap, `bx` maps a back-view motif
onto the part of the side view that shows the back, `trim` does rim, hem, neck band and
the front opening. Icon-sheet colours that work as cloth: night `1e1a28/252341/2e3b78`,
indigo `2a2438/382c54/4d3274`, ink `1e1a28/25242d/3d3b59`, ivory `8a8277/d4d2b4/fffed2`,
red `522222/964533/ca4d32`, gold accents `f6b745`, `fde452`, pale `fffed2`, `e1ffff`.

The user wants ideas themed on **magic and dreams** (the players are magicians and
dreamers), bold and minimal: two strong colours, one shape, hood involved.

Rejected outright, do not pitch again: owl, moth, hare, beekeeper, shepherd's fleece,
fisher's oilskin, mourner, inside-out cultist, poppy, patchwork. The user asked for no
animal themes for now, and liked the colours of the first rings test (dark blue with
red), asking for the rings to be connected and for the hood to carry part of the design.

## Inventory icon and world texture

Items in Waken take a 48x32 block on an icon sheet: a 16px icon bottom-left and a 32px
world texture to its right. `items` rebuilds `sprites/icons12.png`, one block per design,
by recolouring the hood block at rows 1-2, cols 1-3 of `icons2.png` in the design's own
`BASE` and `MATERIALS`, so the item matches the worn robe.

The item is **only the hood**, and the icons2 hood is used 1:1: same pixels, our colours.
The user chose this after rejecting three drawn shapes (a recoloured Tunic, a wide bell
cloak that "looked fat", a tall cloak). Do not redraw the shape.

```python
ITEM_SLOT = 0                      # block position on icons12.png; never reuse or renumber

def paint_item(kind, x, y, part):  # kind is "texture" (32x32) or "icon" (16x16), local coords
    ...
```

```
python3 .claude/skills/robes/scripts/robe.py items --out /tmp/i.png --preview /tmp/i_z.png
python3 .claude/skills/robes/scripts/robe.py items      # writes icons12.png, prints row and col per robe
```

`part` says which piece of the hood the pixel belongs to: `shell` (the outer cloth),
`rim` (the cloth edge around the opening) or `inside` (the dark lining). Return a material
or None for the base colour. The fox is `"fur"` on the shell and base red on rim and
lining. Materials are drawn one ramp step darker than the base so a ramp that tops out
early (the fur) still shades across the shell.

## Loop

1. `grid` the idle frames you will draw on, `palette` any sprite whose colours you borrow.
2. Write the design, `zoom` idle, read the image, fix. Repeat until each direction reads.
3. `zoom` walking and running on a few frames, then `build --preview` to the scratchpad
   and read rolling, sleeping, casting and one 64px tool sheet. These are where anchoring
   or `paint_free` goes wrong.
4. `build` into the project.

## How robes are wired into the game

Robes are real items now. A robe is an entity in `server/src/configs/entities/cloths.ts`
named `ROBEn`, with `{ name: ComponentName.ROBE, config: { sheet: "robeN" } }` pointing at
its folder under `sprites/robes/`, its hood icon and texture on `icons12`, `stackable:
false`, and its effects in `modifier`. Players have one robe slot of their own, drawn as
the eighth hotbar cell; only the worn robe's effects count. The client loads a robe's
sheets the first time someone wears it. Robes are crafted at the Weaver
(`EntityName.WEAVER` in `people.ts`), never found in the world.

Adding a robe therefore means: design file and `build`, an `ITEM_SLOT` and `items`, the
entity in `cloths.ts` with the icon coordinates `items` prints, and a recipe on the
Weaver. The user decides each robe's name, effects and recipe; do not invent them, and do
not add a robe as an item until asked. For a quick look in game the user has asked for
a bare item (no effects, no recipe) placed in the village row at y 688 and removed later.

The modifier fields a robe can use are in `Modifier` in `server/src/types/entities.ts`:
multipliers (damage, crit damage, defense, speed, health and mana regeneration), flat
`bonus` (health, mana, crit chance, reflect) and `immunities` for "100% resistance".

For plain recolours, a palette-swap shader on the existing sheets is cheaper than 17 more
textures per robe; baked sheets are only needed for motifs. Say so when asked for many
colour variants.
