import { EntityName } from './entities';
import { Mood } from './dialogue';

export enum NeedName {
  FOOD = 'food',
  RESOURCES = 'resources',
  INGREDIENTS = 'ingredients',
  CLOTHS = 'cloths',
  DRINKS = 'drinks',
}

export interface Tier {
  item: EntityName;
  tier: number;
}

export interface NeedConfig {
  name: NeedName;
  tier: number;
  items: Tier[];
  consumption: number;
  low: number;
  mood?: Mood;
}

export type EconomySnapshot = {
  tier: number;
  needs: {
    name: NeedName;
    items: { item: EntityName; quantity: number }[];
  }[];
};