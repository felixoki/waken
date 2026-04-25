import { animations } from "./animations.js";
import { COMMON_CHOICES, COMMON_NODES } from "./dialogue.js";
import { effects, interactions } from "./effects.js";
import { entities } from "./entities/index.js";
import { maps } from "./maps.js";
import { needs } from "./needs.js";
import { spells } from "./spells.js";
import { tiers } from "./tiers.js";
import { time } from "./time.js";
import { weapons } from "./weapons.js";

export const configs = {
  animations,
  effects,
  interactions,
  entities,
  maps,
  spells,
  weapons,
  needs,
  tiers,
  dialogue: { choices: COMMON_CHOICES, nodes: COMMON_NODES },
  time,
};
