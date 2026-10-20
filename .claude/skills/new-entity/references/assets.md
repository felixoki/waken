# Asset pipeline

Conventions recovered from the existing asset set and from the commands that
produced it. Where a number can be measured, measure it rather than assuming.

## Sprites

`client/public/assets/sprites/` holds only art the game loads:

| where | what |
| --- | --- |
| root | only the four category atlases: `items`, `interior`, `nature`, `buildings`. Still textures, animations (`TEXTURE_ANIMATION`), growth stages and connecting pieces all live here |
| `animals/` | `animals.ts` entities and the jumping fish |
| `creatures/` | `creatures.ts` and `villain.ts` entities, the dragon included |
| `people/` | `people.ts` NPCs, the player, and `people/robes/<name>/` |
| `buildings/` | one compact tileset per building interior, built by `npm run tiles` |
| `tiles/` | outdoor compact tilesets and the generation tilesets |
| `effects/` | spell and transform sheets (`tornado`) |
| `collection/` | everything not loaded: source sheets, icon sheets, unused packs. The art library to draw from, never loaded by `maps.ts` |

A `maps.ts` `file` carries the subfolder (`file: "animals/dog_idle.png"`). A
sheet's key matches its file stem. Collection names follow one scheme: a place
then a kind (`_interior` for prop sheets, `_exterior` for outsides,
`_walls_floor`, `_ground`, `_details`), no `village_` prefix. Art that stops being
used moves to `collection/`; `python3 scripts/sheets.py unused` lists strays.

Entity spritesheets are named:

```
<entity>_<state>.png      dog_idle.png
                          bear_slashing.png
```

Every entity sheet bakes its drop shadow into the frames, so names carry no
`_with_shadow` suffix. That suffix was dropped from all files on 2026-09-29.

### Deriving frame size

Never assume. Frame sizes in `maps.ts` range from 16 to 160 and vary per sheet.
Measure the sheet and divide by the frame count from `animations.ts`:

```sh
sips -g pixelWidth -g pixelHeight client/public/assets/sprites/animals/dog_idle.png
```

A horizontal strip of 6 frames at 192x32 is `frameWidth: 32, frameHeight: 32`.
If width divided by frame count is not an integer, the sheet or the frame count
is wrong. Stop and say so rather than guessing.

### Looking at pixel art

At native size a 32x32 sprite is unreadable in a rendered image. Upscale first:

```sh
sips -z 256 256 sprite.png --out /tmp/big.png    # -z is height then width
```

Use nearest-neighbour reasoning when judging it. Any blur is the upscaler, not
the source art.

## Audio

Sounds live in `client/public/assets/sounds/<category>/`, where the categories
are `ambience`, `animals`, `creatures`, `footsteps`, `misc`, `music`, `spells`.

The project standard is **Opus in an ogg container at 160k**:

```sh
ffmpeg -v error -i input.mp3 -c:a libopus -b:a 160k -y output.ogg
```

Delete the source mp3 once converted. The repo keeps ogg only.

### Variants

Repeated sounds use numbered takes so playback can vary:

```
dog_idle1.ogg  dog_idle2.ogg  dog_idle3.ogg  dog_idle4.ogg
```

registered in `server/src/configs/sounds.ts` as a `variants` array of basenames
without extension. The basenames must match the files exactly. This is a runtime
failure, not a compile-time one.

### Checking a conversion did not damage the audio

Decode both to raw mono and compare rather than trusting the encoder:

```sh
ffmpeg -v error -i original.mp3 -f f32le -ac 1 -ar 22050 /tmp/a.raw -y
ffmpeg -v error -i converted.ogg -f f32le -ac 1 -ar 22050 /tmp/b.raw -y
```

Then compare sample statistics. Length should match to within a frame; gross
amplitude differences mean the encode went wrong.
