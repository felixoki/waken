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
import { collection } from "./collection";

export const handlers = {
  state,
  move,
  direction,
  physics,
  combat,
  player,
  spells,
  weapons,
  dialogue,
  collection,
  vision,
  path,
};
