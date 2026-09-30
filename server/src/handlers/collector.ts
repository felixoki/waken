import { Server, Socket } from "socket.io";
import { ComponentName, EntityName, Event } from "../types/index.js";
import { World } from "../World.js";
import { configs } from "../configs/index.js";
import { handlers } from "./index.js";

export const collector = {
  craft: (
    data: { entityId: string; output: EntityName },
    socket: Socket,
    io: Server,
    world: World,
  ) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player) return;

    const entity = world.entities.get(data.entityId);
    if (!entity) return;

    const def = configs.entities[entity.name];
    if (!def) return;

    const collectorComp = def.components.find(
      (c) => c.name === ComponentName.COLLECTOR,
    );
    if (!collectorComp || collectorComp.name !== ComponentName.COLLECTOR)
      return;

    const { recipes } = collectorComp.config;
    const currentTier = world.economy.getTier();

    const recipe = recipes.find(
      (r) => r.output === data.output && r.tier <= currentTier,
    );
    if (!recipe) return;

    const canAfford = recipe.ingredients.every((ing) =>
      world.items.has(ing.item, ing.quantity),
    );
    if (!canAfford) return;

    for (const ing of recipe.ingredients)
      world.items.remove(ing.item, ing.quantity);

    const outputDef = configs.entities[data.output];
    const stackable = outputDef?.metadata?.stackable ?? false;

    player.inventory = handlers.storage.add(player.inventory, {
      name: data.output,
      quantity: recipe.quantity,
      stackable,
    });

    socket.emit(Event.INVENTORY_SYNC, player.inventory);
    handlers.broadcast.store(io, world);
    handlers.broadcast.economy(io, world);
  },

  upgrade: (_socket: Socket, io: Server, world: World) => {
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
