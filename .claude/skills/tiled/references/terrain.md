# Cliff and terrace tiles

Read off `tiled/mountain.tmx`, which was drawn by hand. The rules below regenerate
its shapes exactly. Tiles are written `(row, col)`, 1-based, as the Tiled tileset
view counts them. `f` is `forest_ground_grass`, `m` is `mountains_ground`,
`s` is `stairs_grass`.

## The model

A **level** is the region north of its contour. In this view only south-facing
edges show a rock face, so **no plateau may have a northern edge** — every level
runs off the top of the map. A contour is therefore a per-column function
`top(x)`: the level occupies rows `< top(x)`, and its face occupies
`top(x)` (the rim) and `top(x)+1` (the base).

Faces are 2 tiles tall on the `ledges` layer (`clearance: 20`, jumpable both ways)
or 4 tiles tall on the `cliffs` layer (`collides` with no clearance, a hard wall:
rim, two `f4,5` fills, base). Collision comes from per-tile shapes in the tileset:
a 10px band across the top of every rim tile, a 10px vertical band on side and
crack tiles, and nothing at all on base and lip tiles. Keep bands at 10px or
wider so a 20px/frame dash cannot tunnel through.

## Contour moves

Three moves have tiles: **flat runs**, **45° diagonals** (one column across, one
row up) and **vertical risers** of any height, which are the crack walls below.
Risers are what let a flank climb faster than 45°, and a mountain needs that: a
contour 150 rows down can only reach the top of the map within 150 columns on
diagonals alone, which is why a gradual flank turns the silhouette into a funnel.

Give each riser a **tread** of 2–3 flat columns before the next one. Riser then
tread makes the chunky staircase the hand-built map has; back-to-back risers
make a dotted line of one-tile rock nubs with long cracks between them.

**Snow has no 2-row step.** It has a 45° piece and a wall piece, and nothing in
between, so a step of exactly 2 places the wall's corner with no wall under it
and the slope reads as a dashed line. Snow contours must move by 0, 1, or 3+
rows per column; `terraces.py` runs a `despike` pass to enforce it. Earth is
fine at 2 — the end cap lands directly below the base row.

A one-column pit (`top` higher on both sides) has **no tile** in either set. A
one-column bump has none on the snow side. Smooth both away before placing tiles.

## Earth faces (forest_ground_grass)

Per column, with `t = top(x)`, `tl = top(x-1)`, `tr = top(x+1)`:

| case | rim at `t` | base at `t+1` | extra at `t+2` |
| --- | --- | --- | --- |
| flat | `f6,5` | base-mid | — |
| `tl == t+1` (rises to the right) | `f6,2` | junction-left | cap-right base |
| `tr == t+1` (rises to the left) | `f6,3` | junction-right | cap-left base |

The `t+2` tile is the end cap of the *neighbour's* face, whose rim row merges
into this column's base row — that merged tile is the junction.

| lower material | base-mid | junction-left | junction-right | cap-right base | cap-left base |
| --- | --- | --- | --- | --- | --- |
| grass | `f7,15` | `f15,12` | `f15,13` | `f7,16` | `f7,14` |
| earth | `f10,5` | `f12,5` | `f7,8` | `f10,6` | `f10,4` |

Rim end caps, for steps of 2 or more rows: `f6,4` (left), `f6,6` (right).
Grass fills from row `t+1` down — under the base row, not under the rim.

## Snow faces (mountains_ground)

The snow set has explicit diagonal pieces instead of junctions. Three tiles per
column, at `t-1`, `t`, `t+1`:

| case | over earth | over snow |
| --- | --- | --- |
| flat (2 tiles, at `t`, `t+1`) | `m6,4` `m7,4` | `m12,4` `m13,4` |
| `tr == t-1` (face rises to the right) | `m5,16` `m6,16` `m7,16` | `m11,16` `m12,16` `m13,16` |
| `tl == t-1` (face rises to the left) | `m5,17` `m6,17` `m7,17` | `m11,17` `m12,17` `m13,17` |

Snow fill is `m5,4`. Over earth, the fill stops **below** the diagonal piece at
`t-1`, because that piece already contains its own snow; over snow, the fill runs
underneath everything. Horizontal ends of a snow shelf are `m6,3`/`m7,3` (left)
and `m6,5`/`m7,5` (right).

## Vertical edges (risers of 2+ rows)

**Earth.** A thin crack drawn in the **lower** cell beside the higher one:
`f21,4` (opaque on its left half) when the high side is west, `f21,2` (opaque
right) when it is east. Verified against the hand-built map: the crack column is
the grass one, so the line sits on the boundary between the two columns.

Per column, with `t = top(x)` and a neighbour `n` more than one row further
south, the same column carries all three parts:

| rows | tile |
| --- | --- |
| `t`, `t+1` | its own rim and, as the base, `f7,2`/`f13,12` (west high) or `f7,3`/`f13,13` (east high) |
| `t+2` … `n-1` | the crack, `f21,4` or `f21,2` |
| `n`, `n+1` | the neighbour face's end cap: `f6,6` + cap-right base, or `f6,4` + cap-left base |

When `n == t+1` the cap's rim row lands on the base row and becomes the junction
tile instead — which is why flat, diagonal and riser all fall out of one rule.

**Snow** puts the edge in *two* columns: the edge tile in the snow column and a
shadow beside it. West wall `m16,10` + `m16,9`, east wall `m16,11` + `m16,12`;
over snow, `m10,11` + `m10,10` and `m10,12` + `m10,13`. At the foot of the wall
the snow column takes a corner (`m6,3`/`m7,3` west, `m6,5`/`m7,5` east; `m12,*`
/`m13,*` over snow) and the shadow column takes `m6,2`/`m6,6` (`m12,2`/`m12,6`)
on the rim row only — no lip. Leave the snow fill out under the snow column's
wall tiles; they carry their own.

**Turns.** The first row of a snow wall is a **corner**, not a straight piece:
`m6,7` where the wall faces right (`m10,12`, `m16,11`), `m6,8` where it faces left
(`m10,11`, `m16,10`). A straight piece there leaves a squared-off notch at every
point where a border stops running along and turns to go down — easy to miss at
map zoom and obvious at 1:1.

**Collision to add.** The hand-built map never needed a west-facing wall, so two
tiles ship with no shape: `f21,2` wants `(6, 0, 10, 16)` and `m16,10` wants
`(0, 0, 10, 16)`, mirroring `f21,4` and `m16,11`. `terraces.py` adds both with
`Map.add_tile_collision`. Check for this whenever you use a tile the original
map does not.

A barrier therefore reads as vertical crack runs joined to horizontal rim runs,
with the base lip row deliberately uncollidable — do not "fix" that gap.

## Grass over earth

Rows 25-27, columns 2-4 of `forest_ground_grass` are a 3x3 grass blob drawn over
**transparency**, and rows 25-26 columns 5-6 are its four inner corners, each a
full tile with the notch in one corner: `f25,5` bottom-right, `f25,6` bottom-left,
`f26,5` top-right, `f26,6` top-left. `f26,3` is the centre fill, which is the same
tile the foot of the mountain is drawn with. Rows 28-30 repeat the set in a second
shade.

Because the edges are transparent, a patch of grass goes on **its own tile layer
above the earth fill** and the earth shows through the fringe. There is no 1-wide
piece, so a patch has to be at least two tiles across everywhere: a single column
of them draws as half a tile of grass hanging in the earth with nothing either
side. `terraces.py` grows blobs, fills the gaps where two of them overlap, drops
anything under 14 tiles, and erodes whatever is one tile wide.

**Every pass that only removes cells has to be followed by another erode.** Filling
a hole and dropping a patch both leave necks one tile wide behind them, and an
erode that stops after a fixed number of rounds leaves whatever the last round
created. Erode until nothing changes, and erode last.

## Stairs

A 2 wide × 3 tall block on the `stairs` layer, and **the ledge tiles underneath
must be deleted** — that hole in the collision is what makes the stairs walkable.
Rows top to bottom: `s7,6 s7,7` / `s5,6 s5,7` / `s6,6 s6,7`. Place them only on a
flat run several columns wide.

## Layer properties a generated map must carry

- `ledges`: `clearance: 20` and `collides: true`.
- `cliffs` (4-tall faces): `collides: true`, no clearance.
- `snow`: `surface: "snow"`. `SurfaceManager` builds its footstep grid by
  scanning layers for a `surface` property, so a snow layer without it is
  silently silent. Check `SurfaceName` for the current list before generating.

## Cost

Two things scale with map size, and both bite before rendering does.

**Physics.** `MapFactory.createCollisions` builds one static body plus two
colliders for every colliding tile. `tiled/large-mountain.tmx` at 1200×380 is
**10,712** rectangles, against the village's 887. Merging runs before creating
bodies — horizontally for the wide rim bands, vertically for the tall crack
bands — roughly halves it. Colliding against the tilemap layer itself, which
Phaser indexes spatially, and keeping the clearance test in the process
callback, is the real fix.

**Memory.** Phaser allocates a `Tile` object per cell per layer, including empty
cells (`ParseTileLayers` constructs `new Tile(..., -1, ...)` for gaps). Four tile
layers at 1200×380 is **1,824,000** Tile objects before anything is drawn, and a
6.3 MB JSON to parse. Earth and grass already share one `ground` layer, since
both are opaque and never overlap; `snow` has to stay separate because
`SurfaceManager` finds it by its `surface` property.

Both scale with area, so agree the size against these two numbers before
generating a big one, not after.
