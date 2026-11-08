# Audit — 7.11.2026

Pre–early-access polish audit. Scope: every file in `client/src`, `server/src`, `scripts`, `tiled`, `plans`, and every asset in `client/public`.

Automated checks:
- `typecheck`: clean.
- Server tests: 102/102 pass.
- `verify:story`: passes.
- `verify:sheets` and `verify:tiles`: pass under `/usr/bin/python3`. They fail via npm, because Homebrew `python3` has no Pillow.
- `verify:maps`: fails, because 3 `.tmx` files were never exported.

Severity: 🟥 blocker · 🟧 high · 🟨 medium · ⬜ low. ✔ = I verified the claim in the code myself.

Status: ☐ open · ◐ claimed (date) · ✅ done (commit) · ✖ won't fix (reason). Work items with the `fix-audit-item` skill. IDs are permanent: never renumber.

---

## 0. Fix first

| ID | Status | Area | Issue |
|---|---|---|---|
| S0.1 | ✅ 8b45351 | Progression | ✔ Tier 5 needs 200 wood, but the store caps at 150 (`tiers.ts:37`, `globals.ts:647`). Tier 5 is unreachable |
| S0.2 | ✅ 3403a8a | Progression | ✔ Tomato seed only comes from a recipe that needs a tomato (`people.ts:1203`). The 3→4 upgrade is impossible |
| S0.3 | ✅ 430ace2 | Progression | Each draught's recipe tier is one higher than its unlock, so the first draught needed a swamp good. Corrected on 8.11.2026: the cave is unlock 0 (3 forest entrances), so quartz and seeds were reachable, and dungeon walls already place candles. The real break was bone (glass → vial → The Further), only from goblins or the temple; caves now spawn remains. Without that, only the Nightcap got you past tier 2, and refusing Tellis (`people.ts:2826`) lost it for good |
| S0.4 | ✖ Felix's own test item | Content | ✔ A Giant's Stalk (unlock 5) lies loose in the village (`village.tmx:10444`, object `Potion6`). It opens everything on day one |
| S0.5 | ✖ cheating is not a concern | Server | ✔ The `ENTITY_CREATE` socket event takes any `EntityConfig` from a client (`socket/index.ts:59`), which allows infinite items. The client never sends it, so remove it |
| S0.6 | ✖ a crash that restores the last autosave is safer than running on half-applied state | Server | ✔ A sync throw in any handler escapes `Promise.resolve(handler())` (`socket/index.ts:332`). That becomes an unhandled rejection and kills the world. There are no process-level handlers and no guard around the tick |
| S0.7 | ✖ losing up to 30 s on shutdown is acceptable | Server | ✔ Shutdown never saves the world (`index.ts:61-65`). The idle reaper, `pm2 restart` and deploys all lose up to 30 s |
| S0.8 | ✅ a3dd8cd | Server | A Postgres error at boot makes `load.world` return null, so a fresh tmx world is built. Autosave then overwrites the real save (`world.ts:11`, `load.ts:21`) |
| S0.9 | ✖ current behavior is correct; a duplicate player id is practically impossible | Net | A disconnect is invisible: no `disconnect`, reconnect or resync, so the game freezes silently (`Socket.ts:25`). Reconnect also races `player.create` and can leave a ghost session or duplicate items (`player.ts:46-120`) |
| S0.10 | ✅ 54fd863 | Client perf | ✔ All 12 map scenes update every frame while hidden (`Scene.ts:133`, `Main.ts:122-140`; they use `setVisible(false)`, not `sleep`) |
| S0.11 | ✖ Measured old vs new in game: melee no difference (2.5 ms per frame either way), claw average equal and peak worse with pooled emitters; no stutter in play. Revisit if real performance issues show up | Client perf | `claw` creates 480 emitters, 840 timers and about 15k particles per cast. A full melee combo creates about 585 emitters. `dissolve` creates one Arc and one tween per pixel (`vfx/emitters.ts:709-1172`). Still open from the old audit |
| S0.12 | ✅ 8502a1e | Audio perf | Every music and ambience file is decoded at boot, about 660 MB of PCM in RAM (`Main.ts:92`, `loaders/Sound.ts`). `storm1.ogg` alone is 279 s |
| S0.13 | ☐ | Security | Identity is a bare localStorage UUID. It is broadcast to every client, and the world never checks it against `world_members` (`player.ts:40`, `Menu.tsx:14`) |
| S0.14 | ☐ | Security | `POST /worlds/:id/start` forks a process for any string, with no membership check, cap or rate limit (`lobby.ts:153`) |
| S0.15 | ☐ | UX | No volume UI. `SoundManager.setVolume` has no caller and the Settings button is disabled (`Settings.tsx:171`) |

---

## 1. Missing small functionality

The ones you named, all confirmed:
- `S1.1` ☐ 🟧 **No pickup toast.** No toast or notification system exists at all. Proposal: one `Event.NOTIFY {text, kind, sound?}` socket event plus a `Toasts.tsx`. Hook points: `entity.pickup` after `INVENTORY_SYNC` (`entity.ts:136`) and `item.give` (`item.ts:198`, which covers harvest, craft and fish).
- `S1.2` ☐ 🟧 **No tier-up toast or sound.** `economy.ts:21` `upgradeTier()` only marks the economy dirty. Emit `ECONOMY_TIER` and handle it near `Main.ts:955`. Improvements (`economy.ts:38`) need the same. No fitting success sound exists.
- `S1.3` ☐ 🟧 **No partial stack take.** `SLOT_MOVE` has no `quantity` (`storage.ts:342-481`, `Provider.tsx:118`). Add `quantity?`, make shift-drag move half, and add a "Take…" amount picker. Chest items have no context menu today (`Storage.tsx:70`).
- `S1.4` ☐ 🟧 **No rebinding.** Keys are hard-coded (`Input.ts:32-44`) and mouse actions too (`Input.ts:162`, `Build.ts:90`). The Controls screen is a separate static table (`Settings.tsx:9`). Use one `bindings` map that is saved, drives `addKeys`, and renders the Controls screen.

Silent failures (no feedback today):
- `S1.5` ☐ 🟧 Inventory full on pickup. Pickup is also all-or-nothing, so 3 free spaces against a stack of 5 takes none (`entity.ts:133`, `Pickable.ts:56`).
- `S1.6` ☐ 🟧 No death or wipe screen. The inventory is cleared with no message (`Main.ts:1212-1233, 1302-1321`).
- `S1.7` ☐ 🟧 Party "Leave" inside the realm wipes the inventory with no confirmation (`Party.tsx:56`, `party.ts:206`).
- `S1.8` ☐ 🟨 Pickup removes the item before the server confirms. If the server rejects it, it vanishes locally but stays on the server (`Pickable.ts:58`).
- `S1.9` ☐ 🟨 Craft overflow spills on the ground silently. The COLLECT sound plays before the server confirms (`crafter.ts:54`, `Main.ts:926`).
- `S1.10` ☐ 🟨 Upgrade or improve can't afford, or lost a race (`economy.ts:11-33`). The handler isn't passed the `socket`.
- `S1.11` ☐ 🟨 `PLAYER_TRANSITION_DENIED` carries no reason, e.g. locked area or dream too shallow (`player.ts:387,403`, `party.ts:513`).
- `S1.12` ☐ 🟨 Bed occupied (`sleep.ts:47`), chest in use (`storage.ts:115`), NPC busy (`dialogue.ts:166`), party join refused (`party.ts:164-171`).
- `S1.13` ☐ 🟨 Wrong tool: the rock or tree just becomes non-interactive. It should show "Needs a pickaxe" (`Mineable.ts:43`, `Fellable.ts:37`).
- `S1.14` ☐ 🟨 No mana, or casting in a sacred map (`Casting.ts:98`, `combat.ts:38`).
- `S1.15` ☐ 🟨 Courier deposit into a full store plays COLLECT anyway (`item.ts:61`, `Main.ts:849`).
- `S1.16` ☐ ⬜ Food plays DRINK. Health potions can be drunk at full health (`item.ts:236`, `Main.ts:836`).
- `S1.17` ☐ ⬜ Build panel with no hammer, or on a non-build map: no hint (`Build.ts:41`).

Inventory, chest and crafter:
- `S1.18` ☐ 🟨 Deposit with `index:-1` never merges into a partial stack, so it fails when the chest has no empty slot (`storage.ts:302`).
- `S1.19` ☐ 🟨 No shift-click quick transfer, no "Take all" or "Deposit all".
- `S1.20` ☐ 🟨 Crafter makes one at a time; no "craft N" or "craft max". Recipe tooltips don't show have/need (`Crafter.tsx:89`, `Item.tsx:375`).
- `S1.21` ☐ ⬜ Drop and courier always take the whole stack. No sort. Dragging onto the world does nothing. Hotbar slots have no context menu.
- `S1.22` ☐ ⬜ Every `STORAGE_SYNC` re-fires `STORAGE_OPEN`, so slots flash empty (`Main.ts:940`, `Storage.tsx:14`).
- `S1.23` ☐ ⬜ Inventory initialises 24 slots while `INVENTORY_SIZE` is 20 (`Inventory.tsx:23`). Disabled slots all register dnd id `""` (`Item.tsx:64`).
- `S1.24` ☐ ⬜ Status effects show the raw enum name, with no icon or description (`Effects.tsx:68`).

Panels and input:
- `S1.25` ☐ 🟧 Esc only toggles pause. It never closes a chest, crafter, dialogue, party screen or context menu (`Input.ts:60`).
- `S1.26` ☐ 🟧 Input leaks under the pause menu (WASD, Space, Q/E, Tab). Solo worlds don't pause (`Settings.tsx:117`). Reuse `InputManager.mute`.
- `S1.27` ☐ 🟨 Dragon form desyncs Tab: some panels ignore it and some don't, and the desync is permanent (`Economy.tsx:66`, `Seeds.tsx:13`, `Build.tsx:15` vs `Inventory.tsx:46`). Use one shared `uiOpen` state.
- `S1.28` ☐ 🟨 Improvements never closes when you walk away (`Improvements.tsx:15`). Storage, Crafter and Improvements have no close button.
- `S1.29` ☐ 🟨 No number keys or mouse wheel for hotbar slots (`Input.ts:106`).
- `S1.30` ☐ ⬜ Opening Crafter or Improvements depends on listener registration order (`Inventory.tsx:70`). Chart overlaps Economy (`Chart.tsx:78`). The seed or build ghost stays after the panel closes.
- `S1.31` ☐ 🟨 The Tab layout has no overflow handling in the fixed 1280×720 window (`App.tsx:82`).

Dialogue and party:
- `S1.32` ☐ 🟨 Dialogue is mouse-only: no number keys, Enter or Esc (`Dialogue.tsx:104`).
- `S1.33` ☐ ⬜ A choice with no `next` and no END keeps the panel open (`Dialogue.tsx:46`). Add a verifier rule.
- `S1.34` ☐ 🟨 The party list shows UUID prefixes because there are no display names. Start is disabled with no reason given, and there's no ready indicator (`Party.tsx:45,132`).

Settings, menus and connection:
- `S1.35` ☐ 🟧 The window is fixed 1280×720 with `resizable:false`. No fullscreen and no saved size (`app/main.ts:9`).
- `S1.36` ☐ 🟨 No UI scale or colourblind support. Bars rely on red and green alone.
- `S1.37` ☐ 🟨 The disabled Save button is misleading while autosave runs. Show a "saved" indicator.
- `S1.38` ☐ 🟧 Loading screen: if `PLAYER_CREATE_LOCAL` never arrives, the player is stuck grey with no way out (`Loading.tsx:36`, `ui.ts:11`).
- `S1.39` ☐ 🟨 `connect_error` isn't handled, so a refused connection waits 10 s before "timed out" (`Menu.tsx:182`). All errors read "Failed to …".
- `S1.40` ☐ 🟨 "Quit" is `location.reload()`. There's no quit to desktop, and the main menu has no Quit, Settings or Credits (`Settings.tsx:184`, `Menu.tsx:263`).
- `S1.41` ☐ ⬜ Worlds can't be deleted or renamed. The shared `loading` flag shows "Starting…" on every row. Esc doesn't close the menu overlays.
- `S1.42` ☐ ⬜ The Controls list leaves out click-to-interact, hammer demolish and hotbar click.

HUD:
- `S1.43` ☐ 🟨 `Interface.ts:50` runs `JSON.stringify` on damaged entities in every scene, every frame. React re-renders at 60 fps while any damaged entity is on screen. Health-bar position is relative to the player, not the camera.
- `S1.44` ☐ 🟨 The FPS counter always shows, and it calls setState every rAF (`App.tsx:31-51`).
- `S1.45` ☐ ⬜ Damage numbers are fixed to the screen and slide when the camera moves (`combat.ts:221`, `DamageNumbers.tsx:54`). Growable and Feedable tooltips don't follow their target.
- `S1.46` ☐ ⬜ The health bar is 4 px off-centre (`Entities.tsx:36`). The boss bar vanishes instantly at 0. Effect timers use the client clock against the server's `expiresAt`. Stats show no numbers.

---

## 2. Sound

Root cause: the entity schema has no hurt or death sound field (`types/entities.ts:34`), and no `.tsx` plays any sound.

System:
- See S0.12 (decoded audio memory) and S0.15 (no volume UI).
- `S2.1` ☐ 🟥 `REVIVE` runs at volume 2 on a file that already peaks at 0 dBFS (`sounds.ts:213`) ✔.
- `S2.2` ☐ 🟧 Remote players' casts are silent: the `Casting.ts:53` guard skips every player, not just the local one ✔.
- `S2.3` ☐ 🟧 Hitting a non-player entity is silent (`Main.ts:572`). Entity death is silent (`Main.ts:384`).
- `S2.4` ☐ 🟨 Remote players' footsteps are silent (`Player.ts:124`).
- `S2.5` ☐ 🟨 No per-name concurrency cap or cooldown, so herds, goblin packs and meteor tails stack (`Sound.ts:48`).
- `S2.6` ☐ 🟨 Variants are picked purely at random, so 2-variant sets repeat 50% of the time. Use no-immediate-repeat.
- `S2.7` ☐ 🟨 Looping fires all start at seek 0, so the 6 village torches comb-filter. Randomise seek and detune.
- `S2.8` ☐ 🟨 `setVolume` doesn't update live loops (reel, charge). There's no master channel. `_load` JSON.parse is unguarded.
- `S2.9` ☐ 🟨 Music queues loop with no gap, so the 58 s `drums_in_the_deep` repeats endlessly (`Sound.ts:188`).
- `S2.10` ☐ ⬜ ~~Music bypasses the bus and fades~~ (fixed in S0.12). The listener is the player, not the camera. The charge sound doesn't follow the caster. `AmbientSoundConfig` has no `rate`, so calf, bull and goatling can't be pitched. Per-play allocations.

Entities with no voice at all:
- `S2.11` ☐ Animals: fox, hare, gosling, sheep, lamb (no sheep asset exists), heron (attack also silent), chick, rat (attack also silent).
- `S2.12` ☐ Creatures: bloodgeist1, apprentice, mage, blade, hexgeist, golem, zombie1–3, hog witch.
- `S2.13` ☐ **Bosses: Villain and Dragon have no voice, roar or idle.**
- `S2.14` ☐ All 31 named NPCs: no greeting or talk blip. Settings credits "Voices by Sky Rae", but no voice files exist.

Entities that borrow another's sound:
- `S2.15` ☐ Animals:
  - pig and piglet use boar
  - bellan uses bear
  - ibex uses goat, plus the player's jump and land
  - calf and bull use cow
  - goatling uses goat
  - rooster uses chicken (no crow)
- `S2.16` ☐ Creatures:
  - ancient troll and bog troll use troll
  - grandmother uses shadow wanderer (a single file)
  - apprentice and hexgeist use bloodgeist_hit
  - blade uses mage_hit
  - golem attacks with the player's `MINE` pickaxe sound
  - zombies use the goblin dagger whoosh
- `S2.17` ☐ Spells:
  - meteor shower, hyperbeam, dragon form and bite all use the sword `SLASH`
  - dark wave, hypnic jerk, sunder, wellspring and delta wave all use `GRASP`, and no Grasp spell exists
  - catch soul uses the shard sounds
  - `absorb_life.ogg` and `fire_wave.ogg` are loaded but never played
- `S2.18` ☐ World:
  - weather thunder uses the spell `LIGHTNING_STRIKE`
  - a fish bite plays the watering-can pour
  - eating plays DRINK
  - every transition plays DOOR: well, ladder, portal, caves
  - ruins break with `MINE`
  - bowls break with `WOOD_BREAK`

Silent actions:
- `S2.19` ☐ 🟧 Player death, inventory loss, revive.
- `S2.20` ☐ 🟨 Roll; swim strokes and water entry; falling into a hole; a missed fish.
- `S2.21` ☐ 🟨 Pacify, resist, capture, feed, milk, lay, butcher.
- `S2.22` ☐ 🟨 Sleep, wake, Sleepwander enter and exit, villain cutscene. No boss music.
- `S2.23` ☐ 🟨 Tier up, improvement, errand hand-in, spell learn, build place and destroy.
- `S2.24` ☐ 🟨 Chest open and close; lever, door and temple door; spike trap; forge and mill working loop.
- `S2.25` ☐ 🟨 Mined-out rock crumble (`Main.ts:460` only gates `FELLABLE`). Troll rock and mud throw and impact (`Throwing.ts`). Wanderer and grandmother dash. Grouse, villain and dragon flight.
- `S2.26` ☐ ⬜ Harvest, crop mature, wither; hive swarm buzz; item drop; effect apply; miss and crit.
- `S2.27` ☐ ⬜ All UI: panel open and close, hotbar switch, dialogue advance, menu clicks, location banner.
- `S2.28` ☐ ⬜ PICKUP, DRINK and COLLECT play before the server confirms, so they play even when the action is rejected.

Maps:
- `S2.29` ☐ 🟧 Isles, Nether and Cave have no music and no ambience. `CAVE_DRIP` and `DUNGEON_DRONE` from `plans/sound.md` were never added. Dungeon and temple share `CANALS`.
- `S2.30` ☐ 🟨 All 9 interiors are silent: music stops on entry. The tavern has no crowd, fire or music.
- `S2.31` ☐ 🟨 Swamp and mountain bands inherit forest music and birds (birds over snow). `location.ts:38` already detects bands, so it could carry a sound override.
- `S2.32` ☐ 🟨 Birds play at night. There are no crickets or owls. Cloudy weather has no wind. Snowfall is silent, because rain is suppressed in frost and nothing replaces it. Indoor rain cuts out instead of being muffled.
- `S2.33` ☐ ⬜ The menu has rain only, no menu music.

Assets:
- `S2.34` ☐ 🟧 `pop.ogg` (pickup) averages −6.7 dB, the loudest one-shot in the game. `bite1-4` (the key fishing cue) sit at −36 to −42 dB, probably inaudible.
- `S2.35` ☐ 🟨 Rain is 18 dB quieter than storm, and `useMenuAmbience` hard-codes GAIN 2 to compensate. Birds run at volume 0.005. Music varies by 10.8 dB across tracks.
- `S2.36` ☐ 🟨 Large level gaps within variant sets (in dB):
  - stepgrass 10.2
  - mine 10.4
  - rustle 10.1
  - cow 10.4
  - duck 10.8
- `S2.37` ☐ 🟨 `canals.ogg`, `bear_idle.ogg` and `bear_slash.ogg` are FLAC inside an `.ogg` container. `rustle1-20` are 96 kHz stereo while playing at volume 0.1.
- `S2.38` ☐ 🟨 `meteor.ogg` is 12 s long and overlaps 6× per shower. Trim the tails on shield, absorb, chop and cast.
- `S2.39` ☐ 🟨 Single-variant sounds on frequent actions:
  - pickup, land, sow, water, cast, splash
  - collect, door, drink, equip, grab
  - bear, orc and wanderer idles; bear, boar and wolf slash
- `S2.40` ☐ ⬜ `fire.ogg` is a 3.4 s loop.
- `S2.41` ☐ ⬜ Orphans: `footsteps/stepwater0-7.wav` (1.5 MB). Mixed formats; positional SFX should be mono.

---

## 3. Content, story, economy

Progression and references (beyond section 0):
- `S3.1` ☐ 🟧 The `barren.ore` errand is tier 1 but needs iron ore, which needs a pickaxe (tier 2) and swamp access (`errands.ts:25`).
- `S3.2` ☐ 🟨 Tier-2 errands (flour, grapes, hops, carrots) need seeds that drop only in the cave or dungeon, at 6% (`errands.ts:39-66`).
- `S3.3` ☐ 🟨 Recipe tier is below ingredient availability:
  - troll blood needs rat claws (`people.ts:332`)
  - robe3 needs claws and ergot (`:1490`)
  - robe2 and robe5 need Wanderer's gift (`:1520`)
  - compass and axe need iron, but no iron exists before unlock 2 (`:563`). There's no axe at tier 1.
- `S3.4` ☐ 🟨 `needs.ts` tiers don't follow first availability:
  - iron, iron ore, azurite and glowshroom are listed as tier 1
  - bone is tier 2 but the tier-1 glass recipe uses it
  - heron beak and plume are tier 2
  - shadow wanderer is tier 1
- `S3.5` ☐ ⬜ Tench can never be stocked, because it converts to fish meat (`needs.ts:133`).
- `S3.6` ☐ ⬜ Spell pages with no source: shard, slash, revive, meteor shower, bite.
- `S3.7` ☐ ⬜ `GRASS1` and `PLAYER` have no entity definition.

Item data:
- `S3.8` ☐ 🟧 Duplicate icons:
  - daffodil and henbane
  - potion1 and soup of the hiker
  - deer hide and bear pelt
  - spell page bite and dragon form
  - wellspring and dark wave
- `S3.9` ☐ ⬜ Flour and bear fat read as the same item.
- `S3.10` ☐ 🟨 The grape plant grows in 1000 ms, probably a test value (`crops.ts:675`).
- `S3.11` ☐ 🟨 "Bale" is described as cattle fat: the name means hay and the substance is tallow. It is also a draught ingredient (`resources.ts:966`).
- `S3.12` ☐ ⬜ Meteor's animation key is "growling". "Catch Soul" capitalisation. "Faded wanderer" is a placeholder name. Aubrel has no displayName.
- `S3.13` ☐ 🟨 `Fishing.tsx:69` uses `fish_placeholder.png` instead of the hooked fish's icon.

Dialogue (flagged only; text is yours to write):
- `S3.14` ☐ 🟨 Garleas's sleepless line is gated on HAPPY (`people.ts:1695`).
- `S3.15` ☐ 🟨 Aurin's quest line praises venison, against her vegetarian arc (`:1333`).
- `S3.16` ☐ 🟨 Emy has no post-frame greeting (`:1881`).
- `S3.17` ☐ 🟨 Chronwen has no COLD or THIRSTY greeting, so she falls back to the HAPPY bear line (`:2310`). Add a verifier rule: keyed greetings must cover every mood.
- `S3.18` ☐ 🟨 Thin villagers: Duneas (1 line), Irelle, Aunne, Lonna, Fishwife, Helper2, Alya after friendship.
- `S3.19` ☐ ⬜ Esken is unchanged after ESKEN_GLIMBLID. Fishwife's "Fish again…" can fire at tier 1. Odda's "dusk" lotus hint has no time gating. Lynha's gift checks for any wood but takes 5. Aubrel's rumour never replaces the report.
- `S3.20` ☐ ⬜ "Beverage saler" typo. Ennor's "kind of busy". MEATS excludes fish meat, so fish never break Aurin's streak.
- `S3.21` ☐ 🟨 Planned but missing: Garleas sleeps through and Malie's thanks (so Malie's quest never resolves), Faire's goats, Glimblid sad about the ducks, Aunne's cult-bread line. Smaller ones are listed in the report.

Economy:
- `S3.22` ☐ 🟧 Ring2 doubles damage. It drops at tier 1, and carried copies multiply (two rings give ×4). Same for boots1 ×1.5 speed, bell ×0.5 defense, feather and pickles +150 HP, silver sword ×1.75. Mark them `unique` or tone them down (`equipment.ts`, `player.ts:446`).
- `S3.23` ☐ 🟨 Needs drain 0.5 per group per day, so a full store lasts about 80 game days. Needs are not a real sink.
- `S3.24` ☐ 🟨 Many raw goods have no consumer: wolf fang, bear fat, fungus, glowshroom, lily, down, ore.
- `S3.25` ☐ ⬜ Wool comes only from killing sheep, so 30 for tier 4 is a grind.
- `S3.26` ☐ ⬜ 2→3 needs 100 wood, above the base cap of 50. Nothing tells the player Storage is needed first.

Discoverability:
- `S3.27` ☐ 🟧 No tutorial or hints at all. Nothing explains sleeping, the party lobby, that draughts only work in the lobby (`item.ts:261`), the Nightcap's depth bonus, bookkeeper hand-ins, or soulstones.
- `S3.28` ☐ 🟧 The only quartz hint points at the cave and a pickaxe (both locked). Nothing says goblins drop it (`people.ts:1174`).
- `S3.29` ☐ 🟨 Draught and Nightcap descriptions never mention dream depth. The grandmother (15%, once per world) has no hint.

Suggested verifier rules:
- `S3.30` ☐ Sources must be reachable at or below their tier, accounting for unlocks and tools. Seeds already have a source-exists check (`seeds.test.ts`); tier and unlock reachability is still open.
- `S3.31` ☐ Recipe tier must be at least the ingredients' tier.
- `S3.32` ✅ 8b45351 Tier requirements must fit within the store cap.
- `S3.33` ☐ Greetings must cover every mood.
- `S3.34` ☐ No duplicate icons without a whitelist.
- `S3.35` ☐ Biome spawns must be included in the map's sheets.

---

## 4. Server and multiplayer

Robustness:
- `S4.1` ☐ 🟧 No `pg.on("error")`, so an idle client error crashes both lobby and world (`postgres.ts:4`).
- `S4.2` ☐ 🟧 A rejected sublevel generation stays cached, so that entrance is dead until restart (`Sublevel.ts:20`). The client is stuck on loading after failure (`sublevel.ts:35`, `party.ts:266`).
- `S4.3` ☐ 🟧 Disconnecting inside a sublevel leaks the instance, its entities and its grid (`player.ts:146`).
- `S4.4` ☐ 🟨 Unbounded generator forks; a clean exit with no message hangs until the 30 s timeout (`generation.ts:642`).
- `S4.5` ☐ 🟨 Fixed-delta `setInterval` tick, so the clock drifts when the loop lags (`World.ts:120`).
- `S4.6` ☐ 🟨 ioredis retries 20× while Redis is down. `start()` can return a world that is still shutting down (`lobby.ts:50`). Crash exit codes aren't logged.

Persistence (rule: save and load in the same change):
- `S4.7` ☐ 🟧 Player rows and the world row are separate writes, so a chest take, logout and crash duplicates items (`world.ts:68`, `save.ts:22`).
- `S4.8` ☐ 🟧 Players in instanced maps are never saved. Party drop duplication.
- `S4.9` ☐ 🟧 Instanced entities get saved and restored as invisible orphans, piling up every restart (`world.ts:70`).
- `S4.10` ☐ 🟧 `isLocked` and `lockedBy` are persisted, so a chest, bed or NPC locked at save time stays locked forever. It also makes the schedule scan run every tick.
- `S4.11` ☐ 🟧 New tmx entities from content patches never reach existing saves; only zones are merged (`world.ts:13`).
- `S4.12` ☐ 🟨 Player saves miss mana, effects, sleep and isDead. `health || MAX` turns 0 health into full, and `x || spawn` treats x=0 as missing (`player.ts:78-81`). The save block is duplicated in two places.
- `S4.13` ☐ 🟨 Weather, climate, `economy.meatEaten` and party `unlocked` aren't saved.
- `S4.14` ☐ 🟨 A failed Redis write after Postgres succeeds leaves Redis stale, and Redis is read first (`load.ts:9`).
- `S4.15` ☐ 🟨 Only `spill` drops decay. Loot, extraction, crop and fish drops pile up in saves forever.
- `S4.16` ☐ 🟨 Crop growth is reported by the client, so crops only grow while an authority client has the chunk loaded, and never offline (`farming.ts:92`).
- `S4.17` ☐ ⬜ The autosave interval can overlap a slow save. A save with zero entities re-adds the tmx entities.

Authority (trusting the client):
- `S4.18` ☐ 🟥 `flee` and `wither` delete any entity by id (`entity.ts:218`, `farming.ts:106`).
- `S4.19` ☐ 🟥 Pickup has no pickable, range or map check ✔ (`entity.ts:114`).
- `S4.20` ☐ 🟥 `hit` trusts the attacker, the damage config and the target, so a client can one-shot the Grandmother or heal with negative damage (`combat.ts:369`).
- `S4.21` ☐ 🟧 Input is fully trusted: teleport, spoofing another `id`, relaying raw data (`player.ts:213`).
- `S4.22` ☐ 🟧 `transition` accepts any target with no door check, so a solo player can enter party maps (`player.ts:374`).
- `S4.23` ☐ 🟧 The sublevel `from` id isn't validated (`sublevel.ts:27`).
- `S4.24` ☐ 🟧 Harvest has no growth check: plant and harvest immediately (`farming.ts:46`).
- `S4.25` ☐ 🟧 The client picks the fish species and weight (`fishing.ts:27`).
- `S4.26` ☐ 🟧 `learn` doesn't check for a scroll (`spell.ts:18`).
- `S4.27` ☐ 🟧 Dialogue accepts any `nodeId`, so a client can jump straight to reward nodes (`dialogue.ts:110`).
- `S4.28` ☐ 🟧 The slot `type` comes from the client, which can corrupt saves or delete items (`storage.ts:342`).
- `S4.29` ☐ 🟨 Storage open has no range or STORAGE check.
- `S4.30` ☐ 🟨 These events have no authority check: ENTITY_INPUT, SPOTTED, WATER, GROW, MATURE, LAY.
- `S4.31` ☐ 🟨 Extract has no tool, range or cooldown, and spawns one entity per unit.
- `S4.32` ☐ 🟨 Build place has no range or collision check. Capture, feed and milk have no range check.
- `S4.33` ☐ 🟨 `isAuthority` is computed for VILLAGE even when the player spawns elsewhere. (The concurrent `PLAYER_CREATE` ghost was dropped: a rare race, to be fixed only if it shows up in testing.)
- `S4.34` ☐ ⬜ Upgrade needs no created player. Encounter start works on any NPC. No rate limit; `maxHttpBufferSize` is 1 MB.

Performance:
- `S4.35` ☐ 🟧 Storage `drive` is O(n²) every second (`storage.ts:204`). The schedule scan runs every tick while a villager is locked (`schedule.ts:18`).
- `S4.36` ☐ 🟨 Every input packet spreads the whole PlayerConfig and rebuilds 25 chunk keys. Input is double-sent to the chunk and party rooms.
- `S4.37` ☐ 🟨 The full economy snapshot goes to every socket every second. Full PlayerConfig (inventory, story, socketId) is sent to other players.
- `S4.38` ☐ 🟨 `soak` scans every entity every 2 s. Map JSON is re-read synchronously mid-game. The world is stringified twice per save. Empty chunk sets are never deleted.
- `S4.39` ☐ ⬜ 60 Hz spawner and texture ticks, and a 60 Hz tick overall where 10–20 Hz would do.

Ops and security:
- `S4.40` ☐ 🟧 CORS is `*`, and the server runs plain HTTP/WS to a hard-coded IP (`.env.production`, `Menu.tsx:12`).
- `S4.41` ☐ 🟨 Default `waken:waken` credentials are used as fallbacks, and production runs the dev compose file.
- `S4.42` ☐ 🟨 `npm start` (`node dist/lobby.js`) is broken: extensionless ESM imports, and `schema.sql` isn't copied.
- `S4.43` ☐ 🟨 Each world has its own `pg.Pool` of 10, so about 10 worlds exhaust Postgres.
- `S4.44` ☐ ⬜ World names have no length cap. `DEV_COMMANDS` is inherited by every world. `dev.commands[name]` resolves prototype keys.

---

## 5. Client game code

Bugs:
- `S5.1` ☐ 🟧 `shutdown()` is never called (`Main.ts:1325`, `Scene.ts:169`). About 31 EventBus listeners and all socket listeners are never removed.
- `S5.2` ☐ 🟧 Torn-down maps leak physics colliders (2 per collision rect), and `rebuild()` creates new managers without destroying the old ones (`factory/Map.ts:305`, `Forest.ts:45`). Nether has about 10k colliders.
- `S5.3` ☐ 🟧 Every chop or mine hit compiles a `BouncePipeline`, and `resetPipeline` permanently removes the tree's sway (`vfx/shaders.ts:63`).
- `S5.4` ☐ 🟧 `effects.ts:22` recomputes speed without the robe, so any effect change wipes the robe speed bonus.
- `S5.5` ☐ 🟧 Defend, Attack and Search never reset `completed`. After the first disengage, wanderers never fight again (`Defend.ts:183`). Fix it centrally in `BehaviorQueue.ts:31`.
- `S5.6` ☐ 🟧 `vision.canSee` past 200 px uses a fixed fan of rays with about 100 px gaps, so it misses visible targets (`vision.ts:137`).
- `S5.7` ☐ 🟧 Breath and bite: `direction.x !== 0` is checked on a normalised vector, so up and down cones are broken (`spells.ts:555, 625`).
- `S5.8` ☐ 🟧 Knockback is overwritten by `setVelocity` on moving targets (`combat.ts:274`).
- `S5.9` ☐ 🟧 Pickables can be clicked from anywhere on screen (`Pickable.ts:46`).
- `S5.10` ☐ 🟧 Remote interpolation only lerps when a message arrives, so remotes park off-position. Locked remotes snap (`interpolation.ts`, `Entity.ts:117`, `Player.ts:155`).
- `S5.11` ☐ 🟨 State `exit()` always unlocks, overriding transition and system locks (Rolling, Jumping, Dashing, Felling, Mining, Raking, Watering, Casting).
- `S5.12` ☐ 🟨 A transition locks without leaving the current state (`Main.ts:329`). Events dropped during a transition stay as ghosts if the transition is denied (`Main.ts:363`).
- `S5.13` ☐ 🟨 Depth isn't updated while locked (roll, dash, knockback), so entities draw wrong against props (`Player.ts:136`, `Entity.ts:102`). `Player.ts:212` ignores `depthOffset`.
- `S5.14` ☐ 🟨 Fishing:
  - remotes roll their own fish and bite timer
  - a null `findZone` means no bite timer, so the player waits forever
  - steps driven by animation events have no fallback timer
- `S5.15` ☐ 🟨 Thresholds are toggled by the local player's y for everyone, including AI (`Tile.ts:73`).
- `S5.16` ☐ 🟨 Holding W through a door stops you, because the new InputManager doesn't see held keys. `input.off("pointerdown")` with no handler removes every listener. Jump and roll pressed while locked are lost (`Input.ts`, `Player.ts:129`).
- `S5.17` ☐ 🟨 SUBLEVEL_START has no tilemap guard and doesn't re-apply the daycycle or weather (`Main.ts:1164`).
- `S5.18` ☐ 🟨 BLINK has no walkability check. HYPERBEAM, GAIN_MOMENTUM, REFLECT_DAMAGE and HEAL_PARTY only play a puff: implement them or pull their pages.
- `S5.19` ☐ 🟨 Meadow bends grass for entities on other maps (`meadow.ts:283`). The villain `isle` caches a zero result (`villain.ts:112`). The hurt flash reveals invisible entities (`combat.ts:255`). Building is allowed on top of players (`build.ts:145`).
- `S5.20` ☐ 🟨 Hoverable outlines stick, and pipelines stack (`Hoverable.ts:24`). Static AmbientSound never ticks, so `firebowl1` freezes (`AmbientSound.ts:43`). BODY attached before TEXTURE positions the body against `__MISSING` (`Body.ts:20`). `detach` while open never emits CLOSE (`Storage.ts:58`).
- `S5.21` ☐ 🟨 Throwing targets the nearest player, not the attack target (`Throwing.ts:67`). Flying snaps z to 0 in one frame (`Flying.ts:66`). An animal fleeing a disconnected player despawns in view.
- `S5.22` ☐ ⬜ Socket `init` leaks when called while connecting, and `Menu.tsx:187` `off("connect")` removes the internal listener. Camera `dash` overlaps. Daycycle and weather tweens aren't killed before new ones. `Main.ts:539` uses the wrong tween manager. WAKE_REQUEST is handled on two buses. `createdAt ?? Date.now()` never falls back. Trap timers grow without bound. The hard-coded depth bands break at y ≈ 9000.

Performance:
- `S5.23` ☐ 🟧 No send-rate cap: input is emitted on every frame (60–144 Hz) per player and per authority AI (`Player.ts:203`, `Entity.ts:127`).
- `S5.24` ☐ 🟧 `state.resolve` builds about 20 objects and 40 closures per entity per frame (`state.ts:5`).
- `S5.25` ☐ 🟧 12 scenes preload the same 229 keys, about 1,128 redundant queue entries (`loaders/Texture.ts:134`). Use one Boot scene.
- `S5.26` ☐ 🟧 Spell pools compile a program per pooled Shader on first cast, e.g. about 25 for meteors (`quads.ts:546`). Pre-warm them.
- `S5.27` ☐ 🟨 The `managers` getter allocates on every access (`Scene.ts:46`). `_drain` uses `shift()` (`Entity.ts:201`). Tile animation walks every position on the map (`Tile.ts:103`). `setDepth` runs every frame on thresholds.
- `S5.28` ☐ 🟨 Vision raycasts loop over the whole map width per Attack AI per frame. ENTITY_OVERLAP fires per pair per frame for 52 BOUNCE types.
- `S5.29` ☐ 🟨 Shadows are redrawn per scene per frame. `sprites.ts` creates a canvas and calls `getImageData` per death. Build `placeable` runs every frame. Splash creates a new emitter each time. One Shader per waterfall and mist, never culled. The legacy string A* allocates about 180k strings. The meadow re-bakes at 20 Hz even with a still camera.
- `S5.30` ☐ 🟨 `Animation.play` runs every frame and rebuilds keys. All 19 states are instantiated per spawn. 61 types have needless dynamic bodies. The Feedable tooltip re-renders every frame.
- `S5.31` ☐ 🟨 Hover compiles an OutlinePipeline plus a full-screen RT. About 20 `useProgram` calls per frame on idle pipelines. One Ambience pipeline per scene. Full-resolution fbm fog. The shadowmap is rebuilt every frame. One draw per overlay sprite. BITE creates 63 timers. `transform` issues a fillRect per particle per frame.
- `S5.32` ☐ ⬜ Many per-frame allocations: Chunk keys, `getWorldPoint`, Input spreads, `light.setSize`, weather and daycycle filters, AmbientSound spatial. The details are in the agent report; ask if you want it.

Rendering and game feel:
- `S5.33` ☐ 🟧 The fixed 60 Hz Arcade step has no interpolation, so it judders on 120 Hz displays (`config.ts:66`).
- `S5.34` ☐ 🟧 Effects use fixed depths (1000–2401) while entities use `1000+y`, so slash, puff and hearts draw under anything below y=1000 (`emitters.ts:740` and about 45 more sites).
- `S5.35` ☐ 🟧 The Ambience camera is one frame stale and uses raw scrollX, so snow, rain and fog wobble (`Ambience.ts:204`).
- `S5.36` ☐ 🟧 `Bounce.trigger` on a shared slot restarts every reed already using it.
- `S5.37` ☐ 🟧 Unwrapped session time is fed into hashes, which collapse after about 18 minutes and band the waterfalls (Ambience, Blaze, Sheen, Status, Glow, Water, Meadow).
- `S5.38` ☐ 🟧 `pow(neg, 2.0)` gives NaN on Metal (`mist.ts:22`, `swell.ts:87`, `hyperbeam.ts:118,135`).
- `S5.39` ☐ 🟧 Creature slash hitboxes use a fixed 150 ms delay and 800 ms window, ignoring the animation (`Slashing.ts:45`).
- `S5.40` ☐ 🟧 Combo clicks aren't buffered, so combos need frame-precise timing (`Casting.ts:93`).
- `S5.41` ☐ 🟨 `startFollow(target, false)` gives sub-pixel camera scroll, so tiles crawl against sprites (`Camera.ts:17`). The pointer world position is one frame stale.
- `S5.42` ☐ 🟨 No hit-stop or white flash. EXTRACT fires about 250 ms after the visible impact. The dash is 50 ms against a 1000 ms animation. Meteor and lightning shake every client. Sway is in screen space. Melee trails are left behind on lunge.
- `S5.43` ☐ 🟨 Health-bar and effect depth: `vfx/texture.ts:28` `setDepth(y)` without the 1000 base. `transform` stacks Vortex pipelines, including for offscreen casters.
- `S5.44` ☐ ⬜ `frags/spikes.ts` pixel-snaps and posterizes, and `bomb.ts` dithers. Both conflict with the smooth-VFX rule. Six frags use mediump with world coordinates.

Rule violations:
- `S5.45` ☐ 🟨 `any` in the client: Main, the four instanced scenes, Socket, Tile, Throwing, Transition, physics, combat, factory/Map.
- `S5.46` ☐ 🟨 `any` in the server: socket/index, broadcast, save, lobby, loaders/Map, types/hotbar, tiled, generation, builders/Map.
- `S5.47` ☐ 🟨 Hidden module state: `beam.ts:26`, `charge.ts:18`, `path.ts:30`, `shaders.ts:12`, `quads.ts:497`, `Bounce.ts:15`, `Farmable.ts:17`, `Storage.ts:8`.
- `S5.48` ☐ 🟨 Local, remote and AI branching inside states and spells: Rolling, Felling, Mining, Fishing, Casting, Sleeping, Dead, BLINK moving only the local player, and `Player.ts:133-201`.
- `S5.49` ☐ 🟨 Comments and TODOs:
  - client: `config.ts:82`, `Main.ts:455`, `Casting.ts:68`, `pipelines/Bounce.ts:51` (`//`), `frags/outline.ts`, `ambience.ts`, `vortex.ts`, `components/Bounce.ts:23`, `loaders/Texture.ts:131`
  - server: `combat.ts:366`

Dead code:
- `S5.50` ☐ 🟨 About 740 of 2,324 lines in `vfx/emitters.ts` have no callers: burning, cold, poisoned, fireWave, bite, fall, impact, butterfly, lightning, grasp, absorb. Their textures go too.
- `S5.51` ☐ ⬜ `quads.bomb` and `frags/bomb.ts`: the reference fire bomb. Confirm whether it stays.
- `S5.52` ☐ ⬜ `spikeFrames.ts`: 414 lines of ASCII art.
- `S5.53` ☐ ⬜ `Chunk.updateFromPlayer`, the empty `client/src/utils/`, the `effects/index.ts` and `vfx/index.ts` barrels, `mergeObstacles`, `isCharging`, chart `REVEALED`.
- `S5.54` ☐ ⬜ Unreachable branches; about 20 no-op component overrides; unused exports.

Refactor candidates:
- `S5.55` ☐ 🟨 One `MapScene(name)` class to replace 11 identical scene files, plus Forest, Dungeon and Temple, which duplicate Sublevel.
- `S5.56` ☐ 🟨 `Main.ts` (1,332 lines): about 45 identical event→socket passthroughs become a forward table; split the socket handlers by domain; one `loadInstance()` for PARTY_START and SUBLEVEL_START.
- `S5.57` ☐ 🟨 Split god files:
  - client: `emitters.ts` 2,324; `quads.ts` 1,788; `water.ts` 1,422; `path.ts` 819; `spells.ts` 650; `Fishing.ts` 607
  - server: `builders/Map.ts` 1,845; `Room.ts` 1,788; `generation.ts` 1,493; `Water.ts` 1,255; `globals.ts` 824; `combat.ts` 810; `player.ts` 624
- `S5.58` ☐ 🟨 Duplicate pairs and groups to merge:
  - Felling and Mining (identical states); Fellable and Mineable
  - Wander, Patrol and Amble (one roam loop)
  - the timed-state skeleton
  - the 40-case component switch with its hidden HIVE side effect
  - GLSL boilerplate
  - box blur, texture upload and BFS helpers
  - about 20 copies of one-shot emitter code; one `vfx.burst` registry fixes the duplication and the allocations together

---

## 6. Art and maps

Animation bugs:
- `S6.1` ☐ 🟧 ✔ Bear and bellan `WARNING` has `frameCount 8`, but the sheet has 14 frames, so 3 directions play frames from the wrong rows (`animations.ts:82,89`).
- `S6.2` ☐ 🟧 Herbalist and blacksmith rows are ordered D, L, R, U instead of D, U, L, R, and the up row has 2 of 6 frames. Hidden today only by STAY.
- `S6.3` ☐ 🟧 The Villain has CASTING and FLYING states with no sheets, so the boss freezes on its last frame while casting.
- `S6.4` ☐ 🟨 citizen12's right row faces left. citizen9 idle plays 6 of 12 frames. Hexgeist casting is identical in all 4 directions. Apprentice walking uses the idle sheet.
- `S6.5` ☐ ⬜ Bookkeeper and helper1/2 have down only, which causes empty-anim warnings. About 22 NPCs have blank up, left and right idle rows, protected only by STAY: trim them or add a verifier rule.
- `S6.6` ☐ ⬜ `beehive`, `bee`, `troll_throwing_rock` and `bog_troll_mud` are loaded with the default 64×64 frame, giving 0 frames.
- `S6.7` ☐ ⬜ The player lantern is missing on run, jump and roll, so it pops in and out.

Missing polish:
- `S6.8` ☐ 🟨 No hurt or death frames anywhere: hurt is an alpha flicker, death is a dissolve. The dead player stands idle at 40% alpha. At minimum add a downed pose and a white hit flash.
- `S6.9` ☐ 🟨 17 damageable farm and village animals have only idle and walk. Heron, bloodgeist, apprentice and hexgeist have no run.
- `S6.10` ☐ 🟨 Recolour-only variants: bellan/bear, wolves, grandmother/wanderer. visitor1 and visitor2 borrow the apprentice and bloodgeist sprites outright.
- `S6.11` ☐ ⬜ HOUSE2 is unused. The tornado is loaded twice (2 × 4.3 MB).

Maps:
- `S6.12` ☐ 🟨 `verify:maps` fails on `generated-dungeon*.tmx` and `temple-generated.tmx`: mark them `reference` or delete them.
- `S6.13` ☐ 🟨 Dead `Light` objects in blacksmith, glassblower, herbalist and village. `Key` and `Locked_door` in generated-dungeon.
- `S6.14` ☐ 🟨 `tavern.tmx:480-486`: 7 bottle tile-objects show in Tiled but not in game.
- `S6.15` ☐ 🟨 The dungeon spawns rat, chicken, rooster and goat without loading their sheets. The tanner in the tavern has the same problem. Both work only because the village loaded the sheets first.
- `S6.16` ☐ 🟨 Visually unfinished: about 6 bare Isles islands (131 detail tiles across the whole map), the sparse Nether, large flat earth patches in the village, the empty windmill interior.
- `S6.17` ☐ ⬜ Empty tile layers in isles and nether. Editor-only layers shipped in `village.json`. helper2 is never placed.
- `S6.18` ☐ ⬜ windmill uses whole-tile collision only.

Bloat and orphans:
- `S6.19` ☐ 🟧 `maps/water.json` (8.5 MB) is shipped but not in any config.
- `S6.20` ☐ 🟧 `sprites/collection/` (4.3 MB of source art) is copied into every build.
- `S6.21` ☐ 🟨 `forest_glade.png` and `dungeon_corridor.png` are 4.3 MB each: convert to WebP. `hero_mountains.png` is used only in the README.
- `S6.22` ☐ ⬜ `ledge_waterfalls.png` is only used by `water.tmx`. Cave, isles and nether have no loading backdrop. `mountains_start.mp4` could be re-encoded. ARCO could be woff2.

Texture performance:
- `S6.23` ☐ 🟧 298 textures (about 151 MB RGBA) load at boot, one texture per state. Pack them into atlases and load creature and animal pools per biome.
- `S6.24` ☐ 🟧 Heavy padding: zombies, goblins, blade, mage, golem, rat and trolls use only 14–31% of each frame.
- `S6.25` ☐ 🟨 The dragon (about 22 MB) and tornado sheets load on every map. Load them lazily, like robes.

---

## 7. Release readiness

Network and accounts: see S0.9, S0.13 and S0.14.
- `S7.1` ☐ 🟧 No client/server version handshake.
- `S7.2` ☐ 🟧 Lobby worlds use sequential raw ports from 3001, which is NAT and firewall hostile. Route them through one TLS port.
- `S7.3` ☐ 🟧 No offline or singleplayer mode: decide before early access. A bundled local lobby is feasible.
- `S7.4` ☐ 🟧 Migrations are `CREATE IF NOT EXISTS` on boot, with no versioning. The JSONB saves have no version field. No backups. `server:clear` truncates production in one command.
- `S7.5` ☐ 🟨 Corrupt Redis JSON crashes the world at boot (`load.ts:10`). No player cap. No crash reporter or log file.

Electron:
- `S7.6` ☐ 🟧 No signing or notarization, and no `appBundleId` (`forge.config.ts`).
- `S7.7` ☐ 🟨 `productName` is missing, so user data, including the player UUID, lives under "client". Set it before release or identities get orphaned.
- `S7.8` ☐ 🟨 The default menu ships, so DevTools are reachable in production. No `setWindowOpenHandler`, so credit links open Electron windows. No CSP. The `webPreferences` aren't pinned.
- `S7.9` ☐ 🟨 The installers use the default icon (no Squirrel `setupIcon`, no DMG icon). There's a white flash before mount (no `backgroundColor` or `ready-to-show`). No favicon.
- `S7.10` ☐ 🟨 No asar. `Phaser.AUTO` crashes without WebGL. Zoom ignores DPR, so 125% and 150% scaling shimmer. A minimized authority client stops simulating AI for everyone.
- `S7.11` ☐ ⬜ `tsconfig.electron.json` fails typecheck (`esModuleInterop`) and isn't in `npm run typecheck`. Package names mix "waking" and "client". Version 0.0.1 is never shown.
- `S7.12` ☐ 🟧 Pixelify Sans loads from Google Fonts: offline it falls back to sans-serif, and it's a GDPR issue. Bundle it.
- `S7.13` ☐ ⬜ No auto-update and no Steam integration at all. Presence only, not a request.

Legal and meta:
- `S7.14` ☐ 🟧 No LICENSE or EULA. No license records for third-party packs: CraftPix, Kenney, JC Sounds CC BY, `tiled/_gc`, "Aligned Games". Get a written rights transfer for the Fiverr art.
- `S7.15` ☐ 🟨 No privacy policy (player IDs and IPs are stored).

Tooling and repo:
- `S7.16` ☐ 🟧 No CI. Add typecheck, test, `verify:*` and the vite build.
- `S7.17` ☐ 🟨 No save→restore round-trip test, and no tests for storage.move or reconnect.
- `S7.18` ☐ 🟨 Pin the Python with Pillow for the `verify:sheets` and `verify:tiles` scripts.
- `S7.19` ☐ 🟨 The README is outdated (it says port 3001; the lobby is 3100).
- `S7.20` ☐ 🟨 Large binaries are tracked; consider LFS.
- `S7.21` ☐ ⬜ Stale `tiled/_gc/s.tmx`.
- `S7.22` ☐ ⬜ Move the deploy key out of the repo root and stop deploying as root.
