import { Server, Socket } from "socket.io";
import {
  ComponentConfig,
  ComponentName,
  EntityConfig,
  Hit,
  Item,
  PlayerConfig,
  Revive,
  SpellConfig,
  WeaponConfig,
} from "../types";
import { World } from "../World";
import { randomUUID } from "crypto";
import { configs } from "../configs";
import { REVIVE_MANA } from "../globals";
import { handlers } from ".";

export const combat = {
  getKnockback: (
    target: PlayerConfig | EntityConfig,
    attacker: PlayerConfig | EntityConfig,
    config: SpellConfig | WeaponConfig,
  ) => {
    const dx = target.x - attacker.x;
    const dy = target.y - attacker.y;

    const distance = Math.sqrt(dx * dx + dy * dy) || 1;

    const x = (dx / distance) * config.knockback;
    const y = (dy / distance) * config.knockback;

    return { x, y };
  },

  kill: {
    player: (
      player: PlayerConfig,
      attacker: PlayerConfig | EntityConfig,
      config: SpellConfig | WeaponConfig,
      socket: Socket,
      io: Server,
      world: World,
    ) => {
      world.players.update(player.id, { health: 0, isDead: true });

      const knockback = combat.getKnockback(player, attacker, config);
      const event = {
        id: player.id,
        health: 0,
        knockback,
        attackerId: attacker.id,
      };

      const key = world.chunks.toChunkKey(player.map, player.x, player.y);
      if (key) socket.to(`chunk:${key}`).emit("player:hurt", event);
      socket.emit("player:hurt", event);

      const party = world.parties.getByPlayerId(player.id);
      if (party) {
        const event = { id: player.id, x: player.x, y: player.y };
        io.to(`party:${party.id}`).emit("player:death", event);
        handlers.party.wipe(party.id, io, world);
      }
    },

    entity: (
      entity: EntityConfig,
      socket: Socket,
      io: Server,
      world: World,
    ) => {
      const chunkKey = world.chunks.getChunkByEntity(entity.id);
      world.chunks.removeEntity(entity.id);
      world.entities.remove(entity.id);

      const caller = world.players.getBySocketId(socket.id);
      const party = caller && world.parties.getByPlayerId(caller.id);

      if (party) io.to(`party:${party.id}`).emit("entity:destroy", entity.id);
      else {
        if (chunkKey)
          socket.to(`chunk:${chunkKey}`).emit("entity:destroy", entity.id);
        socket.emit("entity:destroy", entity.id);
      }

      const definition = configs.entities[entity.name];
      const damagable = definition?.components.find(
        (c: ComponentConfig) => c.name === ComponentName.DAMAGEABLE,
      );

      if (damagable && damagable.config) {
        const items = damagable.config.loot;

        items.forEach((entry: Item & { chance: number }) => {
          if (Math.random() > entry.chance) return;

          const item: EntityConfig = {
            id: randomUUID(),
            name: entry.name,
            map: entity.map,
            x: entity.x + (Math.random() - 0.5) * 32,
            y: entity.y + (Math.random() - 0.5) * 32,
            health: 100,
            createdAt: Date.now(),
          };

          world.entities.add(item.id, item);
          world.chunks.registerEntity(item.id, item.map, item.x, item.y);

          if (party) io.to(`party:${party.id}`).emit("entity:create", item);
          else {
            const key = world.chunks.getChunkByEntity(item.id);
            if (key) socket.to(`chunk:${key}`).emit("entity:create", item);
            socket.emit("entity:create", item);
          }
        });
      }
    },
  },

  hit: (data: Hit, socket: Socket, io: Server, world: World) => {
    const players = world.players;
    const entities = world.entities;

    const attacker =
      players.get(data.attackerId) || entities.get(data.attackerId);
    const entity = entities.get(data.targetId);
    const player = players.get(data.targetId);
    const target = entity || player;

    const config = data.config;

    if (!attacker || !target || !config || (player && player.isDead)) return;

    const health = target.health - config.damage;

    if (player && health <= 0) {
      combat.kill.player(player, attacker, config, socket, io, world);
      return;
    }

    if (entity && health <= 0) {
      combat.kill.entity(entity, socket, io, world);
      return;
    }

    const knockback = combat.getKnockback(target, attacker, config);

    if (player) players.update(target.id, { health });
    if (entity) entities.update(target.id, { ...target, health });

    const event = {
      id: target.id,
      health,
      knockback,
      attackerId: attacker.id,
    };

    const emit = entity ? "entity:hurt" : "player:hurt";
    const map = player?.map || entity?.map;
    const key = map
      ? world.chunks.toChunkKey(map, target.x, target.y)
      : undefined;

    if (key) socket.to(`chunk:${key}`).emit(emit, event);
    socket.emit(emit, event);
  },

  revive: (data: Revive, socket: Socket, io: Server, world: World) => {
    const reviver = world.players.getBySocketId(socket.id);
    if (!reviver || reviver.isDead) return;

    const target = world.players.get(data.id);
    if (!target || !target.isDead) return;

    const party = world.parties.getByPlayerId(reviver.id);
    if (!party || !party.members.includes(target.id)) return;

    if (reviver.mana < REVIVE_MANA) return;

    world.players.update(reviver.id, {
      mana: reviver.mana - REVIVE_MANA,
    });

    world.players.update(target.id, {
      isDead: false,
      health: 100,
      x: reviver.x,
      y: reviver.y,
    });

    socket.emit("player:mana", reviver.mana - REVIVE_MANA);

    const reviveEvent = {
      id: target.id,
      x: reviver.x,
      y: reviver.y,
      health: 100,
    };

    socket.emit("player:mana", reviver.mana - REVIVE_MANA);
    io.to(`party:${party.id}`).emit("player:revive", reviveEvent);
  },
};
