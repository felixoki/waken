import { combat } from "./combat";
import { direction } from "./direction";
import { interaction } from "./interaction";
import { move } from "./move";
import { physics } from "./physics";
import { spells } from "./spells";
import { state } from "./state";

export const handlers = {
  state,
  move,
  direction,
  physics,
  combat,
  spells,
  interaction,
};
