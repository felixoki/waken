import { EntityName } from './entities';

export interface Ingredient {
  item: EntityName;
  quantity: number;
}

export interface Recipe {
  tier: number;
  output: EntityName;
  quantity: number;
  ingredients: Ingredient[];
}

export interface CrafterConfig {
  recipes: Recipe[];
}
