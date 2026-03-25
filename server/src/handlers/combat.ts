import { Socket } from "socket.io";
import {
  ComponentConfig,
  ComponentName,
  EntityConfig,
  Hit,
  Item,
  PlayerConfig,
  SpellConfig,
  WeaponConfig,
} from "../types";
import { World } from "../World";
import { randomUUID } from "crypto";
import { configs } from "../configs";

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

  hit: (data: Hit, socket: Socket, world: World) => {
    const players = world.players;
    const entities = world.entities;

    const attacker =
      players.get(data.attackerId) || entities.get(data.attackerId);
    const entity = entities.get(data.targetId);
    const player = players.get(data.targetId);
    const target = entity || player;

    const config = data.config;

    if (!attacker || !target || !config) return;

    /**
     * We will later add logic for critical hits, resistances, etc.
     */
    const health = target.health - config.damage;

    if (entity) entities.update(target.id, { ...target, health: health });
    if (player) players.update(target.id, { ...target, health: health });

    if (entity && health <= 0) {
      entities.remove(entity.id);

      const key = world.chunks.getChunkByEntity(entity.id);
      if (key) socket.to(`chunk:${key}`).emit("entity:destroy", entity.id);
      socket.emit("entity:destroy", entity.id);

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

          const key = world.chunks.getChunkByEntity(item.id);
          if (key) socket.to(`chunk:${key}`).emit("entity:create", item);
          socket.emit("entity:create", item);
        });
      }

      return;
    }

    const knockback = combat.getKnockback(target, attacker, config);

    const event = {
      id: target.id,
      health: health,
      knockback: knockback,
      attackerId: attacker.id,
    };

    const emit = entity ? "entity:hurt" : "player:hurt";
    const key = world.chunks.getChunkByEntity(target.id);

    if (key) socket.to(`chunk:${key}`).emit(emit, event);
    socket.emit(emit, event);
  },
};
