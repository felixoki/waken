---
name: tiled
description: Read, render and edit Waken's Tiled maps (tiled/*.tmx) from the command line. Inspect layers, tilesets and gids; render a map to PNG to actually look at it; place entities (trees, rocks, bushes, props) as objects with a matching editor-only tile layer so they show in Tiled too; generate terraced mountain terrain (grass, earth and snow levels with cliffs, ledges and stairs); create a new map and wire it up so it is actually reachable in game; read hand-drawn setpieces out of a .tmx as room interiors for a generated biome; copy tilesets between maps; export to the client JSON and verify. Use whenever working on a .tmx map, placing things in a map, building terrain, levels or rooms, authoring a temple or dungeon, or when a map change does not show up in game or in the Tiled editor.
---

# Working on Tiled maps

All map work goes through `scripts/tmx.py` (Python 3 + Pillow). It edits the XML
in place and writes it back byte-identical to how Tiled saves it, so diffs only
show real changes. Run it from the repo root; maps can be named bare
(`mountain` means `tiled/mountain.tmx`).

```sh
T=.claude/skills/tiled/scripts/tmx.py
python3 $T info    mountain                    # tilesets, layers (draw order), object counts, next ids
python3 $T render  mountain out.png --grid     # look at it; then Read the png
python3 $T cell    mountain 40 26              # every layer's gid at one tile
python3 $T gids    mountain grass              # which tiles a layer uses
python3 $T stamp   mountain Tree1              # entity texture as a gid grid + object offset
python3 $T tileset mountain --from village --name village_home
python3 $T scatter mountain --entity Tree1 --on grass --avoid ledges,cliffs --count 10 --dry-run --preview p.png
python3 $T export  village                     # Tiled CLI -> client/public/assets/maps/village.json
python3 $T new     temple --width 64 --height 48 --from dungeon --tilesets dungeon_walls_floor --layers floor,walls
python3 $T setpiece dungeon --group setpiece1  # object group -> a RoomInterior for configs/biomes.ts
npm run verify:maps
```

## Starting a new map

`tmx.py new` writes the .tmx with its export target set, copies the tilesets it
needs from an existing map and creates the tile layers. That is the easy half.
**A new .tmx is invisible until six other things exist**, and nothing warns you
if one is missing:

1. `tiled/<name>.tmx` — `tmx.py new`, then paint it in Tiled.
2. `client/public/assets/maps/<name>.json` — `tmx.py export`. `npm run verify:maps`
   fails for any .tmx without a current export, so this is the one mistake that
   is caught for you.
3. `MapName.<NAME>` in `server/src/types/maps.ts`.
4. An entry in `server/src/configs/maps.ts`: `spawn`, `json`, `isIndoor`,
   `isInstanced`, and **`spritesheets` listing every sheet the map's tilesets and
   entities use**, plus the sheet of anything they drop. A missing sheet makes
   things invisible in game with no error.
5. `client/src/game/scenes/<Name>.ts` — six lines; copy `Herbalist.ts`, which is
   the minimal indoor scene (`Texture.load`, `MapFactory.create`, `TileManager`,
   `setBounds`, `cameraManager.fitZoom()`).
6. The scene added to the list in `client/src/game/config.ts`.
7. A way in: a `ComponentName.TRANSITION` on some entity, with `to`, the landing
   `x`/`y`, and the trigger box (`width`/`height`/`offsetX`/`offsetY`) relative to
   that entity's sprite. `HOUSE1` in `configs/entities/buildings.ts` is the
   example. Add the return transition at the same time or you are stuck in there.

Then `npm run typecheck`, because 3-6 are all typed.

`Map.new(name, w, h)` in the library is the same thing without the tilesets and
layers, which is how `terraces.py` starts a map from nothing.

**Always render before and after.** Coordinates in text are easy to get wrong.
The picture shows what the grass, the cliffs and the existing objects actually
look like. `--grid` labels tile coordinates every 5 tiles, and `--crop x,y,w,h`
zooms in (in tiles).

## How a map reaches the game

- `tiled/<map>.tmx` is exported to `client/public/assets/maps/<map>.json`. The
  target lives in the tmx's `<editorsettings><export target=…>`.
- **Server** (`server/src/loaders/Map.ts`): every object in every object group
  becomes an entity. `obj.name.toUpperCase()` is looked up in `EntityName`, so
  `Tree1` becomes `EntityName.TREE1`. Unknown names are silently skipped.
- **Client** (`client/src/game/factory/Map.ts`): renders **every tile layer
  except ones named `objects`**. Layer properties `collides`, `clearance` and
  `rendersAbove` drive collision and depth. Depth is layer index × 10.
- **Map config** (`server/src/configs/maps.ts`): each map's `spritesheets` must
  load every sheet its entities' `TEXTURE` components use, and the sheet of
  anything they drop. If one is missing, the entity is invisible, with no error.

## Placing entities: object plus editor-only tile stamp

The village convention, which `scatter` automates, has two parts:

1. **An object** in the `objects` object group. This is the real, interactive
   entity (fellable, collidable, sways in the wind).
2. **The same sprite stamped as tiles** into a tile layer **named `objects`**.
   It only exists so the map looks right in the Tiled editor. The client skips
   it by name. **Any other name renders static tiles in game, on top of the
   entities.** The village has three such layers.

Alignment: `Texture` sets origin (0.5, 0.5), so
**object point = stamp top-left px + (w × 8, h × 8)** for a w×h-tile texture.
For `Tree1` (4×5) that is +(32, 40). The village grid-snapped its y values,
which puts its trees 8px higher in game than in Tiled. Use the exact center.

To prove the editor view matches the game, draw one with the tile stamps and
one with entity textures at the object points. They must be pixel-identical:

```sh
python3 $T render m a.png --no-marks --scale 1
python3 $T render m b.png --no-marks --scale 1 --hide '#<objects tile layer id>' --entities
python3 -c "from PIL import Image,ImageChops as C;print(C.difference(Image.open('a.png').convert('RGB'),Image.open('b.png').convert('RGB')).getbbox())"   # None = identical
```

Before stamping, the map needs the entity's spritesheet as a tileset. `stamp`
tells you if it is missing, and `tileset --from <map> --name <sheet>` copies it
(with its per-tile collisions) at the next free firstgid. Then add the same
sheet to the map's `spritesheets` in `maps.ts`. Trees need `village_home`, and
`...icons` too, because felling drops `WOOD` (`icons3`).

## Scatter rules

- `--on grass`: every tile of the footprint must be non-zero on that layer.
  `--on grass=528,591` restricts it to specific gids.
- `--avoid ledges,cliffs,stairs,snow`: the footprint must not touch these.
  `--pad N` grows that check by N tiles. Grass often continues underneath cliff
  faces, so always avoid the collision layers.
- Keeps `--clear-radius` px (default 24) free around every existing object. Add
  `--clear x,y,r` for the map's spawn point from `maps.ts` and for transition
  landing spots.
- Stamps never overlap within one tile layer. `--gap` spaces them further.
  For overlapping canopies, use a second `objects` tile layer. The later
  layer draws on top, so put the lower (front) tree there.
- `--clusters N --spread R` groups placements into groves. Try several
  `--seed`s with `--dry-run --preview` and pick by eye. The printed stamp and
  object coordinates are the ones that will be written.

## Terraced terrain

`scripts/terraces.py` generates a whole mountain — grass at the foot, earth
terraces, snow above — as contours of stacked levels:

```sh
python3 .claude/skills/tiled/scripts/terraces.py large-mountain --force \
  --width 1200 --height 380 --earth 7 --snow 4 --foot 26 --gap 12 \
  --margin 60 --summit 30 --dome 1.25 --stairs 34 --seed 11
```

`tiled/large-mountain.tmx` came from exactly that command. `--force` regenerates
it in place; a different `--seed` gives a different mountain, so render a few and
pick one by eye.

Sizing. Terrace depth comes from `--height` spread over the levels, with `--gap`
only the floor they may not cross: 380 rows over 11 levels leaves plenty, 180
rows over 15 leaves 6 and pins every contour to the floor, which is itself a
cause of parallel-looking levels. `--dome` sets the profile exponent: near 1 is a
cone whose terraces ring the summit and leave the map corners as grass, while 2.5
is a flat-topped mesa that fills the map but bunches every contour at the rim;
1.2-1.5 sits between. `--margin` is the grass border, `--summit` the walkable
rows on top.

**How levels avoid running parallel.** Offsetting each contour from the one
below always reads as one line copied N times, however much noise is added, and
so does splitting a fixed depth between them. The generator instead builds a 2D
elevation field and reads the contours out of it as level crossings, so each
level is whatever shape the terrain cuts at that height: a spur reaches one level
and not the next, a bowl splits another in two.

The field is a **massif of 3-5 summits**, not one cone — a single cone can only
produce nested rings. Summits sit at or above the top edge (see the clamp below),
are spread one per horizontal band so they read as separate, and carry different
heights. On top of that go slow waves for the overall form, fast waves that turn
over within the rows between contours so each level meets a different phase, and
~70 Gaussian spurs and bowls sized to swallow one or two levels each.

Three rules keep it from falling apart, each learned the hard way:

- **Monotone with a minimum descent.** Elevation may never rise going south, or a
  plateau needs a north-facing edge. But a dead-flat bench sitting exactly at a
  level threshold makes the contour jump tens of rows between neighbouring
  columns, which renders as rectangular bites out of the terrain — so the clamp
  also forces a small drop per row.
- **Summits at or above the top edge.** The monotonic clamp shaves off anything
  south of a peak, so a summit placed inside the map loses its own top.
- **Normalise the height afterwards.** Negative relief can shave the tallest
  summit below the top level and lose it entirely; rescaling the field so the
  summit reaches `levels + --summit` rows guarantees it.

Measured on the current map: columns crossing every terrace edge fell from 356 to
106, and a column now crosses anywhere from 2 to 14 edges — the spread
`mountain.tmx` has. Terrace depth ranges 12 to ~110 rows.

Keep the shape noise low-frequency. Wavelengths under ~60 columns, or a
per-column share field that moves every few columns, turn the contours into
seismograph traces rather than terrain.
A gentle `--flank` turns the mountain into a funnel that is widest at the top;
a steep one gives a broad mass with grass wrapping the sides, like the original.

**Before touching cliff tiles, read `references/terrain.md`.** It holds the tile
vocabulary decoded from the hand-built mountain: the per-column rule tables for
earth and snow faces, which tiles carry collision shapes, how stairs cut a hole
in the ledge, and the rule that no plateau may have a northern edge.

## Surface details

Details (grass tufts, pebbles, snow drifts) are **tile objects in an object
group**, not a tile layer — the village pattern:

```xml
<objectgroup id="16" name="ground_grass_details">
 <properties>
  <property name="renders" type="bool" value="true"/>
  <property name="texture" value="ground_grass_details"/>
 </properties>
 <object id="52" gid="4130" x="442.084" y="655.89" width="16" height="16"/>
```

`MapFactory.createStaticLayer` draws each object with a `gid` as an image from
the sheet named by `texture`, at the group's depth. Positions are free, not grid
aligned, and `y` is the **bottom** edge (Tiled's tile-object origin, matched by
`setOrigin(0, 1)`), so a tuft can straddle a tile boundary.

**A detail is not always one tile.** The sheets hold clumps spanning 2x2, 2x3,
even 3x3, and placing their tiles independently tears them apart. You do not have
to write the groups out: connected runs of opaque pixels recover them
(`detail_formations`), and `village.tmx` confirms the result — 400 of its detail
object pairs sit at exactly the offsets those formations imply.
`ground_grass_details` has 135 formations (90 multi-tile), `snow_details` 103.
A formation is placed whole or not at all, so one never straddles a cliff edge.

`terraces.py --details N` (formations per 1000 eligible tiles, default 22, the
village's density) scatters them in patches: `ground_grass_details` rows 1–9
are dirt and pebbles for earth, rows 10–18 grass tufts, and `snow_details` is
snow lumps. Rock and everything touching it is off limits, so nothing decorates a
face. The groups are inserted between the fills and `ledges`, so details draw over
ground and under rock. The village reads as bare ground next to this: 22 is
village density, and the mountain wants an order of magnitude more before the
earth stops looking like flat paint. Around 170 is where it sits.

Formations keep `--detail-gap` tiles clear of each other, and are scattered in
clumps with a wide spread. Without the gap they stack on the same tiles and a
clump reads as one blotch. The gap, not `--details`, is what limits the density
that is actually reachable: at 0 (no two formations sharing a tile) the count
tracks `--details` linearly, while at 1 it saturates at roughly a third of that
however high the density goes. Measure the object count rather than trusting the
number.

Two things to remember: the sheet needs a tileset in the map (the object gids
resolve through it, `Map.add_tileset` makes one for a sheet no map uses yet), and
the map's `spritesheets` in `maps.ts` must load that sheet or the details are
invisible in game with no error.

## Grass patches, trees and rocks

Trees only grow on grass, so a mountain that is earth above the foot has nowhere
to put them. `--patches N` scatters N blobs of grass across the earth terraces on
their own tile layer above `ground` (see the blob set in `references/terrain.md`),
and those count as grass for everything after.

`--foot-trees`, `--trees`, `--reeds`, `--rocks` and `--snow-trees` are then
densities per 1000 tiles of, respectively, the grass at the foot, the terrace
patches, either grass (reeds), earth and snow. The foot and the patches are split because they want different
densities: the meadow below the mountain is where a forest belongs, a patch
caught between two ledges holds a stand of a few trees. Each places both halves of the village convention in one pass: the
entity in the `objects` object group and the same sprite stamped into the tile
layer also named `objects`. Placements come in clusters, the bottom two rows of a
sprite have to be on the right surface and clear of rock, and canopies may overlap
nothing. Trees and rocks come from `village_home`, snowy trees (`Tree6`-`Tree8`)
from `snow_objects`, reeds from `reed`; the generator adds whichever tilesets it
needs. `Map.stamp` reads each footprint out of the TEXTURE component in
`server/src/configs/entities`, so a new entity needs nothing here beyond its
definition. An entity definition's `offset` is applied by the biome spawners but
**not** by the tmx map loader, so a map-placed entity sits exactly at its object
point whatever its `offset` says (`Reed3` has one).

```sh
python3 .claude/skills/tiled/scripts/terraces.py large-mountain --force \
  --width 800 --height 150 --earth 4 --snow 3 --foot 16 --gap 8 --margin 50 \
  --summit 16 --dome 1.25 --rough 0.45 --scarps 6 --cliffs 0 --stairs 16 \
  --details 168 --detail-gap 0 --patches 38 --trees 9 --foot-trees 20 \
  --reeds 10 --rocks 12 --snow-trees 25 --seed 5
```

Terrain is generated before any of this and off the same seed, so changing a
density or a count keeps the mountain identical. An empty `cliffs` layer is left
out entirely (`--cliffs 0`), because a tile layer costs a `Tile` object per cell
whether or not anything is in it.

## Setpieces: hand-authored room interiors for a generated biome

The dungeon and cave biomes generate their rooms, but the **furniture in them is
drawn by hand in Tiled**. `tiled/dungeon.tmx` is not a playable map — it is a
16x16 library of setpieces. Each is a hidden group layer holding an object group
(the real entities, with an `origin` property) and a matching tile layer (the
editor visual, same convention as `objects` elsewhere).

Those object groups are then transcribed into `interior: [...]` on a room template
in `server/src/configs/biomes.ts`, as `RoomInterior` entries whose coordinates are
**relative to a corner of the room, one tile inside the floor**:

```ts
{ origin: RoomInteriorOrigin.TOP_LEFT,
  entities: [{ name: EntityName.WEAPONRACK1, x: 25, y: -4 }, ...] }
```

`RoomGenerator` picks a setpiece per corner and stamps it at whatever size the
room came out. `tmx.py setpiece` does the transcription: it takes the floor
layer's bounds, derives the four anchors, and prints the TS literal ready to
paste. Verified against the committed dungeon interiors, which it reproduces.

A temple biome is this same shape with a different tileset: a `.tmx` of setpieces,
a `BiomeConfig` in `biomes.ts`, and tilesets tagged as below.

**The tmx and `biomes.ts` have already drifted** — a few objects differ by a few
pixels in y, and the chests and animals in the committed interiors were never in
the tmx at all. Treat `biomes.ts` as canonical and the tmx as the drawing, or
re-derive the whole block with `setpiece` and re-add the loot by hand.

## Tilesets carry meaning, and interiors already use it

`client/public/assets/tilesets/<name>.json` are Tiled tileset files whose tiles
carry `role`, `position` and `terrain` properties. The biome generators never
name a tile: they classify a cell's neighbourhood and call
`TilesetLoader.queryOne(name, { role, position, terrain })`. Roles are `fill`,
`border_outer`, `border_inner`, `wall_outer`, `wall_inner`, `ledge_outer`,
`ledge_inner`; positions are the nine compass cells; `width`, `height`,
`anchor_x`, `anchor_y` describe multi-tile pieces.

What is tagged today, in tiles carrying a `role`:
`dungeon_walls_floor` 54, `water_coasts` 24, `village_home` 26,
`cave_water_coasts` 17, `cave_walls_floor` 14,
`dungeon_decorative_cracks_floor` 12, `village_farm_ground_grass` 1.
`dungeon_coasts`, `ground_grass`, `ground_grass_details`, `reed` and
`plants_bushes` have **no tiles at all** in their json, so nothing can query
them yet.

For a generated biome, tagging a new tileset this way is the work — after that
the existing wall, border and ledge generators draw it. For a hand-painted map it
does not matter; Tiled's own terrain brushes are the tool there.

**The outdoor cliff grammar in `references/terrain.md` is hardcoded rather than
tagged, and that was a mistake worth not repeating** — see `plans/mountain.md`.

## Editing safely

- If the user has the map open in Tiled with unsaved edits, their next save
  overwrites yours. Ask them to save first, and to reload afterwards.
- `git status tiled/` before editing. If the tmx already has uncommitted work,
  copy it to the scratchpad as a backup. `git checkout` would throw that work
  away.
- Layer names repeat (`objects` is both a tile layer and an object group). Use
  `#<id>` from `info` whenever a name is ambiguous.
- Per-tile `<objectgroup>`s inside tilesets are collision shapes, not layers.
- Not supported: infinite (chunked) maps, base64 or compressed layer data.
  Every current map is CSV.
- New layers are inserted just above the object group, so in the editor they
  draw over the ground and cliffs.

## Verify before handing back

```sh
python3 $T export <map>     # byte-identical to exporting from the editor
npm run verify:maps         # every tmx has a current export
npm run typecheck           # if maps.ts changed
```

Report what was placed (entity, stamp tile, object px), which layers and
tilesets were added, and any `maps.ts` change, and show the final render.
