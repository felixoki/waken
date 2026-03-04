import { animations } from "./animations";
import { COMMON_CHOICES, COMMON_NODES } from "./dialogue";
import { entities } from "./entities";
import { maps } from "./maps";
import { needs } from "./needs";
import { spells } from "./spells";
import { time } from "./time";
import { weapons } from "./weapons";

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
