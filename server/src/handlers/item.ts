import { Server, Socket } from "socket.io";
import {
  ComponentName,
  ConsumableConfig,
  EntityName,
  Event,
  Item,
  PartyStatus,
  PlayerConfig,
} from "../types";
import { DROP_LIFETIME } from "../globals.js";
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

  handOver: (
    data: { entityId: string },
    socket: Socket,
    io: Server,
    world: World,
  ) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player || player.locked !== data.entityId) return;

    const given = player.inventory.filter(
      (slot): slot is Item =>
        !!slot &&
        slot.quantity > 0 &&
        configs.collectables.has(slot.soul ?? slot.name),
    );

    if (!given.length) {
      handlers.dialogue.respond(
        socket,
        data.entityId,
        "You carry nothing the village has use for.",
      );
      return;
    }

    player.inventory = player.inventory.map((slot) =>
      slot && given.includes(slot) ? null : slot,
    );
    socket.emit(Event.INVENTORY_SYNC, player.inventory);

    item.donate(
      given.map((slot) => ({
        name: slot.soul ?? slot.name,
        quantity: slot.quantity,
      })),
      io,
      world,
    );

    const total = given.reduce((sum, slot) => sum + slot.quantity, 0);

    handlers.dialogue.respond(
      socket,
      data.entityId,
      `${total} ${total === 1 ? "item" : "items"} entered in the ledger. The village thanks you.`,
    );
  },

  droppable: (name: EntityName): boolean => {
    const pickable = configs.entities[name]?.components.find(
      (c) => c.name === ComponentName.PICKABLE,
    );
    if (!pickable || pickable.name !== ComponentName.PICKABLE) return false;

    return !pickable.config || pickable.config.item === name;
  },

  spill: (
    player: PlayerConfig,
    entry: Item,
    socket: Socket,
    world: World,
    jitter = 0,
  ) => {
    if (!item.droppable(entry.name)) return;

    const isInstanced = configs.maps[player.map].isInstanced;
    const party = world.parties.getByPlayerId(player.id);
    const relic = configs.relics.has(entry.name);

    const created = handlers.entity.create(
      {
        name: entry.name,
        map: player.map,
        x: player.x + (Math.random() * 2 - 1) * jitter,
        y: player.y + (Math.random() * 2 - 1) * jitter,
        health: 1,
        maxHealth: 1,
        isLocked: false,
        quantity: entry.quantity,
        soul: entry.soul,
        weight: entry.weight,
        dropped: !relic,
      },
      socket,
      world.server,
      world,
      isInstanced ? party?.id : undefined,
    );

    if (!relic) world.dropped.add(created.id);
  },

  give: (
    player: PlayerConfig,
    entries: Item[],
    socket: Socket,
    world: World,
  ) => {
    for (const entry of entries) {
      const fit = Math.min(
        entry.quantity,
        handlers.storage.room(player.inventory, entry),
      );

      if (fit > 0)
        player.inventory = handlers.storage.add(player.inventory, {
          ...entry,
          quantity: fit,
        });

      if (entry.quantity > fit)
        item.spill(
          player,
          { ...entry, quantity: entry.quantity - fit },
          socket,
          world,
          6,
        );
    }

    socket.emit(Event.INVENTORY_SYNC, player.inventory);
  },

  decay: (world: World, now: number) => {
    for (const id of world.dropped) {
      const entity = world.entities.get(id);

      if (!entity) {
        world.dropped.delete(id);
        continue;
      }

      if (now - entity.createdAt < DROP_LIFETIME) continue;

      world.dropped.delete(id);
      handlers.entity.remove(id, Event.ENTITY_DESPAWN, null, world.server, world);
    }
  },

  drop: (data: { index: number }, socket: Socket, world: World) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player) return;

    const slot = player.inventory[data.index];
    if (!slot || slot.quantity <= 0 || !item.droppable(slot.name)) return;

    if (configs.maps[player.map].isInstanced && configs.relics.has(slot.name))
      return;

    item.spill(player, slot, socket, world);

    const inventory = handlers.storage.clone(player.inventory);
    inventory[data.index] = null;
    player.inventory = inventory;

    socket.emit(Event.INVENTORY_SYNC, player.inventory);
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
      world.affected.add(player.id);

      socket.emit(Event.EFFECT_APPLY, { id: player.id, effect });
    }
  },
};
