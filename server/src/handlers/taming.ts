import { Server, Socket } from "socket.io";
import {
  ComponentConfig,
  ComponentName,
  EntityConfig,
  EntityName,
  Event,
  SlotType,
  TameState,
} from "../types";
import { World } from "../World";
import { configs } from "../configs";
import { handlers } from ".";

export const taming = {
  pacify: (entity: EntityConfig, socket: Socket, io: Server, world: World) => {
    if (entity.tame?.isPacified || entity.tame?.isTamed) return;

    world.entities.update(entity.id, {
      tame: { ...entity.tame, isPacified: true },
    });

    const key = world.chunks.getChunkByEntity(entity.id);
    const room = key ? `chunk:${key}` : socket.id;

    handlers.broadcast.room(socket, io, room, Event.ENTITY_PACIFIED, {
      id: entity.id,
    });
  },

  capture: (data: { id: string }, socket: Socket, io: Server, world: World) => {
    const player = world.players.getBySocketId(socket.id);
    const target = world.entities.get(data.id);

    if (!player || !target || !target.tame?.isPacified || target.isLocked)
      return;
    if (target.tame?.isTamed) return;

    const equipped = player.hotbar[player.active];
    if (
      !equipped ||
      equipped.type !== SlotType.ENTITY ||
      equipped.item.name !== EntityName.SOULSTONE ||
      equipped.item.soul
    )
      return;

    const definition = configs.entities[target.name];
    const tamable = definition?.components.find(
      (c: ComponentConfig) => c.name === ComponentName.TAMABLE,
    );

    if (!tamable) return;

    const soul =
      tamable.name === ComponentName.TAMABLE
        ? tamable.config.entity
        : target.name;

    const partyId = world.chunks.getPartyByEntity(target.id);
    const chunk = world.chunks.getChunkByEntity(target.id);
    const room =
      partyId && configs.maps[target.map].isInstanced
        ? `party:${partyId}`
        : chunk
          ? `chunk:${chunk}`
          : socket.id;

    world.chunks.removeEntity(target.id);
    world.entities.remove(target.id);

    handlers.broadcast.room(socket, io, room, Event.ENTITY_CAPTURE, {
      id: target.id,
      x: player.x,
      y: player.y,
    });

    const hotbar = [...player.hotbar];
    const quantity = equipped.item.quantity - 1;
    hotbar[player.active] =
      quantity > 0
        ? { ...equipped, item: { ...equipped.item, quantity } }
        : null;
    player.hotbar = hotbar;
    socket.emit(Event.HOTBAR_SYNC, player.hotbar);

    player.inventory = handlers.storage.add(player.inventory, {
      name: EntityName.SOULSTONE,
      quantity: 1,
      stackable: false,
      soul,
    });

    socket.emit(Event.INVENTORY_SYNC, player.inventory);
  },

  solidify: (
    data: { index: number },
    socket: Socket,
    io: Server,
    world: World,
  ) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player) return;

    const slot = player.inventory[data.index];
    if (!slot || slot.name !== EntityName.SOULSTONE || !slot.soul) return;

    const def = configs.entities[slot.soul];
    if (!def) return;

    const maxHealth = def.maxHealth ?? 1;

    const party = world.parties.getByPlayerId(player.id);
    const partyId = configs.maps[player.map].isInstanced
      ? party?.id
      : undefined;

    handlers.entity.create(
      {
        name: slot.soul,
        map: player.map,
        x: player.x,
        y: player.y + 24,
        health: maxHealth,
        maxHealth,
        isLocked: false,
        tame: { isTamed: true },
      },
      socket,
      io,
      world,
      partyId,
    );

    const inventory = handlers.storage.clone(player.inventory);
    inventory[data.index] = null;
    player.inventory = inventory;

    socket.emit(Event.INVENTORY_SYNC, player.inventory);
  },

  feed: (
    data: { id: string; food: EntityName },
    socket: Socket,
    io: Server,
    world: World,
  ) => {
    const player = world.players.getBySocketId(socket.id);
    const target = world.entities.get(data.id);

    if (!player || !target || !target.tame?.isTamed) return;

    const def = configs.entities[target.name];
    const feedable = def?.components.find(
      (c: ComponentConfig) => c.name === ComponentName.FEEDABLE,
    );

    if (!feedable || feedable.name !== ComponentName.FEEDABLE) return;
    if (!feedable.config.foods.includes(data.food)) return;

    if (
      target.tame?.fedAt &&
      Date.now() - target.tame.fedAt < feedable.config.duration
    )
      return;

    const index = player.hotbar.findIndex(
      (s) =>
        s?.type === SlotType.ENTITY &&
        s.item.name === data.food &&
        s.item.quantity > 0,
    );
    if (index === -1) return;

    const hotbar = [...player.hotbar];
    const slot = hotbar[index];

    if (slot?.type === SlotType.ENTITY) {
      const quantity = slot.item.quantity - 1;
      hotbar[index] =
        quantity > 0 ? { ...slot, item: { ...slot.item, quantity } } : null;
    }

    player.hotbar = hotbar;
    socket.emit(Event.HOTBAR_SYNC, player.hotbar);

    const fedAt = Date.now();
    world.entities.update(target.id, {
      tame: { ...target.tame, fedAt },
    });

    const key = world.chunks.getChunkByEntity(target.id);
    const room = key ? `chunk:${key}` : socket.id;

    handlers.broadcast.room(socket, io, room, Event.ENTITY_FEED, {
      id: target.id,
      fedAt,
    });

    const breedable = def?.components.find(
      (c: ComponentConfig) => c.name === ComponentName.BREEDABLE,
    );
    if (!breedable || breedable.name !== ComponentName.BREEDABLE) return;

    const now = Date.now();
    const onCooldown = (tame?: TameState) =>
      !!tame?.bredAt && now - tame.bredAt < breedable.config.cooldown;

    if (onCooldown(target.tame)) return;

    const partner = world.entities.getByMap(target.map).find((e) => {
      if (e.id === target.id || e.name !== target.name) return false;
      if (!e.tame?.isTamed) return false;
      if (!e.tame.fedAt || now - e.tame.fedAt >= feedable.config.duration)
        return false;
      if (onCooldown(e.tame)) return false;
      return (
        Math.hypot(e.x - target.x, e.y - target.y) <= breedable.config.range
      );
    });

    if (!partner) return;

    const childDef = configs.entities[breedable.config.child];
    const maxHealth = childDef?.maxHealth ?? 1;

    const party = world.parties.getByPlayerId(player.id);
    const partyId = configs.maps[player.map].isInstanced
      ? party?.id
      : undefined;

    handlers.entity.create(
      {
        name: breedable.config.child,
        map: target.map,
        x: (target.x + partner.x) / 2,
        y: (target.y + partner.y) / 2,
        health: maxHealth,
        maxHealth,
        isLocked: false,
        tame: { isTamed: true },
      },
      socket,
      io,
      world,
      partyId,
    );

    world.entities.update(target.id, {
      tame: { ...target.tame, bredAt: now },
    });
    world.entities.update(partner.id, {
      tame: { ...partner.tame, bredAt: now },
    });
  },

  mature: (data: { id: string }, socket: Socket, io: Server, world: World) => {
    const target = world.entities.get(data.id);
    if (!target) return;

    const def = configs.entities[target.name];
    const maturable = def?.components.find(
      (c: ComponentConfig) => c.name === ComponentName.MATURABLE,
    );
    if (!maturable || maturable.name !== ComponentName.MATURABLE) return;

    if (
      !target.createdAt ||
      Date.now() - target.createdAt < maturable.config.duration
    )
      return;

    const adultDef = configs.entities[maturable.config.adult];
    const maxHealth = adultDef?.maxHealth ?? target.maxHealth;

    const player = world.players.getBySocketId(socket.id);
    const party = player ? world.parties.getByPlayerId(player.id) : undefined;
    const partyId = configs.maps[target.map].isInstanced
      ? party?.id
      : undefined;

    const key = world.chunks.getChunkByEntity(target.id);
    const room = key ? `chunk:${key}` : socket.id;

    handlers.entity.remove(target.id, Event.ENTITY_DESPAWN, socket, io, world);

    handlers.entity.create(
      {
        name: maturable.config.adult,
        map: target.map,
        x: target.x,
        y: target.y,
        health: maxHealth,
        maxHealth,
        isLocked: false,
        tame: { isTamed: true },
      },
      socket,
      io,
      world,
      partyId,
    );

    handlers.broadcast.room(socket, io, room, Event.ENTITY_MATURE, {
      map: target.map,
      x: target.x,
      y: target.y,
    });
  },
};
