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
7. **Sprites** into `client/public/assets/sprites/`.
8. **Audio** into `client/public/assets/sounds/<category>/`.
9. **Tiled** — place an object in the relevant `tiled/*.tmx`, then export from
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

## Silent failures to check for

| Symptom | Almost always |
| --- | --- |
| Entity spawns invisible | missing or misnamed `Spritesheet` entry in `maps.ts` |
| Entity visible but frozen | missing entry in `animations.ts`, or a state in the definition with no animation |
| Wrong or garbled animation | `frameWidth`/`frameHeight` do not match the sheet |
| Silent entity | `SoundName` enum added but no entry in `sounds.ts`, or variant basenames do not match the files |
| Not in the world | Tiled object placed but the map never re-exported |

## Verify before handing back

```sh
npm run typecheck     # catches the enum and config half
npm run verify:maps   # catches the un-exported Tiled half
```

Neither catches the naming contract or the pool choice. Say explicitly which pool
you chose and why, and list the spritesheet keys you added, so they can be eyeballed.
