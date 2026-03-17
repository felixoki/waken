import { chunks } from "./chunks.js";
import { combat } from "./combat.js";
import { dialogue } from "./dialogue.js";
import { entity } from "./entity.js";
import { generation } from "./generation.js";
import { host } from "./host.js";
import { item } from "./item.js";
import { party } from "./party.js";
import { player } from "./player.js";

export const handlers = {
  chunks,
  player,
  entity,
  item,
  combat,
  dialogue,
  generation,
  party,
  host
};
