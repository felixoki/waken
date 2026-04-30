import { EntityName } from './entities';

export enum NeedName {
  FOOD = 'food',
  RESOURCES = 'resources',
  INGREDIENTS = 'ingredients',
  CLOTHS = 'cloths',
}

export interface Tier {
  item: EntityName;
  tier: number;
}

export interface NeedConfig {
  name: NeedName;
  items: Tier[];
  consumption: Record<number, number>;
  threshold: Record<number, number>;
}

export type EconomySnapshot = {
  tier: number;
  needs: {
    name: NeedName;
    items: { item: EntityName; quantity: number }[];
  }[];
};