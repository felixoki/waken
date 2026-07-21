import { EntityName, Mood, NeedConfig, NeedName } from "../types";

export const needs: NeedConfig[] = [
  {
    name: NeedName.FOOD,
    tier: 1,
    mood: Mood.HUNGRY,
    items: [
      { item: EntityName.VENISON_MEAT, tier: 1 },
      { item: EntityName.RASPBERRY, tier: 1 },
      { item: EntityName.BOAR_MEAT, tier: 2 },
      { item: EntityName.CARROT, tier: 2 },
      { item: EntityName.TOMATO, tier: 2 },
      { item: EntityName.CABBAGE, tier: 2 },
    ],
    consumption: 0.5,
    low: 5,
  },
  {
    name: NeedName.CLOTHS,
    tier: 1,
    mood: Mood.COLD,
    items: [{ item: EntityName.DEER_HIDE, tier: 1 }],
    consumption: 0.5,
    low: 3,
  },
  {
    name: NeedName.RESOURCES,
    tier: 1,
    items: [
      { item: EntityName.WOOD, tier: 1 },
      { item: EntityName.QUARTZ1, tier: 1 },
      { item: EntityName.BONE, tier: 1 },
      { item: EntityName.GLASS, tier: 1 },
      { item: EntityName.IRON1, tier: 2 },
      { item: EntityName.RAT_CLAWS, tier: 2 },
    ],
    consumption: 0,
    low: 5,
  },
  {
    name: NeedName.INGREDIENTS,
    tier: 1,
    items: [
      { item: EntityName.SUNFLOWER, tier: 1 },
      { item: EntityName.DAFFODIL, tier: 1 },
      { item: EntityName.BLUE_LOTUS, tier: 1 },
      { item: EntityName.CLARY_SAGE, tier: 1 },
      { item: EntityName.BELLADONNA, tier: 1 },
      { item: EntityName.BEARDED_TOOTH_FUNGUS, tier: 1 },
    ],
    consumption: 0,
    low: 4,
  },
  {
    name: NeedName.DRINKS,
    tier: 2,
    mood: Mood.THIRSTY,
    items: [{ item: EntityName.GOAT_MILK, tier: 2 }],
    consumption: 0.5,
    low: 3,
  },
];
