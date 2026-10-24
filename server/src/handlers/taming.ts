import { Server, Socket } from "socket.io";
import {
  CapturableConfig,
  ComponentConfig,
  ComponentName,
  EntityConfig,
  EntityName,
  Event,
  SlotType,
  StoryFlag,
  TameState,
} from "../types";
import { World } from "../World";
import { configs } from "../configs";
import { handlers } from ".";

export const taming = {
  capturable: (name: EntityName): CapturableConfig | undefined =>
    configs.entities[name]?.components.find(
      (c): c is Extract<ComponentConfig, { name: ComponentName.CAPTURABLE }> =>
        c.name === ComponentName.CAPTURABLE,
    )?.config,

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

  follow: (entity: EntityConfig, io: Server, world: World) =>
    handlers.broadcast.entity(
      io,
      world,
      Event.ENTITY_FOLLOW,
      { id: entity.id, tame: entity.tame },
      entity.map,
      world.chunks.getChunkByEntity(entity.id),
    ),

  settle: (entity: EntityConfig, io: Server, world: World) => {
    world.entities.update(entity.id, {
      tame: { ...entity.tame, follows: undefined, settled: true },
    });
    taming.follow(world.entities.get(entity.id) ?? entity, io, world);
  },

  release: (playerId: string, io: Server, world: World) => {
    for (const entity of world.entities.all) {
      if (entity.tame?.follows !== playerId) continue;

      world.entities.update(entity.id, {
        tame: { ...entity.tame, follows: undefined },
      });
      taming.follow(world.entities.get(entity.id) ?? entity, io, world);
    }
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

    const capturable = taming.capturable(target.name);
    if (!capturable) return;

    const soul = capturable.soul;

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

    if (soul === EntityName.SHADOW_WANDERER)
      handlers.story.remember(player, StoryFlag.SOULS_CAUGHT, world);

    handlers.item.give(
      player,
      [{ name: EntityName.SOULSTONE, quantity: 1, stackable: false, soul }],
      socket,
      world,
    );
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
    if (!def || taming.capturable(slot.soul)?.solidifiable === false) return;

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

    if (!player || !target) return;

    const def = configs.entities[target.name];
    const feedable = def?.components.find(
      (c: ComponentConfig) => c.name === ComponentName.FEEDABLE,
    );

    if (!feedable || feedable.name !== ComponentName.FEEDABLE) return;
    if (!feedable.config.foods.includes(data.food)) return;

    const follows =
      !!feedable.config.follows &&
      !target.tame?.isTamed &&
      !target.tame?.settled;

    if (!target.tame?.isTamed && !follows) return;
    if (follows && target.tame?.follows === player.id) return;

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
      tame: { ...target.tame, fedAt, ...(follows && { follows: player.id }) },
    });

    const key = world.chunks.getChunkByEntity(target.id);
    const room = key ? `chunk:${key}` : socket.id;

    handlers.broadcast.room(socket, io, room, Event.ENTITY_FEED, {
      id: target.id,
      fedAt,
    });

    if (follows) {
      taming.follow(target, io, world);
      return;
    }

    const breedable = def?.components.find(
      (c: ComponentConfig) => c.name === ComponentName.BREEDABLE,
    );
    if (!breedable || breedable.name !== ComponentName.BREEDABLE) return;

    const now = Date.now();
    const onCooldown = (tame?: TameState) =>
      !!tame?.bredAt && now - tame.bredAt < breedable.config.cooldown;

    if (onCooldown(target.tame)) return;

    const sire = breedable.config.sire;

    const partner = world.entities.getByMap(target.map).find((e) => {
      if (e.id === target.id || e.name !== (sire ?? target.name)) return false;
      if (sire)
        return (
          Math.hypot(e.x - target.x, e.y - target.y) <= breedable.config.range
        );
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
    if (!sire)
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

  lay: (data: { id: string }, socket: Socket, io: Server, world: World) => {
    const target = world.entities.get(data.id);
    if (!target || !target.tame?.isTamed) return;

    const def = configs.entities[target.name];
    const layable = def?.components.find(
      (c: ComponentConfig) => c.name === ComponentName.LAYABLE,
    );
    const feedable = def?.components.find(
      (c: ComponentConfig) => c.name === ComponentName.FEEDABLE,
    );

    if (!layable || layable.name !== ComponentName.LAYABLE) return;
    if (!feedable || feedable.name !== ComponentName.FEEDABLE) return;

    const now = Date.now();

    if (
      !target.tame.fedAt ||
      now - target.tame.fedAt >= feedable.config.duration
    )
      return;

    if (target.tame.bredAt && now - target.tame.bredAt < layable.config.cooldown)
      return;

    const rooster = world.entities.getByMap(target.map).find((e) => {
      if (e.name !== EntityName.ROOSTER) return false;
      return (
        Math.hypot(e.x - target.x, e.y - target.y) <= layable.config.range
      );
    });

    if (!rooster) return;

    const eggDef = configs.entities[layable.config.egg];
    const maxHealth = eggDef?.maxHealth ?? 1;

    const player = world.players.getBySocketId(socket.id);
    const party = player ? world.parties.getByPlayerId(player.id) : undefined;
    const partyId = configs.maps[target.map].isInstanced ? party?.id : undefined;

    handlers.entity.create(
      {
        name: layable.config.egg,
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

    world.entities.update(target.id, {
      tame: { ...target.tame, bredAt: now },
    });

    const key = world.chunks.getChunkByEntity(target.id);
    const room = key ? `chunk:${key}` : socket.id;

    handlers.broadcast.room(socket, io, room, Event.ENTITY_LAY, {
      id: target.id,
      bredAt: now,
    });
  },

  milk: (data: { id: string }, socket: Socket, io: Server, world: World) => {
    const player = world.players.getBySocketId(socket.id);
    const target = world.entities.get(data.id);

    if (!player || !target || !target.tame?.isTamed) return;

    const milkable = configs.entities[target.name]?.components.find(
      (c): c is Extract<ComponentConfig, { name: ComponentName.MILKABLE }> =>
        c.name === ComponentName.MILKABLE,
    )?.config;
    if (!milkable) return;

    const equipped = player.hotbar[player.active];
    if (
      equipped?.type !== SlotType.ENTITY ||
      equipped.item.name !== EntityName.BUCKET
    )
      return;

    const now = Date.now();
    if (target.tame.milkedAt && now - target.tame.milkedAt < milkable.cooldown)
      return;

    const item = { name: milkable.milk, quantity: 1, stackable: true };
    if (!handlers.storage.fits(player.inventory, item)) return;

    player.inventory = handlers.storage.add(player.inventory, item);
    socket.emit(Event.INVENTORY_SYNC, player.inventory);

    world.entities.update(target.id, {
      tame: { ...target.tame, milkedAt: now },
    });

    const key = world.chunks.getChunkByEntity(target.id);
    const room = key ? `chunk:${key}` : socket.id;

    handlers.broadcast.room(socket, io, room, Event.ENTITY_MILK, {
      id: target.id,
      milkedAt: now,
    });
  },
};
