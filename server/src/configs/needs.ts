import { EntityName, NeedConfig, NeedName } from "../types";

export const needs: NeedConfig[] = [
  {
    name: NeedName.CLOTHS,
    items: [
      { item: EntityName.DEER_HIDE, tier: 1 },
    ],
    consumption: {
      1: 0.5,
    },
    threshold: {
      1: 0.3,
    },
  },
  {
    name: NeedName.FOOD,
    items: [
      { item: EntityName.VENISON_MEAT, tier: 1 },
      { item: EntityName.CARROT, tier: 1 },
      { item: EntityName.TOMATO, tier: 1 },
      { item: EntityName.CABBAGE, tier: 1 },
    ],
    consumption: {
      1: 0.5,
    },
    threshold: {
      1: 0.3,
    },
  },
  {
    name: NeedName.RESOURCES,
    items: [
      { item: EntityName.WOOD, tier: 1 },
      { item: EntityName.QUARTZ1, tier: 1 },
      { item: EntityName.IRON1, tier: 1 },
    ],
    consumption: {
      1: 0.5,
    },
    threshold: {
      1: 0.3,
    },
  },
  {
    name: NeedName.INGREDIENTS,
    items: [
      { item: EntityName.SUNFLOWER, tier: 1 },
      { item: EntityName.DAFFODIL, tier: 1 },
      { item: EntityName.BLUE_LOTUS, tier: 1 },
      { item: EntityName.CLARY_SAGE, tier: 1 },
      { item: EntityName.BELLADONNA, tier: 1 },
      { item: EntityName.BEARDED_TOOTH_FUNGUS, tier: 1 },
    ],
    consumption: {
      1: 0.3,
    },
    threshold: {
      1: 0.2,
    },
  },
];
