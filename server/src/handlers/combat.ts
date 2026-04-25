import { Server, Socket } from "socket.io";
import {
  ComponentConfig,
  ComponentName,
  EntityConfig,
  Event,
  Hit,
  Item,
  MapName,
  PlayerConfig,
  Revive,
  SpellConfig,
  WeaponConfig,
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
} from "../globals";
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

  calculateDamage: (
    target: PlayerConfig | EntityConfig,
    config: SpellConfig | WeaponConfig,
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

      const party = world.parties.getByPlayerId(player.id);
      const partyId = player.map === MapName.REALM ? party?.id : undefined;

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
              health: 100,
              isLocked: false,
            },
            socket,
            io,
            world,
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

    if (!attacker || !target || !config || (player && player.isDead)) return;

    const { damage, isMiss, isCritical } = combat.calculateDamage(
      target,
      config,
      !!entity,
    );
    const health = target.health - damage;

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
          const partyId = map === MapName.REALM ? party?.id : undefined;
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
      config: SpellConfig | WeaponConfig,
      world: World,
      now: number,
      key: string | undefined,
      socket: Socket,
      attackerId?: string,
    ) => {
      const store = isEntity ? world.entities : world.players;
      const target = store.get(targetId);
      
      if (!target) return;

      const effects: [EffectName, number][] = [...(config.effects ?? [])];

      if (attackerId) {
        const inventory = world.players.get(attackerId)?.inventory ?? [];
        for (const slot of inventory) {
          if (!slot) continue;

          for (const bonus of configs.entities[slot.name]?.bonuses ?? [])
            if (
              bonus.spell === (config as SpellConfig).name ||
              bonus.weapon === (config as WeaponConfig).name
            )
              effects.push(...bonus.effects);
        }
      }

      if (!effects.length) return;

      const existing: Effect[] = target.effects ?? [];

      for (const [name, duration] of effects) {
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
    },

    tick: (world: World, io: Server, now: number) => {
      const targets: Array<{
        id: string;
        isEntity: boolean;
        config:
          | ReturnType<typeof world.entities.get>
          | ReturnType<typeof world.players.get>;
      }> = [
        ...world.entities.all.map((e) => ({
          id: e.id,
          isEntity: true,
          config: e,
        })),
        ...world.players.all.map((p) => ({
          id: p.id,
          isEntity: false,
          config: p,
        })),
      ];

      for (const { id, isEntity, config: target } of targets) {
        if (!target?.effects?.length) continue;

        const store = isEntity ? world.entities : world.players;
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
      health: 100,
      x: reviver.x,
      y: reviver.y,
    });

    socket.emit(Event.PLAYER_MANA, reviver.mana - REVIVE_MANA);

    const reviveEvent = {
      id: target.id,
      x: reviver.x,
      y: reviver.y,
      health: 100,
    };

    io.to(`party:${party.id}`).emit(Event.PLAYER_REVIVE, reviveEvent);
  },
};
