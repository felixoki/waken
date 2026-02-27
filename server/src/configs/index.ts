import { animations } from "./animations";
import { COMMON_CHOICES, COMMON_NODES } from "./dialogue";
import { maps } from "./maps";
import { needs } from "./needs";
import { spells } from "./spells";
import { weapons } from "./weapons";

export const configs = {
  animations,
  maps,
  spells,
  weapons,
  needs,
  dialogue: { choices: COMMON_CHOICES, nodes: COMMON_NODES },
};
