---
name: create-biome
description: Create a new outdoor biome for Waken (swamp, heath, coast, meadow, ...). Starts as a small hand-editable .tmx seeded with creeks, ground and grass that Felix refines in Tiled, before any generator or BiomeConfig work; then covers making the map reachable, and later turning it into a generated biome stacked onto the forest with an unlock tier, sites, spawn rules and biome-specific dungeon rooms. Use whenever the user wants a new biome or region, asks to sketch or block out one in Tiled, or wants an existing hand-made biome map wired into generation.
---

# Creating a biome

A biome starts as a **drawing, not a generator**. Seed a small `.tmx` with the
terrain the biome is about, let Felix shape it in Tiled, and only move to a
`BiomeConfig` once the look is settled and he asks for it. The map stays small
(around 80x60) so it is quick to edit by hand.

Load the `tiled` skill alongside this one: it owns rendering, exporting,
stamping entities and the steps that make a new map reachable.

Pillow is needed for every script here. If `python3` says `No module named
'PIL'`, use one that has it (`/usr/bin/python3` on Felix's machine).

## 1. Seed the map

```sh
/usr/bin/python3 .claude/skills/create-biome/scripts/creeks.py swamp --style marsh --ring 0 1 --seed 1
```

`creeks.py` writes `tiled/<map>.tmx` with water, a ground shore around it and
grass beyond. Two styles:

- **`marsh`** (the swamp): many short winding creeks packed close, a thin
  strip of land between them, and some neighbours joined by necks too narrow
  for open water, so they read as wet shallows: connected, but only just.
  `--water` is the share of the map to fill, `--length` and `--radius` the
  creek size, `--spacing` the least land between creeks, `--bend`/`--pace`
  the meander, `--links`/`--neck`/`--gap` the shallow necks. Keep `--ring`
  at 0 1: the shoreline already shows bed inside every creek, and a ground
  ring on top reads as too much shore. Wider creeks (radius 3.4-4.2) leave more
  open water per tile of edge.
- **`creeks`**: a few long rivers from the north edge with branches, pools on
  them and ponds (`--creeks`, `--branches`, `--pools`, `--ponds`,
  `--width-tiles`).

Shared: `--ring MIN MAX` ground shore width, `--bed` lakebed reach, `--seed`.

A swamp is many small creeks, not rivers. Open water still has to be about 6
tiles across (see the shoreline note below), so "small" means short and
loosely joined, never narrow.

Render several seeds side by side and pick by eye before writing the final one
(`tmx.py render <map> out.png --scale 1 --no-marks`). Tiled shows every painted
water tile as blue, so also judge what the shoreline leaves open: `sim.py` in
this skill's scripts approximates the shader (blue open water, tan exposed
bed) and prints the open share. The script refuses to
overwrite an existing map unless `--force` is given. **Never pass `--force` on a
map Felix has opened and edited**: patch the cells he asks about instead.

The script guarantees what hand editing would otherwise have to fix:

- No water or land strip is 1 tile wide. Water is eroded, then any 1-wide land
  spur becomes water, looping until both are stable. Land pieces under
  `--least-land` tiles are flooded.
- Grass never needs a piece the blob set lacks. It is at least 2 wide, no cell
  needs two inner corners, and patches under `--least-grass` tiles are dropped.
- The map edge counts as more of the same, so nothing draws a border against it.

## 2. The layer stack

It is the same stack the water generator writes (`server/src/biomes/builders/Map.ts`
and `generators/Water.ts`), so the client treats a hand-made map exactly like a
generated one:

| layer | props | content |
|---|---|---|
| `beach` | `beach` | ground fill (`grass_ground` 105) under every water cell and on land within `--bed` (4-way steps) of it, exactly as `Water.bed()` does with `WATER_BED_REACH`. The shader reads it as the lakebed. |
| `water` | `water` | `water_coasts` 207 on every water cell. The shader draws the water; the tile is only a mask. |
| `ground` | | ground fill on land not covered by `beach` |
| `grass` | `meadow`, `surface: grass` | grass fill (33) |
| `grass_ground_border` | `meadow`, `meadowEdge` | grass edges and inner corners |
| `objects` (tile) | | editor-only stamps, skipped by the client |
| `objects` (group) | | real entities |

Grass over ground uses the tagged blob in `grass_ground` (`over: ground`):
outer edges 8 9 10 / 32 _ 34 / 56 57 58, fill 33, and inner corners by the
missing diagonal: bottom-right 11, bottom-left 12, top-right 35, top-left 36.
Tags are listed in `client/public/assets/tilesets/grass_ground.json`.

**The map follows the water pipeline, never the other way round.** Do not
change shaders, `globals.ts` or `handlers/water.ts` for a biome map, and do not
leave the lakebed out to make water show: without it the shader skips the
shoreline and the edges render as raw tile steps.

Water narrower than about 6 tiles reads as mostly exposed bed in game while
Tiled shows it blue. Over the bed, the shore value is distance / `BEACH_REACH`
(3), blurred, and everything under `BEACH_EDGE` (0.5) draws as bed. The
generator's rivers are `WATER_RIVER_WIDTH` 4-11 wide, so only their sources are
that thin. If water has to show as open water, make it wide enough rather than
removing the bed.

Paint further edits in Tiled with the same tiles, and paint `beach` under any
new water.

## 3. Export and wire it up as a test scene

Every new biome map goes in game straight away as a test scene, in the same
pass that creates the tmx. Do not leave it as a sketch:

1. Add the map to `MAPS` in `scripts/tiles.py`, and a `RULES` entry for any new
   collection sheet, then build the compact sheets and export:

   ```sh
   /usr/bin/python3 scripts/tiles.py build          # compact sheets + export
   npm run verify:maps
   /usr/bin/python3 scripts/tiles.py verify
   ```

2. Follow "Starting a new map" in the `tiled` skill: `MapName`, the
   `configs/maps.ts` entry with **every** compact sheet the map draws
   (`asTileset: true`), the scene, and both scene lists (`config.ts` and the
   `scenes` list in `Main.ts`).

3. Before registering, check that `client/public/assets/maps/<map>.json` and every
   `tiles/<sheet>.png` in its `spritesheets` exist. Main waits for every scene in
   its list, so one missing file stops the whole game from starting. Check again
   after any `tiles.py` reset or rebuild.

4. A way in: a transition, or whatever Felix uses to reach test maps. Ask if
   there is none.

## 4. Grass and water that belong to the biome

Grass colour is not in the tiles: the meadow shader paints every `meadow` layer
from `MEADOW_PALETTES`. A biome's own grass is a **grade** in `MEADOW_GRADES`
(`server/src/globals.ts`): saturation, an RGB tint and brightness, applied to
everything the meadow shader draws (fill pattern, blades, accents and the
fringe of edge tiles), so edges and fill always shift together.
The same mask grades the water: `WATER_GRADES` holds the water's grade under
the same name, applied to open water, the wet shore film and foam. Depth,
shoreline and flow are untouched, and a map without a grade layer renders
exactly as before.

Where it applies comes from a tile layer with the string property
`meadowGrade: <grade>` (`swamp_grade` in `swamp.tmx`). Any tile counts; the
layer is hidden in game and drawn at 0.35 opacity in Tiled so it can be
repainted. `meadow.blend()` blurs it (`MEADOW_GRADE_BLUR` x
`MEADOW_GRADE_PASSES`, about 15 tiles of fade), so a ragged edge becomes a soft
transition. That is how a biome meets the forest without a seam: leave the band
that touches the forest unpainted.

Preview a grade before changing it: grade grass pixels of an in-game screenshot
with the same formula (`mix(luma, c, saturation) * tint * brightness`) faded
across the image.

Grades listed in `FOG_GRADES` also get ground fog: one shader quad over the map
(`handlers/fog.ts`, `frags/fog.ts`) at `FOG_DEPTH`, under entities, weighted by
the same mask so it thins out towards the forest. `FOG_ALPHA` is the one knob
for strength; Felix wants it subtle, so raise it in small steps.

## 5. Dressing it

Props come later and one layer at a time, as Felix asks. Reeds always grow in
beds, never alone: follow `Water.ts` (7-12 cattails and sedges at 3:2 per bed,
packed within about a tile of the seed, in water 1-3 tiles from land, one bed per
24 tiles of shoreline). Colour-correct any standard art placed in a graded area
with the same grade, as `TREE15`-`TREE18` are for the swamp. Biome art lives in
`client/public/assets/sprites/collection/` (`swamp_exterior.png` holds the
swamp's trees, dead trees, mushrooms, reeds and mossy rocks). An entity needs
the `new-entity` skill before it can be placed. Stamp it with `tmx.py scatter`.
Felix composes setpieces himself, so propose and let him place where he wants.

## 6. Later: a generated biome

Only once Felix asks. The pieces, in the order the code needs them:

1. `BiomeName.<NAME>` in `server/src/types/generation.ts`.
2. A `BiomeConfig` in `server/src/configs/biomes.ts`: generator, noise, terrain,
   layers, borders, `objects` (spawn rules), `details`, `sites`. Spawn rules take
   `near: { terrain, within }` for things that grow by water, and `requires`
   for an unlock tier.
3. Register it in the `biomes` record in `server/src/biomes/index.ts`.
4. Slot it into a level in `server/src/configs/levels.ts`. Biomes in one level
   stack **north to south in list order** and must share width and tile size.
   A biome south of the forest goes after it; give it `requires` for its tier.
5. Dungeon-like rooms that only appear when entered from this biome take
   `origin: BiomeName.<NAME>` on the room template (see the mountain cave rooms).
   Entrances are `sites` with `requires`, or `configs/entrances.ts` for ones
   every biome shares.
6. Preview with `npm run generate:biome forest,<name> <seed> --out=<preview>`,
   which writes a `.tmx` you can render.

The hand-drawn `.tmx` from step 1 is the reference the config is tuned against:
render both and compare.
