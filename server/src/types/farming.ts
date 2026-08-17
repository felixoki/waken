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
  [EntityName.CARROT_SEED]: EntityName.CARROT,
  [EntityName.TOMATO_SEED]: EntityName.TOMATO,
  [EntityName.CABBAGE_SEED]: EntityName.CABBAGE,
  [EntityName.WHEAT_SEED]: EntityName.WHEAT,
  [EntityName.GRAPE_SEED]: EntityName.GRAPE,
  [EntityName.HOPS_SEED]: EntityName.HOPS,
};
