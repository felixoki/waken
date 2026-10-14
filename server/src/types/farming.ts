import { EntityName } from "./entities";

export enum GrowthStage {
  SEED = "seed",
  SPROUT = "sprout",
  MATURE = "mature",
}

export interface GrowthStageConfig {
  stage: GrowthStage;
  at: number;
  tiles: { row: number; start: number; end: number }[];
  offsetY?: number;
}

export const seeds: Partial<Record<EntityName, EntityName>> = {
  [EntityName.CARROT_SEED]: EntityName.CARROT_PLANT,
  [EntityName.TOMATO_SEED]: EntityName.TOMATO_PLANT,
  [EntityName.CABBAGE_SEED]: EntityName.CABBAGE_PLANT,
  [EntityName.WHEAT_SEED]: EntityName.WHEAT_PLANT,
  [EntityName.GRAPE_SEED]: EntityName.GRAPE_PLANT,
  [EntityName.HOPS_SEED]: EntityName.HOPS_PLANT,
};
