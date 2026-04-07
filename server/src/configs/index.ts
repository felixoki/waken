import { animations } from "./animations.js";
import { COMMON_CHOICES, COMMON_NODES } from "./dialogue.js";
import { entities } from "./entities/index.js";
import { maps } from "./maps.js";
import { needs } from "./needs.js";
import { spells } from "./spells.js";
import { time } from "./time.js";
import { weapons } from "./weapons.js";

export const configs = {
  animations,
  entities,
  maps,
  spells,
  weapons,
  needs,
  dialogue: { choices: COMMON_CHOICES, nodes: COMMON_NODES },
  time,
};
