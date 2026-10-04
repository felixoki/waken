import { Server } from "socket.io";
import { World } from "../World.js";
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
};
