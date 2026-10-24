import { EntityName } from './entities';
import { Mood } from './dialogue';
import { TimePhase } from './time';

export enum NeedName {
  FOOD = 'food',
  DRINKS = 'drinks',
  WARMTH = 'warmth',
  REST = 'rest',
  RESOURCES = 'resources',
  PLANTS = 'plants',
}

export enum GroupName {
  FRUIT = 'fruit',
  PROTEIN = 'protein',
  VEGETABLES = 'vegetables',
  BAKED = 'baked',
  MILK = 'milk',
  ALCOHOL = 'alcohol',
  CLOTHING = 'clothing',
  LIGHT = 'light',
  BEDDING = 'bedding',
  MATERIALS = 'materials',
  ANIMAL_PARTS = 'animalParts',
  RARE = 'rare',
  FLOWERS = 'flowers',
  HERBS = 'herbs',
  CROPS = 'crops',
  FUNGI = 'fungi',
}

export interface NeedGroup {
  name: GroupName;
  low: number;
}

export interface NeedItem {
  item: EntityName;
  tier: number;
  group: GroupName;
}

export interface NeedDemand {
  phases?: Partial<Record<TimePhase, number>>;
  rain?: number;
}

export interface NeedConfig {
  name: NeedName;
  tier: number;
  groups: NeedGroup[];
  items: NeedItem[];
  consumption: number;
  mood?: Mood;
  demand?: NeedDemand;
}

export type EconomySnapshot = {
  tier: number;
  canUpgrade: boolean;
  mood: Mood;
  needs: {
    name: NeedName;
    consumed: boolean;
    met: boolean;
    groups: {
      name: GroupName;
      required: boolean;
      met: boolean;
      needed: number;
      stocked: number;
      items: {
        item: EntityName;
        quantity: number;
        tier: number;
        stocked: boolean;
      }[];
    }[];
  }[];
};
