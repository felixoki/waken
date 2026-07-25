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
  SpellName,
} from "../types";
import { Effect, EffectName } from "../types/effects.js";
import { DamageType } from "../types/damage.js";
import { World } from "../World";
import { configs } from "../configs";
import {
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

  reflect: (
    target: PlayerConfig | EntityConfig,
    attacker: PlayerConfig | EntityConfig,
    damage: number,
    socket: Socket,
    io: Server,
    world: World,
  ) => {
    const now = Date.now();

    const ward = (target.effects ?? []).find(
      (e) =>
        e.expiresAt > now && configs.effects[e.name]?.reflect !== undefined,
    );

    if (!ward) return;

    const amount = Math.floor(damage * configs.effects[ward.name]!.reflect!);

    if (amount <= 0) return;

    const isEntity = !!world.entities.get(attacker.id);
    const store = isEntity ? world.entities : world.players;
    const health = attacker.health - amount;

    const key = isEntity
      ? world.chunks.getChunkByEntity(attacker.id)
      : (() => {
          const map = (attacker as PlayerConfig).map;
          const party = world.parties.getByPlayerId(attacker.id);
          const partyId = configs.maps[map].isInstanced ? party?.id : undefined;
          return world.chunks.toChunkKey(map, attacker.x, attacker.y, partyId);
        })();

    if (health <= 0) {
      if (isEntity)
        combat.kill.entity(attacker as EntityConfig, socket, io, world);
      else
        combat.kill.player(
          attacker as PlayerConfig,
          target.id,
          { x: 0, y: 0 },
          io,
          world,
        );

      return;
    }

    store.update(attacker.id, { health });

    const event = {
      id: attacker.id,
      health,
      knockback: { x: 0, y: 0 },
      attackerId: target.id,
      isMiss: false,
      isCritical: false,
      reflected: true,
    };

    const emit = isEntity ? Event.ENTITY_HURT : Event.PLAYER_HURT;

    if (key) socket.to(`chunk:${key}`).emit(emit, event);
    socket.emit(emit, event);
  },

  absorb: (
    target: PlayerConfig | EntityConfig,
    damage: number,
    socket: Socket,
    _io: Server,
    world: World,
  ): number => {
    if (damage <= 0) return damage;

    const now = Date.now();
    const shield = (target.effects ?? []).find(
      (e) => e.expiresAt > now && e.absorb !== undefined && e.absorb > 0,
    );

    if (!shield || shield.absorb === undefined) return damage;

    const soaked = Math.min(damage, shield.absorb);
    shield.absorb -= soaked;

    const isEntity = !!world.entities.get(target.id);
    const store = isEntity ? world.entities : world.players;

    if (shield.absorb <= 0) {
      const remaining = (target.effects ?? []).filter((e) => e !== shield);
      store.update(target.id, { effects: remaining });

      const key = isEntity
        ? world.chunks.getChunkByEntity(target.id)
        : (() => {
            const map = (target as PlayerConfig).map;
            const party = world.parties.getByPlayerId(target.id);
            const partyId = configs.maps[map].isInstanced
              ? party?.id
              : undefined;
            return world.chunks.toChunkKey(map, target.x, target.y, partyId);
          })();

      const event = { id: target.id, name: shield.name };
      if (key) socket.to(`chunk:${key}`).emit(Event.EFFECT_REMOVE, event);
      socket.emit(Event.EFFECT_REMOVE, event);
    } else store.update(target.id, { effects: target.effects });

    return damage - soaked;
  },

  calculateDamage: (
    target: PlayerConfig | EntityConfig,
    config: CombatConfig,
    isEntity: boolean,
    mods?: { damage?: number; crit?: number; defense?: number },
  ): { damage: number; isMiss: boolean; isCritical: boolean } => {
    if (Math.random() < MISS_CHANCE)
      return { damage: 0, isMiss: true, isCritical: false };

    let damage = config.damage.amount;
    const damageType: DamageType = config.damage.type;

    damage *= mods?.damage ?? 1;

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
    if (isCritical) damage *= mods?.crit ?? CRIT_MULTIPLIER;

    damage *= mods?.defense ?? 1;

    return { damage: Math.floor(damage), isMiss: false, isCritical };
  },

  kill: {
    player: (
      player: PlayerConfig,
      attackerId: string,
      knockback: { x: number; y: number },
      io: Server,
      world: World,
    ) => {
      world.players.update(player.id, { health: 0, isDead: true });

      const event = {
        id: player.id,
        health: 0,
        knockback,
        attackerId,
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

      const room = key ? `chunk:${key}` : player.socketId;
      handlers.broadcast.room(null, io, room, Event.PLAYER_HURT, event);

      if (party) {
        const event = { id: player.id, x: player.x, y: player.y };
        handlers.broadcast.room(
          null,
          io,
          `party:${party.id}`,
          Event.PLAYER_DEATH,
          event,
        );
        handlers.party.wipe(party.id, io, world);
      }
    },

    entity: (
      target: EntityConfig,
      socket: Socket | null,
      io: Server,
      world: World,
    ) => {
      const partyId = world.chunks.getPartyByEntity(target.id);

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

  /**
   * @todo We should refactor this and split it up
   */
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

    if ("mana" in config && config.name === SpellName.TAME) {
      if (entity) {
        const definition = configs.entities[entity.name];
        const tamable = definition?.components.find(
          (c: ComponentConfig) => c.name === ComponentName.TAMABLE,
        );

        if (tamable) handlers.taming.pacify(entity, socket, io, world);
      }

      return;
    }

    const attackerStats = players.get(data.attackerId)
      ? handlers.player.stats(players.get(data.attackerId)!)
      : undefined;
    const targetStats = player ? handlers.player.stats(player) : undefined;

    const { damage, isMiss, isCritical } = combat.calculateDamage(
      target,
      config,
      !!entity,
      {
        damage: attackerStats?.multipliers.damage,
        crit: attackerStats?.multipliers.crit,
        defense: targetStats?.multipliers.defense,
      },
    );

    const zoneMultiplier = world.zones
      .at(target.map, target.x, target.y, Date.now())
      .reduce((m, zone) => {
        const mult =
          configs.zones[zone.type].interactions?.[config.damage.type];
        return mult !== undefined ? m * mult : m;
      }, 1);

    const amplified =
      zoneMultiplier === 1 ? damage : Math.floor(damage * zoneMultiplier);

    const net = isMiss
      ? amplified
      : combat.absorb(target, amplified, socket, io, world);

    const health = target.health - net;

    if (!isMiss && "lifesteal" in config && config.lifesteal) {
      const caster = players.get(data.attackerId);

      if (caster && !caster.isDead) {
        const drained = Math.min(net, target.health) * config.lifesteal;
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

    if (!isMiss && net > 0)
      combat.reflect(target, attacker, net, socket, io, world);

    if (player && health <= 0) {
      combat.kill.player(
        player,
        attacker.id,
        combat.getKnockback(player, attacker, config),
        io,
        world,
      );
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
          ownerId: attackerId || "",
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
          if (chunkKey)
            handlers.broadcast.room(null, io, `chunk:${chunkKey}`, event, data);
          if (playerSocketId)
            handlers.broadcast.room(null, io, playerSocketId, event, data);
        };

        const remaining: Effect[] = [];
        let killed = false;

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
            effect.lastTickAt = now;

            if (newHealth <= 0) {
              if (isEntity)
                combat.kill.entity(target as EntityConfig, null, io, world);
              else
                combat.kill.player(
                  target as PlayerConfig,
                  effect.ownerId || id,
                  { x: 0, y: 0 },
                  io,
                  world,
                );

              killed = true;
              break;
            }

            store.update(id, { health: newHealth });

            const hurtEvent = isEntity ? Event.ENTITY_HURT : Event.PLAYER_HURT;

            emit(hurtEvent, {
              id,
              health: newHealth,
              knockback: { x: 0, y: 0 },
              attackerId: effect.ownerId || id,
            });
          }

          if (
            !isEntity &&
            definition.interval &&
            definition.restore?.health &&
            effect.lastTickAt !== undefined &&
            now - effect.lastTickAt >= definition.interval
          ) {
            const player = target as PlayerConfig;
            const max = player.maxHealth || MAX_HEALTH;
            const newHealth = Math.min(
              max,
              player.health + definition.restore.health,
            );
            effect.lastTickAt = now;

            if (newHealth !== player.health) {
              store.update(id, { health: newHealth });

              handlers.broadcast.room(
                null,
                io,
                player.socketId,
                Event.PLAYER_HEALTH,
                newHealth,
              );
              io.to(`map:${player.map}`)
                .except(player.socketId)
                .emit(Event.PLAYER_HEALTH_SYNC, { id, health: newHealth });
            }
          }

          remaining.push(effect);
        }

        if (killed) {
          world.affected.delete(id);
          continue;
        }

        store.update(id, { effects: remaining });

        if (!remaining.length) world.affected.delete(id);
      }
    },
  },
};
