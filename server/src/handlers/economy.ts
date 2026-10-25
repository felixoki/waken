import { Server } from "socket.io";
import { World } from "../World.js";
import { ImprovementName } from "../types/index.js";
import { configs } from "../configs/index.js";
import { handlers } from "./index.js";

export const economy = {
  upgrade: (io: Server, world: World) => {
    const nextTier = world.economy.getTier() + 1;
    const upgrade = configs.tiers.find((t) => t.tier === nextTier);
    if (!upgrade || !world.economy.canUpgrade()) return;

    const canAfford = upgrade.requirements.every((req) =>
      world.items.has(req.item, req.quantity),
    );
    if (!canAfford) return;

    for (const req of upgrade.requirements)
      world.items.remove(req.item, req.quantity);

    world.economy.upgradeTier();
    handlers.broadcast.store(io, world);
  },

  improve: (data: { name: ImprovementName }, io: Server, world: World) => {
    const improvement = configs.improvements[data.name];
    if (!improvement || world.economy.has(data.name)) return;
    if (improvement.tier > world.economy.getTier()) return;

    const canAfford = improvement.cost.every((req) =>
      world.items.has(req.item, req.quantity),
    );
    if (!canAfford) return;

    for (const req of improvement.cost)
      world.items.remove(req.item, req.quantity);

    world.economy.improve(data.name);
    handlers.broadcast.store(io, world);
  },
};
