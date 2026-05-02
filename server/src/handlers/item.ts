import { Server, Socket } from "socket.io";
import { ComponentName, ConsumableConfig, EntityName, Event, Item } from "../types";
import { World } from "../World";
import { handlers } from ".";
import { configs } from "../configs/index.js";
import { MAX_MANA } from "../globals.js";

export const item = {
  collect: (data: Item, socket: Socket, io: Server, world: World) => {
    const player = world.players.getBySocketId(socket.id);
    if (player) player.inventory = handlers.storage.remove(player.inventory, data);

    world.items.add(data.name, data.quantity);
    socket.emit(Event.ITEM_REMOVE, data);
    handlers.broadcast.economy(io, world);
    handlers.broadcast.store(io, world);
  },

  consume: (data: { name: string }, socket: Socket, _io: Server, world: World) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player) return;

    const def = configs.entities[data.name as keyof typeof configs.entities];
    if (!def) return;

    const consumable = def.components.find(
      (c) => c.name === ComponentName.CONSUMABLE,
    );
    if (!consumable || consumable.name !== ComponentName.CONSUMABLE) return;

    const slot = player.inventory.find((s) => s?.name === data.name && s.quantity > 0);
    if (!slot) return;

    player.inventory = handlers.storage.remove(player.inventory, { name: data.name as EntityName, quantity: 1, stackable: true });
    socket.emit(Event.INVENTORY_SYNC, player.inventory);

    const config = consumable.config as ConsumableConfig;
    const { restore } = config;

    if (restore.health) {
      const health = Math.min(player.health + restore.health, player.maxHealth);
      world.players.update(player.id, { health });
      socket.emit(Event.PLAYER_HEALTH, health);
    }

    if (restore.mana) {
      const mana = Math.min(player.mana + restore.mana, MAX_MANA);
      world.players.update(player.id, { mana });
      socket.emit(Event.PLAYER_MANA, mana);
    }

    const effect = {
      name: config.effect,
      expiresAt: Date.now() + 1000,
      lastTickAt: Date.now(),
    };

    const existing = player.effects ?? [];
    existing.push(effect);
    world.players.update(player.id, { effects: existing });

    socket.emit(Event.EFFECT_APPLY, { id: player.id, effect });
  },
};
