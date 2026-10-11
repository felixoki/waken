---
name: spell-vfx
description: Build or refine a spell visual effect for Waken from a reference image, using a fragment shader on a world-space quad plus particles, iterated side by side against the reference. Use when the user wants a new spell effect, links concept art or a clip and says "like this", asks to get an existing spell (Dark wave, Hypnic jerk, Sunder, the unused fire bomb and water effects) closer to a reference, or wants a spell's look changed. Covers reading the reference, the offline render loop, wiring into quads.ts and the spell handler, and registering a new spell.
---

# Spell VFX from a reference

Waken's shader spells are a fragment shader drawn on a pooled world-space quad, driven by a
tween that sets uniforms, with a few particles on top. The user supplies a reference image
and expects a close match that animates through its whole life.

The loop that works is: **read the reference closely, render offline, put mine beside the
reference, name the gaps, fix the largest, repeat.** One spell at a time. Skipping the
side-by-side is what produced every rejected version.

## What the user wants

- **Follow the reference per spell.** There is no single house style: Hypnic jerk is a
  painterly violet burst, Dark wave is a dark teal crescent, Sunder is hairline cracks.
- **Subtle over loud.** The recurring note is "too bright", "too colourful", "too perfect".
  Start muted. Nothing should hit you in the face.
- **Smooth, never pixelated.** Continuous `fragCoord`, smoothstep edges, alpha fades. No
  grid snapping, no posterised bands, no ordered dithering.
- **Imperfect shapes.** No compass-drawn circles or ruler lines. Rings wander, vary in
  thickness, break and vary in colour along their length. Cracks have gaps and splinters.
- **Colour variation inside every shape.** A single flat colour reads as cheap. Layer
  several slightly different hues.
- **Shaders and particles only.** Do not cut up or reuse the reference artwork itself.
- **Small particles.** A few tiny ones. Big soft round particles were called cheap.

## Know the limits before promising

Shaders are good at **light, fluid and ground effects**: waves, rings, cracks, smoke,
glow, fire, beams. They are bad at **figures**: hands, creatures, skeletons and birds all
came out stylised and were dropped. If the reference depends on a drawn figure, say so up
front and suggest a sprite for the figure with the shader doing the light around it.

Hard-edged solid objects (ice crystals) were also rejected after several tries.

## Steps

1. **Fetch and read the reference.** `curl` the image with a browser user agent into the
   scratchpad (ArtStation pages 403, but their `cdn*.artstation.com` image URLs work).
   Crop and enlarge each phase and Read the crops. For a video use
   `ffmpeg -vf "fps=30,crop=...,tile=6x5"` to make contact sheets.
   Write down, per phase: shapes, proportions against the caster, the colour of each
   layer, what is bright and what is dark, what is sharp and what is soft.
2. **Split into phases and layers.** Most references are charge, burst, aftermath. Decide
   which parts sit on the ground (under entities) and which stand up (over them).
3. **Write the fragment shader** in `client/src/game/pipelines/frags/<name>.ts`.
   See "Shader conventions".
4. **Render offline and compare.** See "Render loop". Build a side-by-side image with the
   reference at the same scale and Read it. Do not report on an image you have not looked at.
5. **Iterate.** List the differences honestly, fix the biggest one or two, re-render.
   Expect three to six passes for a good match.
6. **Wire it in** (`quads.ts`, then the spell handler). See "Wiring".
7. **Check it in a real Phaser scene** before reporting. See "Phaser check".
8. **Report** with the comparison image saved inside the repo (the user cannot find the
   scratchpad), what changed, and what still differs from the reference. Say plainly that
   motion, particles and frame rate can only be judged in game.

## Shader conventions

- Export `getXFrag = (): string => \`...\`` and import `NOISE` from `./common`
  (`hash`, `noise`, `fbm`, `seams`, `segment`) with `${NOISE}` after the uniforms.
- Phaser gives `resolution` (quad size in world px) and `varying vec2 fragCoord`
  (quad-local world px, **y up**). Centre with `fragCoord - resolution * 0.5`, or
  `fragCoord.y - uGround` for effects that stand on a ground line.
- All custom uniforms are floats, declared in the `QuadDefinition`.
- Output **premultiplied** colour: `vec4(col, alpha)`. `alpha` covers and darkens;
  colour added with `alpha` left alone is additive light. Dark effects need alpha.
- Ground effects are squashed for the top-down view: `vec2 e = vec2(p.x, p.y / 0.6)`.
- Fade the quad's border so its rectangle never shows:
  `* smoothstep(0.0, 24.0, min(distance to each edge))`.
- `out`, `half`, `flat` and similar are reserved words in GLSL ES and fail to compile.
- Anything sampled by angle must wrap: use `vec2(cos(a), sin(a))` or a tiling noise,
  or a seam appears on the left side.
- Drive everything from uniforms (`uCharge`, `uBurst`, `uFade`...) so one shader covers
  the whole life. Keep time-driven motion slow and unsynchronised; fixed patterns must not
  slide or shimmer.
- True 3D (domes, orbs, volumes) is done by tracing a ray per pixel against a sphere, as
  in `tide.ts` and `bomb.ts`. It is the most expensive technique; warn about frame rate.
- Project rule: no comments in the code.

## Render loop

`scripts/render.mjs` renders a frag to a PNG contact sheet in headless Chrome, with no
game or server running. Run from the repo root:

```bash
node .claude/skills/spell-vfx/scripts/render.mjs <frag> frames.json <WxH> [zoom] [cols] [outDir]
```

- `frames.json` is an array of uniform objects, one per frame. Pick states that match the
  reference's panels.
- `LAYERS=2` composites pairs of frames into one cell, for shaders with `uLayer` 0 and 1.
- `BG=dark` (default) matches dark concept art; `BG=grass` shows how it sits in game.
- It exits non-zero and prints the GLSL error if the shader does not compile.

Then paste the render and the reference crops into one image with PIL and Read it.

## Wiring

`client/src/game/vfx/quads.ts` holds everything:

- a `QuadDefinition` (key, width, height, frag, uniform names),
- helpers `acquire`/`release` (pooled, because Phaser compiles a program per quad),
  `stack` (several layers at different depths, sets `uLayer`/`uGround`/`uSeed`),
  `play` (one tween that calls back with `ms` and a `put(name, value)`), `once`,
- one function per effect on the exported `quads` object.

Depths: `999` is on the ground under entities, `1000 + y` sorts with entities,
`2400` is above them. The hit should land on the visual beat via the `onX` callback.

The spell handler in `client/src/game/handlers/spells.ts` calls `vfx.quads.<name>(...)`
and creates the `Hitbox` in that callback. Scale every visual from `config.radius` or
`config.range` so size is one number in the spell config.

A **new spell** also needs: `SpellName` in `server/src/types/spells.ts`, a config in
`server/src/configs/spells.ts` (icon is `{ spritesheet, row, col }` — confirm row and col
with the user, they are easy to swap), a spell page in
`server/src/configs/entities/spellpages.ts` plus its `EntityName`, and a drop source.
Placeholder damage, mana, sound and icon are fine; say that they are placeholders.
New players only start with Shard, Slash and Revive, so say how to get the spell for testing.

## Phaser check

The render script only proves the shader. Before reporting, bundle `quads.ts` with
`npx esbuild client/src/game/vfx/quads.ts --bundle --format=iife --global-name=Q` and load
it with `node_modules/phaser/dist/phaser.min.js` in a small HTML scene that generates the
`particle_*` textures and calls the effect. Seek its tweens to a few timestamps
(`tween.seek(ms)`) and screenshot with headless Chrome
(`--enable-unsafe-swiftshader --use-angle=swiftshader --allow-file-access-from-files`).
This catches blend, depth, pooling and timeline bugs. Particles are misplaced by seeking,
so do not judge them from these captures. Give the page its own filename: the render
script writes `<frag>.html` in its output folder.

Finish with `npm run typecheck`. Config changes need a server restart.
