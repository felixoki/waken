import { Socket } from "socket.io";
import {
  ComponentName,
  EntityConfig,
  Hit,
  PlayerConfig,
  SpellConfig,
  WeaponConfig,
} from "../types";
import { World } from "../World";
import { configs } from "../configs";
import { randomUUID } from "crypto";

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

      socket.to(`map:${entity.map}`).emit("entity:destroy", { id: entity.id });
      socket.emit("entity:destroy", { id: entity.id });

      const definition = configs.definitions[entity.name];
      const damagable = definition?.components.find(
        (c) => c.name === ComponentName.DAMAGEABLE,
      );

      if (damagable && damagable.config) {
        const loot = damagable.config.loot;

        loot.forEach((entry) => {
          if (Math.random() > entry.chance) return;

          const item: EntityConfig = {
            id: randomUUID(),
            name: entry.name,
            map: entity.map,
            x: entity.x + (Math.random() - 0.5) * 32,
            y: entity.y + (Math.random() - 0.5) * 32,
            health: 100,
          };

          world.entities.add(item.id, item);

          socket.to(`map:${entity.map}`).emit("entity:create", item);
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
    };

    const emit = entity ? "entity:hurt" : "player:hurt";

    socket.to(`map:${target.map}`).emit(emit, event);
    socket.emit(emit, event);
  },
};
