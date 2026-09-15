# Asset pipeline

Conventions recovered from the existing asset set and from the commands that
produced it. Where a number can be measured, measure it rather than assuming.

## Sprites

Entity spritesheets live in `client/public/assets/sprites/` and are named:

```
<entity>_<state>_with_shadow.png      dog_idle_with_shadow.png
                                      bear_slashing_with_shadow.png
```

116 of the 237 files carry the `_with_shadow` suffix. It marks sheets that bake
the drop shadow into the frames, which is every entity sheet. Files without it
are tilesets, UI and effects.

### Deriving frame size

Never assume. Frame sizes in `maps.ts` range from 16 to 160 and vary per sheet.
Measure the sheet and divide by the frame count from `animations.ts`:

```sh
sips -g pixelWidth -g pixelHeight client/public/assets/sprites/dog_idle_with_shadow.png
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
