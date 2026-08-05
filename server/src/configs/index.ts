import { animations } from "./animations.js";
import { buildable } from "./buildable.js";
import { COMMON_CHOICES, COMMON_NODES } from "./dialogue.js";
import { effects, interactions } from "./effects.js";
import { entities } from "./entities/index.js";
import { maps } from "./maps.js";
import { needs } from "./needs.js";
import { sounds } from "./sounds.js";
import { spells } from "./spells.js";
import { tiers } from "./tiers.js";
import { time } from "./time.js";
import { weapons } from "./weapons.js";
import { zones } from "./zones.js";

export const configs = {
  animations,
  buildable,
  dialogue: { choices: COMMON_CHOICES, nodes: COMMON_NODES },
  effects,
  entities,
  interactions,
  maps,
  needs,
  sounds,
  spells,
  tiers,
  time,
  weapons,
  zones,
};
