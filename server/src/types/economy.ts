import { EntityName } from './entities';
import { Mood } from './dialogue';

export enum NeedName {
  FOOD = 'food',
  DRINKS = 'drinks',
  COMFORT = 'comfort',
  RESOURCES = 'resources',
  PLANTS = 'plants',
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
  canUpgrade: boolean;
  needs: {
    name: NeedName;
    consumed: boolean;
    items: { item: EntityName; quantity: number; tier: number }[];
  }[];
};