import { combat } from "./combat";
import { direction } from "./direction";
import { dialogue } from "./dialogue";
import { move } from "./move";
import { path } from "./path";
import { physics } from "./physics";
import { player } from "./player";
import { spells } from "./spells";
import { state } from "./state";
import { vision } from "./vision";
import { weapons } from "./weapons";
import { behavior } from "./behavior";
import { charge } from "./charge";

export const handlers = {
  state,
  move,
  direction,
  physics,
  charge,
  combat,
  player,
  spells,
  weapons,
  dialogue,
  vision,
  path,
  behavior,
};
