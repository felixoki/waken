## Issues

### Done

#### 23.12.2025

- Set up initial client and server logic ✅
- Set up socket for both client and server ✅

#### 24.12.2025

- Add input manager ✅

#### 26.12.2025

- Add entity class ✅
- Add player class ✅
- Add components and state machine ✅

#### 27.12.2025

- Add animation component ✅
- Draw players to the scene ✅

#### 28.12.2025

- Prepare player spritesheet layout ✅

#### 29.12.2025

- Add player update cycle ✅
- Set up physics manager ✅
- Set up movement handler ✅

#### 30.12.2025

- Add sprite mirroring ✅
- Adjust player creation cycle ✅
- Add states running, casting and jumping ✅

#### 31.12.2025

- Add hitbox and projectile ✅
- Set up player hosts ✅
- Add entity manager and entity store ✅
- Add pointable component ✅
- Draw an entity to the scene ✅
- Set up behavior component and entity updates ✅
- Add body component ✅
- Set up entity factory ✅

#### 1.1.2026

- Try Tiled editor ✅

#### 2.1.2026

- Add entity definitions ✅
- Add texture component ✅

#### 3.1.2026

- Add map loader ✅

#### 4.1.2026

- Add map factory ✅

#### 5.1.2026

- Add casting at coordinates ✅

#### 6.1.2026

- Download spritesheets ✅

#### 7.1.2026

- Implement pre loader ✅
- Introduce camera ✅

#### 8.1.2026

- Build first village section in Tiled editor ✅

#### 9.1.2026

- Add inventory ✅
- Add pickable component ✅
- Add hoverable component ✅

#### 10.1.2026

- Add outline pipeline ✅
- Add tile animations ✅
- Emit pick up events ✅

#### 11.1.2026

- Add spell configs ✅
- Emit damage events ✅

#### 12.1.2026

- Add ui inventory ✅
- Add ui health bars ✅

#### 13.1.2026

- Add toolbar component ✅

#### 14.1.2026

- Add equipped to input ✅
- Add camera class ✅
- Add damageable component ✅

#### 15.1.2026

- Add map transitions ✅

#### 16.1.2026

- Use registry to pass player between scenes ✅
- Add transition component ✅
- Add instance manager ✅
- Add game start menu ✅

#### 18.1.2026

- Add ui improvements ✅

#### 19.1.2026

- Add hitbox generation to spell config ✅
- Add interactable component ✅
- Add collector component ✅
- Add items store to server ✅

#### 20.1.2026

- Add area spells ✅
- Add collector functionality ✅

#### 23.01.2026

- Add village map details ✅

#### 27.01.2026

- Add detail renderer ✅

#### 30.01.2026

- Add village map farm floor plan ✅

#### 31.01.2026

- Add herbalist map ✅
- Add village map details ✅

#### 3.2.2026

- Add grass bounce component ✅
- Remove animation mirroring ✅
- Add spawns to maps ✅

#### 4.2.2026

- Add renders boolean to map factory ✅
- Add dynamic keys for detail layers ✅
- Refactor physics and combat handlers ✅
- Fix slashing state ✅
- Add rolling state ✅
- Show health bars only for damageable entities ✅
- Add host switching on disconnect ✅
- Move target registration to input manager ✅
- Add interface manager ✅
- Add herbalist ✅

#### 5.2.2025

- Task planning ✅

#### 6.2.2025

- Add pathfinding ✅
- Add raycasting ✅
- Update patrol component ✅

#### 8.2.2025

- Update map transitions ✅
- Add fullsize mode ✅

#### 9.2.2025

- Add economy manager ✅

#### 10.2.2025

- Add dialogue trees ✅
- Remove instance management ✅
- Split types ✅
- Make direction pointer based ✅

### Next up

- Dialogue system ⭐
  - Add dialogue component
  - Add dialogue server roundtrip
  - Separate dialogue and collect
  - Lock entities during interaction

- Economy ⭐
  - Add server ticks

- Procedural forest generation ⭐
  - Add attack behavior
  - Add party management
  - Add map creation
  - Add ambience manager
  - Add foggy forest shader

- Save files ⭐
  - Add database
  - Add autosaves
  - Add manual saves
  - Add save file loading

- Party management ⭐

- General
  - Update tile collision layer

### Backlog

- Spells ⭐
  - Aim assist
  - Catch animal
  - Water fountain
  - Improve illuminate shader
  - Add mana usage
  - Add particle texture for sharp effects
  - Add spell impact preview

- Effects ⭐
  - Add wet effect
  - Add resistances and weaknesses

- Farming ⭐
  - Add plantable component

- Animal keeping ⭐

- Market district ⭐

- Tavern ⭐

- Blacksmith ⭐
  - Add resource iron (dropped by orcs)
  - Add resource horn (dropped by oxes)
  - Venison fat (dropped by deer)
  - Add crafting system
  - Add lantern

- Harbor district ⭐

- Sewerage ⭐
  - Add blood ghost cultists

- Game sounds ⭐
  - Add music and ambience

- Refactoring and improvement
  - Improve depth sorting system
  - Add world animation component
  - Add throttling network updates and change detection
  - Update interpolation system

## Economy

| Category   | Tier 1                       | Tier 2                           | Tier 3 |
| ---------- | ---------------------------- | -------------------------------- | ------ |
| Meat       | Venison, Boar                | Pork                             | Beef   |
| Vegetables | Blueberry, Strawberry, Apple | Carrot, Onion, Cabbage, Cucumber | Bread  |
| Drinks     | -                            | Milk                             | Wine   |
| Cloths     | -                            | Sheep wool, Fox pelt             | -      |

## Collectors

| Collector   | Collects                                                                                                   | Produces                         |
| ----------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------- |
| Blacksmith  | Wood, Iron ore, Glass                                                                                      | Axe, Pickaxe, Lantern, Hoe, Iron |
| Herbalist   | **T1:** Sunflower, Mugwort, Daffodil<br>**T2:** Blue lotus, Clary sage, Bearded tooth fungus<br>Vial, Wood | Potions                          |
| Glassblower | Potash (Wood), Quartz, Bone ash (Bones)                                                                    | Glass, Vial                      |
| Mage        | Iron, Glass, Pearls, Gems, Runes                                                                           | Rings, Amulets, Spells           |

## Procedural generation configs

### Forest

#### Non-aggro animals

- Fox (Fox pelt)
- Deer (Venison meat)

#### Aggro animals

- Rat (Rat meat)
- Boar (Boar meat)

#### Aggro entities

- Goblin1 (Rat meat, bones)
- Goblin2 (Rat meat, bones)
- Orc1 (Iron ore)

#### Boss

- Shadow wanderer

#### Plants

- Sunflower
- Carrot
- Mugwort
- Daffodil
- Blue lotus
- Bearded tooth fungus
- Clary sage
