import { Ingredient } from "./crafter.js";

export enum ImprovementName {
  STORAGE = "storage",
  COURIER = "courier",
  ORDERS = "orders",
}

export interface Improvement {
  tier: number;
  cost: Ingredient[];
  displayName: string;
  description: string;
}
