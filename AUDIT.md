# Audit

| # | File | Severity | Category | Issue |
|---|------|----------|----------|-------|
| 8 | `client/src/game/vfx/emitters.ts` | critical | PERF | `slash()` creates ~120 particle emitters + 120 `delayedCall` timers per attack. `claw()` creates ~360. Pool emitters or use emit zones |
| 9 | `client/src/game/vfx/emitters.ts` | critical | PERF | `dissolve()` creates one `scene.add.circle()` + one tween per opaque pixel. 32×32 sprite = ~500 game objects + 500 tweens. Use a shader dissolve |
| 40 | `client/src/game/managers/Physics.ts` | high | LEAK | No `destroy()` — colliders/overlaps never cleaned up |
| 41 | `client/src/ui/Menu.tsx` | high | LEAK | `SocketManager.on("connect")` never unsubscribed |
| 42 | `client/src/ui/Menu.tsx` | high | BUG | No error/timeout handling on socket connect — loading state sticks forever on server failure |
| 43 | `client/src/ui/DamageNumbers.tsx` | high | BUG | `animate-damage-float` CSS class referenced but `@keyframes damage-float` never defined — numbers don't animate |
| 44 | `client/src/game/components/Interactable.ts` | high | PERF | `update()` emits `ENTITY_DIALOGUE_END` every frame for every interactable when player is out of range — even with no active dialogue |
| 45 | `client/src/ui/Effects.tsx` | high | PERF | `useNow` 100ms interval runs continuously even when no effects are active — 10 unnecessary re-renders/sec |
| 46 | `server/src/handlers/player.ts` | high | PERF | Server re-broadcasts every received input to all players in the chunk — N players × 60 msgs/sec = O(N²) traffic |
| 47 | `client/src/game/Entity.ts`, `Player.ts` | high | PERF | Interpolation uses fixed `lerp(0.2)` per frame — frame-rate dependent. No snapshot buffer, no extrapolation |
| 48 | `client/src/game/managers/Tile.ts` | high | PERF | `getCollisionGrid()` rebuilds full 2D collision array from scratch on every pathfinding call. Should cache and invalidate on tile changes |
| 49 | `client/src/game/managers/Interface.ts` | high | PERF | `update()` runs every frame: filters all entities, maps to health bar data, emits to React via EventBus. Should throttle or diff |
| 50 | `client/src/game/managers/Physics.ts` | high | PERF | No collision categories or groups — broad-phase checks every player against every entity. O(N²) scaling |
| 51 | `client/src/game/loaders/Preloader.ts` | high | PERF | All assets loaded as individual spritesheets — each is a separate WebGL texture and draw call break. Texture atlas packing would reduce draw calls |
| 52 | `server/src/handlers/combat.ts` | medium | BUG | `effects.apply()` casts weapon as spell for bonus lookup — false matches if spell/weapon share a name |
| 53 | `server/src/handlers/item.ts` | medium | BUG | `consume()` pushes effect with hardcoded 1000ms duration regardless of actual effect config duration |
| 54 | `server/src/handlers/player.ts` | medium | BUG | `delete()` unlocks entities but doesn't reset `entity.facing` (unlike `dialogue.end`) — NPCs stuck in non-default facing |
| 55 | `server/src/workers/generate.ts` | medium | BUG | `process.send` callback calls `process.exit(0)` regardless of send error — hides failures |
| 56 | `server/src/managers/Economy.ts` | medium | BUG | `upgradeTier()` has no max bound — tier exceeding config keys causes `undefined` consumption → NaN |
| 57 | `server/src/managers/Chunk.ts` | medium | BUG | `moveEntity()` with undefined `prev` silently registers entity without ref-counting |
| 58 | `server/src/configs/animations.ts` | medium | BUG | `BOAR` `SLASHING` animation has `repeat: -1` (infinite loop) — other attack anims use `repeat: 0`. May prevent state transitions |
| 59 | `server/src/handlers/party.ts` | medium | BUG | `wipe()` resets inventory but only emits `PARTY_WIPE`, not `PLAYER_INVENTORY_WIPE` — client may not update inventory UI |
| 60 | `client/src/game/state/Fishing.ts` | medium | BUG | Fish arc tween `onComplete` accesses `entity.scene` without null guard — crashes if entity destroyed mid-flight |
| 61 | `client/src/game/behavior/Attack.ts` | medium | BUG | `reset()` doesn't clear `cooldowns` or `lastAttackTime` — stale values persist across behavior queue repeats |
| 62 | `client/src/game/components/TextureAnimation.ts` | medium | BUG | `attach()` shifts entity position by offset, `detach()` never reverses it — re-attach doubles the offset |
| 63 | `client/src/ui/Collector.tsx` | medium | PERF | `STORE_SYNC` and `ECONOMY_UPDATE` update state while panel is closed — renders that return null |
| 64 | `client/src/ui/Collector.tsx` | medium | BUG | `(configs as any).tiers` bypasses type safety — breaks silently if property is renamed |
| 65 | `client/src/ui/Menu.tsx` | medium | BUG | Hardcoded `http://` protocol — fails if deployment requires HTTPS/WSS |
| 66 | `server/src/lobby.ts` | medium | LEAK | Idle reaper `setInterval` never cleared on shutdown |
| 67 | `client/src/game/handlers/move.ts` | medium | PERF | `new Phaser.Math.Vector2(0, 0)` allocated every frame per moving entity — reuse a module-level static vector |
| 68 | `client/src/game/Entity.ts` | medium | PERF | Three object allocations per frame in `update()`: `prev = {}`, `prepared = { ...input }`, `resolve()` return. Reuse mutable objects |
| 69 | `client/src/game/Player.ts` | medium | PERF | `_getInput()` creates a full `Input` object literal every frame — reuse a mutable input object |
| 70 | `client/src/game/handlers/path.ts` | medium | PERF | A* uses `open.sort()` + `shift()` per iteration (O(N log N)). A binary heap would be O(log N) |
| 71 | `client/src/game/components/Aura.ts` | medium | PERF | Creates 2 new emitter objects every 80ms while moving — up to ~125 live emitters. Use a single persistent trail emitter |
| 72 | `client/src/game/handlers/vision.ts` | medium | PERF | `intersects()` allocates `new Phaser.Geom.Line()` + `new Phaser.Geom.Circle()` per call — called 5-7× per `canSee()` |
| 73 | `client/src/game/managers/Player.ts` | medium | PERF | `get all()` creates a new array via spread on every call — called multiple times per frame. Cache and invalidate on add/remove |
| 74 | `client/src/game/components/Aura.ts` | medium | PERF | `setDepth()` called every frame on 2 emitters — marks display list dirty, forcing re-sort. Only call when depth changes |
| 75 | `server/src/globals.ts` | low | PERF | Server tick at 60Hz but does no physics/movement simulation — 20Hz would suffice for regen/effects |
| 76 | `client/src/game/managers/Input.ts` | low | PERF | `getMoving()` creates a new `Direction[]` array every frame — reuse a pre-allocated array |
| 77 | `client/src/game/factory/State.ts` | low | PERF | Creates all 11 state instances then discards unused ones — only instantiate requested states |
| 78 | `client/src/game/scenes/Scene.ts` | low | PERF | `shutdown()` doesn't call `scene.time.removeAllEvents()` or `scene.tweens.killAll()` — orphaned timers/tweens persist |
| 79 | `server/src/socket/index.ts` | medium | SUGGESTION | Replace `throw` with `console.error` in socket wrapper, add try/catch to all handlers |
| 80 | `server/src/lobby.ts` | medium | SUGGESTION | Add Express async error handler middleware to lobby routes |
| 81 | `client/src/game/effects/*.ts` | medium | SUGGESTION | Use a tint stack/priority system instead of `clearTint()` on each effect detach |
| 82 | `client/src/game/state/Casting.ts` | medium | SUGGESTION | Track combo timer separately and cancel it explicitly in `enter()` / `exit()` |
| 83 | `client/src/game/scenes/Main.ts` | medium | SUGGESTION | Consider a `useEventBus` hook that auto-cleans on unmount |
| 84 | `client/src/game/scenes/*.ts` | medium | SUGGESTION | Establish a pattern for cleaning up global listeners in `shutdown()` |
| 85 | `client/src/game/components/Interactable.ts` | medium | SUGGESTION | Only run distance check and emit `DIALOGUE_END` when a dialogue is actually active |
| 86 | `client/src/ui/Effects.tsx` | low | SUGGESTION | Only start the `useNow` interval when `effects.size > 0` |
| 87 | `server/src/index.ts` | low | SUGGESTION | Only autosave if world has changed (dirty flag) |
| 88 | `server/src/workers/generate.ts` | low | SUGGESTION | Extract `parseProperties` to standalone util to lighten worker imports |
