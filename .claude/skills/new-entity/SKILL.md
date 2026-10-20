---
name: new-entity
description: Add a new entity to Waken (animal, person, creature, crop, resource, rock, flora, building, food, equipment). Registers it across the EntityName and SoundName enums, the entity definition, animation timings, spritesheet loading in maps.ts, sound variants, sprite and audio assets, and Tiled placement. Use whenever adding a new creature, NPC, animal, crop, item, or placeable thing to the game, or when an entity was added but does not appear, animate, or make sound.
---

# Adding an entity

An entity is a plain config object. Differentiation comes from components, states,
effects and behaviors, never from subclassing. Adding one is not hard, but it spans
about ten files, and three of the steps fail silently at runtime rather than at
compile time.

## Derive the pattern first, do not trust this file's details

File layout and pool names change. Before editing anything, find the most recent
entity of the same category and mirror it exactly:

```sh
git log --oneline -12 -- server/src/configs/entities/
git show --stat <commit>          # every file that entity touched
git show <commit> -U0 | grep -i <entity-name>
```

Recent full examples worth copying: the dog (a roaming animal) and the tanner
(an interior-only NPC). They differ in one important way, covered under
"Shared pool or map-local" below.

## Touchpoints

Work through these in order. Paths are stable, line numbers are not.

1. **`server/src/types/entities.ts`** — add to the `EntityName` enum.
2. **`server/src/types/sounds.ts`** — add to `SoundName` if it makes noise.
3. **`server/src/configs/entities/<category>.ts`** — the `EntityDefinition`:
   `facing`, `maxHealth`, `components`, `states`, and where relevant `attacks`,
   `behaviors`, `weight`. Copy the closest existing entity and change what differs.
4. **`server/src/configs/animations.ts`** — per state, `frameCount`, `frameRate`,
   `repeat`. Only the states listed in the definition.
5. **`server/src/configs/maps.ts`** — the `Spritesheet` entry: `key`, `file`,
   `frameWidth`, `frameHeight`. See the judgment call below.
6. **`server/src/configs/sounds.ts`** — the `SoundName` entry. Multi-take sounds
   use a `variants` array of file basenames.
7. **`server/src/configs/needs.ts`** — if the entity is an item a player can
   hold (anything pickable: a resource, drop, food, drink, plant, cloth), add it
   to the `items` of the matching need. That list is what the economy tabs show,
   so an item left out never appears there: ores, hides and other materials go
   under `NeedName.RESOURCES`, flowers and herbs under `NeedName.PLANTS`. Always
   do this in the same change that creates the entity.
8. **Sprites** into `client/public/assets/sprites/animals/`, `creatures/` or `people/`
   (see `references/assets.md`); the `maps.ts` `file` includes that folder.
9. **Audio** into `client/public/assets/sounds/<category>/`.
10. **Tiled** — place an object in the relevant `tiled/*.tmx`, then export from
    Tiled (File then Export As, or Ctrl+E to repeat the recorded target).

For asset conversion, naming and frame sizes see `references/assets.md`.

## The judgment call: shared pool or map-local

`maps.ts` holds shared `Spritesheet[]` pools that maps compose with spread
(`...animals`, `...citizens`), and each map also has its own `spritesheets` array.
Find the current pools with:

```sh
grep -n 'Spritesheet\[\] = \[' server/src/configs/maps.ts
```

- **Appears on several maps or roams the world** goes in the shared pool.
  The dog went into the `animals` pool.
- **Lives in exactly one interior** goes in that map's own `spritesheets` array.
  The tanner went into the blacksmith house only.

Both mistakes are quiet. Shared when it should be local makes every map load a
texture it never draws, costing load time and memory. Local when it should be
shared shows a missing texture on any other map the entity appears on, and you
only find it by walking there.

## The naming contract nothing enforces

```
maps.ts key "dog-idle"  <->  EntityName.DOG + StateName.IDLE  <->  states: [] in the definition
```

The spritesheet key is the entity name and state name joined with a hyphen.
Break any leg of this and it fails at runtime with no type error. `tsc` cannot
see it. Check the key by hand against the enum values.

## Icon and texture coordinates are 1-indexed

An item has two references into an icon sheet: `metadata.icon` (`row`, `col`)
for the UI, and a `TEXTURE` component (`tiles: [{ row, start, end }]`) for the
world sprite. Both are **1-indexed**: `Icon.tsx` and `Texture.ts` subtract 1.
Pixel tools, `tmx.py render --grid` and Pillow crops count from 0, so convert
before writing the config.

The icon sheets put the world texture next to its icon: a 2×2 block in the two
columns to the right, whose bottom row is the icon's row. For an icon at col
`c`, row `r` the texture is cols `c+1`–`c+2`, rows `r-1`–`r`:

```ts
icon: { spritesheet: "icons3", row: 10, col: 13 },
tiles: [
  { row: 9, start: 14, end: 15 },
  { row: 10, start: 14, end: 15 },
],
```

The ibex horn, azurite and wolf fang all follow this. When the user names an
icon position, take it as 1-indexed and render the cells to confirm.

## Category sheets: textures, icons and shadows

Every textured entity, animated (`TEXTURE_ANIMATION`), growing (`GROWABLE`) and
connecting (`CONNECTABLE`) ones included, lives on one of four tile-grid sheets in
`client/public/assets/sprites/`, grouped by kind (all barrels, all trees, ...):

| sheet | holds |
| --- | --- |
| `items` | anything with an icon-sheet texture: drops, tools, food, seeds, resources; plus loose UI icons |
| `interior` | `configs/entities/interior.ts` |
| `nature` | flora, rocks, crop plants, gathering plants |
| `buildings` | buildings, and textured entities in `transitions.ts` (well, ladders) |

An item's icon sits left of its texture's bottom row, the same convention as the
icon sheets. All four load on every map through the `entities` pool in `maps.ts`,
so a still-textured entity needs no `maps.ts` entry of its own.

To add one, write its `TEXTURE` (and `metadata.icon`) against whatever source
sheet the art is on, then:

```sh
npm run sheets          # moves it onto its category sheet, bakes its shadow, rewrites the config
                        # (animations are laid out vertically and wrap into columns past 24 rows)
npm run verify:sheets   # fails while any entity still points outside its category sheet
python3 scripts/sheets.py preview <sheet> out.png   # labelled view; Read it
python3 scripts/sheets.py unused   # sheet loads and files nothing references any more
```

Placement is stable: entities already on a sheet keep their tiles, new ones go in
free space in their group's rows. Groups come from `PATTERNS` and `GROUPS` in the
script. The source sheets (`icons*`, `gathering*`, ...) live in `sprites/collection/` as
the art library to draw from; the game never loads from there.

**Ground shadows are baked, never painted by hand.** A sprite gets the house
shadow (its silhouette shifted 1px right, 2px down, `(42,40,61)` at alpha 100)
when it has no painted shadow and its solid art is at most 32px tall. Trees, big
rocks and buildings are left alone, and so is anything `flat`. `NO_SHADOW` opts out.

Textures built by a helper function (the spell pages, the trophies) are not
moved; edit those by hand.

## Collision bodies and draw order

Draw order follows the sprite centre (`entity.y`), so a body has to straddle it.
The player's body runs from 4px above its centre to 8px below it, so for a prop:

- its body's bottom edge must sit below `centre - 4`, or a player blocked from
  below can stop while still drawn behind it;
- its body's top edge must sit above `centre + 8`, or a player blocked from above
  can stop while already drawn in front.

`barrels1` (32x10 at 8,20 on a 48px sprite) is the reference. Get the numbers from
the pixels:

```sh
python3 scripts/bodies.py fit <entity>   # suggested body next to the current one
python3 scripts/bodies.py audit out.png  # every entity's body against its art; Read the sheet
```

A non-colliding body (`collides: false`) is still read: bounce and trap fire on
its overlap, and a moving entity's light shadow sits at its bottom edge. Fit it
under the lower half of the art, never leave the 16x16 at 0,0 placeholder. Floor
props a player could walk into (bowls, chairs, sacks) get a colliding body;
flat, wall-mounted and table-top props do not.

Two entities may share a TEXTURE `key` only if their art is identical: textures
are composed once per key, so the second one silently shows the first one's sprite.

## Silent failures to check for

| Symptom | Almost always |
| --- | --- |
| Entity spawns invisible | missing or misnamed `Spritesheet` entry in `maps.ts` |
| Entity visible but frozen | missing entry in `animations.ts`, or a state in the definition with no animation |
| Wrong or garbled animation | `frameWidth`/`frameHeight` do not match the sheet |
| Silent entity | `SoundName` enum added but no entry in `sounds.ts`, or variant basenames do not match the files |
| Not in the world | Tiled object placed but the map never re-exported |
| Item missing from the economy tab | not listed under a need in `needs.ts` |
| Item icon or world sprite shows the wrong tile, or nothing | `icon`/`tiles` written 0-indexed instead of 1-indexed |
| Player draws behind a prop while standing in front of it, or the reverse | body does not straddle the sprite centre (run `bodies.py fit`) |
| An item shows another item's sprite | two entities share a TEXTURE `key` with different art |

## Verify before handing back

```sh
npm run typecheck     # catches the enum and config half
npm run verify:maps   # catches the un-exported Tiled half
```

Neither catches the naming contract or the pool choice. Say explicitly which pool
you chose and why, and list the spritesheet keys you added, so they can be eyeballed.
