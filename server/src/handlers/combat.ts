import { Socket } from "socket.io";
import { EntityConfig, Hit, PlayerConfig, SpellConfig } from "../types";
import { InstanceManager } from "../managers/Instance";

export const combat = {
  getKnockback: (
    target: PlayerConfig | EntityConfig,
    attacker: PlayerConfig | EntityConfig,
    config: SpellConfig
  ) => {
    const dx = target.x - attacker.x;
    const dy = target.y - attacker.y;

    const distance = Math.sqrt(dx * dx + dy * dy) || 1;

    const x = (dx / distance) * config.knockback;
    const y = (dy / distance) * config.knockback;

    return { x, y };
  },

  hit: (data: Hit, socket: Socket, instances: InstanceManager) => {
    const instance = instances.getBySocketId(socket.id);
    if (!instance) return;

    const players = instance.players;
    const entities = instance.entities;

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

    const knockback = combat.getKnockback(target, attacker, config);

    const event = {
      id: target.id,
      health: health,
      knockback: knockback,
    };

    const emit = entity ? "entity:hurt" : "player:hurt";

    socket.to(`game:${instance.id}:${target.map}`).emit(emit, event);
    socket.emit(emit, event);
  },
};
