import { animations } from "./animations.js";
import { buildable } from "./buildable.js";
import { COMMON_CHOICES, COMMON_NODES } from "./dialogue.js";
import { effects, interactions } from "./effects.js";
import { entities } from "./entities/index.js";
import { fish } from "./fish.js";
import { maps } from "./maps.js";
import { needs } from "./needs.js";
import { sounds } from "./sounds.js";
import { spells } from "./spells.js";
import { tiers } from "./tiers.js";
import { time } from "./time.js";
import { weapons } from "./weapons.js";
import { zones } from "./zones.js";
import { ComponentName } from "../types/components.js";
import { EntityDefinition, EntityName } from "../types/entities.js";

const landmarks = new Set(
  (Object.entries(entities) as [EntityName, EntityDefinition][])
    .filter(([, definition]) =>
      definition.components.some(
        (component) => component.name === ComponentName.TRACKABLE,
      ),
    )
    .map(([name]) => name),
);

const collectables = new Set<EntityName>([
  ...needs.flatMap((need) => need.items.map((entry) => entry.item)),
  ...tiers.flatMap((tier) => tier.requirements.map((entry) => entry.item)),
  ...Object.values(entities).flatMap((definition) =>
    definition.components.flatMap((component) =>
      component.name === ComponentName.CRAFTER
        ? component.config.recipes.flatMap((recipe) =>
            recipe.ingredients.map((ingredient) => ingredient.item),
          )
        : [],
    ),
  ),
]);

export const configs = {
  animations,
  buildable,
  collectables,
  dialogue: { choices: COMMON_CHOICES, nodes: COMMON_NODES },
  effects,
  entities,
  fish,
  interactions,
  landmarks,
  maps,
  needs,
  sounds,
  spells,
  tiers,
  time,
  weapons,
  zones,
};
