import { Server, Socket } from "socket.io";
import {
  ComponentConfig,
  ComponentName,
  CombatConfig,
  EntityConfig,
  Event,
  Hit,
  Item,
  PlayerConfig,
  Revive,
} from "../types";
import { Effect, EffectName } from "../types/effects.js";
import { DamageType } from "../types/damage.js";
import { World } from "../World";
import { configs } from "../configs";
import {
  REVIVE_MANA,
  MISS_CHANCE,
  CRIT_CHANCE,
  CRIT_MULTIPLIER,
  RESISTANCE_MULTIPLIER,
  WEAKNESS_MULTIPLIER,
  MAX_HEALTH,
} from "../globals";
import { handlers } from ".";

export const combat = {
  getKnockback: (
    target: PlayerConfig | EntityConfig,
    attacker: PlayerConfig | EntityConfig,
    config: CombatConfig,
  ) => {
    const dx = target.x - attacker.x;
    const dy = target.y - attacker.y;

    const distance = Math.sqrt(dx * dx + dy * dy) || 1;

    const x = (dx / distance) * config.knockback;
    const y = (dy / distance) * config.knockback;

    return { x, y };
  },

  calculateDamage: (
    target: PlayerConfig | EntityConfig,
    config: CombatConfig,
    isEntity: boolean,
  ): { damage: number; isMiss: boolean; isCritical: boolean } => {
    if (Math.random() < MISS_CHANCE)
      return { damage: 0, isMiss: true, isCritical: false };

    let damage = config.damage.amount;
    const damageType: DamageType = config.damage.type;

    if (isEntity) {
      const definition = configs.entities[(target as EntityConfig).name];
      const damageable = definition?.components.find(
        (c: ComponentConfig) => c.name === ComponentName.DAMAGEABLE,
      );

      if (damageable && damageable.config) {
        const { resistances, weaknesses } = damageable.config;
        if (resistances?.includes(damageType)) damage *= RESISTANCE_MULTIPLIER;
        if (weaknesses?.includes(damageType)) damage *= WEAKNESS_MULTIPLIER;
      }
    }

    const activeEffects: Effect[] = target.effects ?? [];

    for (const effect of activeEffects) {
      const multiplier = configs.interactions[effect.name]?.[damageType];
      if (multiplier !== undefined) damage *= multiplier;
    }

    const isCritical = Math.random() < CRIT_CHANCE;
    if (isCritical) damage *= CRIT_MULTIPLIER;

    return { damage: Math.floor(damage), isMiss: false, isCritical };
  },

  kill: {
    player: (
      player: PlayerConfig,
      attacker: PlayerConfig | EntityConfig,
      config: CombatConfig,
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

      const party = world.parties.getByPlayerId(player.id);
      const partyId = configs.maps[player.map].isInstanced
        ? party?.id
        : undefined;

      const key = world.chunks.toChunkKey(
        player.map,
        player.x,
        player.y,
        partyId,
      );
      if (key) socket.to(`chunk:${key}`).emit(Event.PLAYER_HURT, event);
      socket.emit(Event.PLAYER_HURT, event);

      if (party) {
        const event = { id: player.id, x: player.x, y: player.y };
        io.to(`party:${party.id}`).emit(Event.PLAYER_DEATH, event);
        handlers.party.wipe(party.id, io, world);
      }
    },

    entity: (
      target: EntityConfig,
      socket: Socket,
      io: Server,
      world: World,
    ) => {
      handlers.entity.remove(
        target.id,
        Event.ENTITY_DESTROY,
        socket,
        io,
        world,
      );

      const player = world.players.getBySocketId(socket.id);
      const party = player && world.parties.getByPlayerId(player.id);
      const partyId = configs.maps[target.map].isInstanced
        ? party?.id
        : undefined;

      const definition = configs.entities[target.name];
      const damagable = definition?.components.find(
        (c: ComponentConfig) => c.name === ComponentName.DAMAGEABLE,
      );

      if (damagable && damagable.config) {
        const items = damagable.config.loot;

        items.forEach((entry: Item & { chance: number }) => {
          if (Math.random() > entry.chance) return;

          handlers.entity.create(
            {
              name: entry.name,
              map: target.map,
              x: target.x + (Math.random() - 0.5) * 32,
              y: target.y + (Math.random() - 0.5) * 32,
              health: MAX_HEALTH,
              maxHealth: MAX_HEALTH,
              isLocked: false,
            },
            socket,
            io,
            world,
            partyId,
          );
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

    if (
      !attacker ||
      !target ||
      !config ||
      (player && player.isDead) ||
      attacker.health <= 0
    )
      return;

    const { damage, isMiss, isCritical } = combat.calculateDamage(
      target,
      config,
      !!entity,
    );
    const health = target.health - damage;

    if (!isMiss && "lifesteal" in config && config.lifesteal) {
      const caster = players.get(data.attackerId);

      if (caster && !caster.isDead) {
        const drained = Math.min(damage, target.health) * config.lifesteal;
        const healed = Math.min(
          caster.health + drained,
          caster.maxHealth || MAX_HEALTH,
        );

        if (healed !== caster.health) {
          players.update(caster.id, { health: healed });
          io.to(caster.socketId).emit(Event.PLAYER_HEALTH, healed);
          io.to(`map:${caster.map}`)
            .except(caster.socketId)
            .emit(Event.PLAYER_HEALTH_SYNC, { id: caster.id, health: healed });
        }
      }
    }

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
    if (entity) entities.update(target.id, { health });

    const key = entity
      ? world.chunks.getChunkByEntity(target.id)
      : (() => {
          const map = player?.map;

          if (!map) return undefined;

          const party = world.parties.getByPlayerId(player!.id);
          const partyId = configs.maps[map].isInstanced ? party?.id : undefined;

          return world.chunks.toChunkKey(map, target.x, target.y, partyId);
        })();

    const event = {
      id: target.id,
      health,
      knockback,
      attackerId: attacker.id,
      isMiss,
      isCritical,
    };

    const emit = entity ? Event.ENTITY_HURT : Event.PLAYER_HURT;

    if (key) socket.to(`chunk:${key}`).emit(emit, event);
    socket.emit(emit, event);

    if (!isMiss)
      combat.effects.apply(
        target.id,
        !!entity,
        config,
        world,
        Date.now(),
        key,
        socket,
        attacker.id,
      );
  },

  effects: {
    apply: (
      targetId: string,
      isEntity: boolean,
      config: CombatConfig,
      world: World,
      now: number,
      key: string | undefined,
      socket: Socket,
      attackerId?: string,
    ) => {
      const store = isEntity ? world.entities : world.players;
      const target = store.get(targetId);

      if (!target) return;

      const effects: [EffectName, number, number?][] = [
        ...(config.effects ?? []),
      ];

      if (attackerId) {
        const inventory = world.players.get(attackerId)?.inventory ?? [];
        const isSpell = "mana" in config;

        for (const slot of inventory) {
          if (!slot) continue;

          for (const bonus of configs.entities[slot.name]?.bonuses ?? [])
            if (
              (isSpell && bonus.spell === config.name) ||
              (!isSpell && bonus.weapon === config.name)
            )
              effects.push(...bonus.effects);
        }
      }

      if (!effects.length) return;

      const existing: Effect[] = target.effects ?? [];

      for (const [name, duration, chance] of effects) {
        if (chance !== undefined && Math.random() > chance) continue;

        const effect: Effect = {
          name,
          expiresAt: now + duration,
          lastTickAt: now,
        };
        existing.push(effect);

        const applyEvent = { id: targetId, effect };
        if (key) socket.to(`chunk:${key}`).emit(Event.EFFECT_APPLY, applyEvent);
        socket.emit(Event.EFFECT_APPLY, applyEvent);
      }

      store.update(targetId, { effects: existing });
      world.affected.add(targetId);
    },

    tick: (world: World, io: Server, now: number) => {
      for (const id of world.affected) {
        const isEntity = !!world.entities.get(id);
        const store = isEntity ? world.entities : world.players;
        const target = store.get(id);

        if (!target?.effects?.length) {
          world.affected.delete(id);
          continue;
        }

        const chunkKey = isEntity
          ? world.chunks.getChunkByEntity(id)
          : undefined;
        const playerSocketId = !isEntity
          ? (target as ReturnType<typeof world.players.get>)?.socketId
          : undefined;

        const emit = (event: Event, data: object) => {
          if (chunkKey) io.to(`chunk:${chunkKey}`).emit(event, data);
          if (playerSocketId) io.to(playerSocketId).emit(event, data);
        };

        const remaining: Effect[] = [];

        for (const effect of target.effects) {
          if (now >= effect.expiresAt) {
            emit(Event.EFFECT_REMOVE, { id, name: effect.name });
            continue;
          }

          const definition = configs.effects[effect.name];
          if (
            definition.interval &&
            definition.damage &&
            effect.lastTickAt !== undefined &&
            now - effect.lastTickAt >= definition.interval
          ) {
            const newHealth = Math.max(0, target.health - definition.damage);
            store.update(id, { health: newHealth });
            effect.lastTickAt = now;

            const hurtEvent = isEntity ? Event.ENTITY_HURT : Event.PLAYER_HURT;
            emit(hurtEvent, {
              id,
              health: newHealth,
              knockback: { x: 0, y: 0 },
              attackerId: id,
            });
          }

          remaining.push(effect);
        }

        store.update(id, { effects: remaining });

        if (!remaining.length) world.affected.delete(id);
      }
    },
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
      health: target.maxHealth ?? MAX_HEALTH,
      x: reviver.x,
      y: reviver.y,
    });

    socket.emit(Event.PLAYER_MANA, reviver.mana - REVIVE_MANA);

    const reviveEvent = {
      id: target.id,
      x: reviver.x,
      y: reviver.y,
      health: target.maxHealth ?? MAX_HEALTH,
    };

    io.to(`party:${party.id}`).emit(Event.PLAYER_REVIVE, reviveEvent);
  },
};
