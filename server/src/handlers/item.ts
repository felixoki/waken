import { Server, Socket } from "socket.io";
import {
  ComponentName,
  ConsumableConfig,
  EntityName,
  Event,
  Item,
  PartyStatus,
} from "../types";
import { World } from "../World";
import { handlers } from ".";
import { configs } from "../configs/index.js";

export const item = {
  donate: (
    entries: { name: EntityName; quantity: number }[],
    io: Server,
    world: World,
  ) => {
    for (const entry of entries) world.items.add(entry.name, entry.quantity);

    handlers.broadcast.economy(io, world);
    handlers.broadcast.store(io, world);
  },

  collect: (data: Item, socket: Socket, io: Server, world: World) => {
    const player = world.players.getBySocketId(socket.id);
    if (player)
      player.inventory = handlers.storage.remove(player.inventory, data);

    socket.emit(Event.ITEM_REMOVE, data);
    item.donate([data], io, world);
  },

  consume: (
    data: { name: string },
    socket: Socket,
    io: Server,
    world: World,
  ) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player) return;

    const def = configs.entities[data.name as keyof typeof configs.entities];
    if (!def) return;

    const consumable = def.components.find(
      (c) => c.name === ComponentName.CONSUMABLE,
    );
    if (!consumable || consumable.name !== ComponentName.CONSUMABLE) return;

    const slot = player.inventory.find(
      (s) => s?.name === data.name && s.quantity > 0,
    );
    if (!slot) return;

    const config = consumable.config as ConsumableConfig;

    if (config.unlock !== undefined) {
      if (configs.maps[player.map].isInstanced) return;

      const party = world.parties.getByPlayerId(player.id);
      if (!party || party.status !== PartyStatus.LOBBY) return;

      party.unlocked = Math.max(party.unlocked, config.unlock);
      io.to(`party:${party.id}`).emit(Event.PARTY_UPDATE, party);
    }

    player.inventory = handlers.storage.remove(player.inventory, {
      name: data.name as EntityName,
      quantity: 1,
      stackable: true,
    });
    socket.emit(Event.INVENTORY_SYNC, player.inventory);

    const { restore } = config;

    if (restore?.health) {
      const health = Math.min(player.health + restore.health, player.maxHealth);
      world.players.update(player.id, { health });
      socket.emit(Event.PLAYER_HEALTH, health);
      socket
        .to(`map:${player.map}`)
        .emit(Event.PLAYER_HEALTH_SYNC, { id: player.id, health });
    }

    if (restore?.mana) {
      const mana = Math.min(player.mana + restore.mana, player.maxMana);
      world.players.update(player.id, { mana });
      socket.emit(Event.PLAYER_MANA, mana);
    }

    if (config.effect && config.duration) {
      const effect = {
        name: config.effect,
        expiresAt: Date.now() + config.duration,
        lastTickAt: Date.now(),
        ownerId: player.id,
      };

      const existing = player.effects ?? [];
      existing.push(effect);
      world.players.update(player.id, { effects: existing });

      socket.emit(Event.EFFECT_APPLY, { id: player.id, effect });
    }
  },
};
