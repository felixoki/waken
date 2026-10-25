import { Server, Socket } from "socket.io";
import { ComponentName, EntityName, ImprovementName } from "../types/index.js";
import { RANGE_INTERACTING } from "../globals.js";
import { World } from "../World.js";
import { configs } from "../configs/index.js";
import { handlers } from "./index.js";

export const crafter = {
  craft: (
    data: { crafter: EntityName; output: EntityName; entityId?: string },
    socket: Socket,
    io: Server,
    world: World,
  ) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player) return;

    const entity = data.entityId && world.entities.get(data.entityId);
    const near =
      !!entity &&
      entity.name === data.crafter &&
      entity.map === player.map &&
      Math.hypot(entity.x - player.x, entity.y - player.y) <= RANGE_INTERACTING;

    if (!near && !world.economy.has(ImprovementName.ORDERS)) return;

    const def = configs.entities[data.crafter];
    if (!def) return;

    const component = def.components.find(
      (c) => c.name === ComponentName.CRAFTER,
    );
    if (!component || component.name !== ComponentName.CRAFTER) return;

    const { recipes } = component.config;
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

    handlers.item.give(
      player,
      [{ name: data.output, quantity: recipe.quantity, stackable }],
      socket,
      world,
    );
    handlers.broadcast.store(io, world);
    handlers.broadcast.economy(io, world);
  },
};
