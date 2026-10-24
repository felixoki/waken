import { EntityName, ErrandConfig, ErrandReward } from "../types/index.js";

export const errands: ErrandConfig[] = [
  {
    id: "tarro.hides",
    tier: 1,
    for: EntityName.TANNER,
    item: EntityName.DEER_HIDE,
    amount: 2,
  },
  {
    id: "odda.lotus",
    tier: 1,
    for: EntityName.HERBALIST,
    item: EntityName.BLUE_LOTUS,
    amount: 1,
  },
  {
    id: "lynha.wood",
    tier: 1,
    for: EntityName.CITIZEN16,
    item: EntityName.WOOD,
    amount: 3,
  },
  {
    id: "barren.ore",
    tier: 1,
    for: EntityName.BLACKSMITH,
    item: EntityName.IRON_ORE,
    amount: 2,
  },
  {
    id: "lonna.quartz",
    tier: 1,
    for: EntityName.GLASSBLOWER,
    item: EntityName.QUARTZ1,
    amount: 2,
  },
  {
    id: "aunne.flour",
    tier: 2,
    for: EntityName.BAKER,
    item: EntityName.FLOUR,
    amount: 1,
  },
  {
    id: "garleas.grapes",
    tier: 2,
    for: EntityName.BEVERAGE_SALER,
    item: EntityName.GRAPE,
    amount: 2,
  },
  {
    id: "garleas.hops",
    tier: 2,
    for: EntityName.BEVERAGE_SALER,
    item: EntityName.HOPS,
    amount: 2,
  },
  {
    id: "aurin.carrots",
    tier: 2,
    for: EntityName.GREENGROCER,
    item: EntityName.CARROT,
    amount: 2,
  },
  {
    id: "ebetha.pike",
    tier: 3,
    for: EntityName.FISHWIFE,
    item: EntityName.PIKE,
    amount: 1,
  },
];

export const errandRewards: ErrandReward[] = [
  { item: EntityName.SOUP_OF_THE_HIKER, quantity: 1, tier: 1, weight: 40 },
  { item: EntityName.WINE, quantity: 1, tier: 2, weight: 30 },
  { item: EntityName.BEER, quantity: 2, tier: 3, weight: 30 },
  { item: EntityName.RING2, quantity: 1, tier: 1, weight: 4, rare: true },
  { item: EntityName.AMULET1, quantity: 1, tier: 1, weight: 3, rare: true },
  { item: EntityName.NECKLACE1, quantity: 1, tier: 1, weight: 3, rare: true },
  {
    item: EntityName.SPELL_PAGE_SHIELD,
    quantity: 1,
    tier: 1,
    weight: 2,
    rare: true,
  },
  {
    item: EntityName.SPELL_PAGE_BLINK,
    quantity: 1,
    tier: 1,
    weight: 2,
    rare: true,
  },
];
