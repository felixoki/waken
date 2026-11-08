import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { entities } from "./entities";
import { CHEST_LOOT } from "./biomes";
import { seeds } from "../types/farming";
import { ComponentName, EntityDefinition, EntityName } from "../types";

const definitions = Object.values(entities) as EntityDefinition[];

const cropsOf = (plant: EntityName) =>
  (entities[plant] as EntityDefinition).components.flatMap((component) =>
    component.name === ComponentName.GROWABLE
      ? component.config.yield.map((item) => item.name)
      : [],
  );

const dropped = new Set<EntityName>([
  ...CHEST_LOOT.map((item) => item.name),
  ...definitions.flatMap((definition) =>
    definition.components.flatMap((component) =>
      component.name === ComponentName.DAMAGEABLE
        ? (component.config?.loot ?? []).map((item) => item.name)
        : [],
    ),
  ),
]);

const recipes = definitions.flatMap((definition) =>
  definition.components.flatMap((component) =>
    component.name === ComponentName.CRAFTER ? component.config.recipes : [],
  ),
);

describe("seed sources", () => {
  for (const [seed, plant] of Object.entries(seeds) as [EntityName, EntityName][])
    test(`${seed} has a source that does not need its own crop`, () => {
      const crops = cropsOf(plant);
      const crafted = recipes.some(
        (recipe) =>
          recipe.output === seed &&
          !recipe.ingredients.some((ingredient) =>
            crops.includes(ingredient.item),
          ),
      );
      assert.ok(dropped.has(seed) || crafted);
    });
});
