import { Server, Socket } from "socket.io";
import {
  Effect,
  EffectName,
  EntityName,
  Event,
  PlayerConfig,
  Buff,
  SpellName,
  Target,
} from "../types/index.js";
import { World } from "../World.js";
import { configs } from "../configs/index.js";
import { handlers } from "./index.js";
import { MAX_HEALTH } from "../globals.js";

export const spell = {
  learn: (
    data: { spell: SpellName; entity: EntityName },
    socket: Socket,
    world: World,
  ) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player || player.spells.includes(data.spell)) return;

    player.spells.push(data.spell);
    player.inventory = handlers.storage.remove(player.inventory, {
      name: data.entity,
      quantity: 1,
      stackable: false,
    });

    socket.emit(Event.INVENTORY_SYNC, player.inventory);
  },

  cast: (
    data: { name: SpellName; targetId?: string },
    socket: Socket,
    io: Server,
    world: World,
  ) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player || player.isDead) return;

    const config = configs.spells[data.name];
    if (!config) return;

    const mana = Math.max(player.mana - config.mana, 0);
    world.players.update(player.id, { mana });

    socket.emit(Event.PLAYER_MANA, mana);

    if (config.buff) spell.buff(player, config.buff, io, world);

    if (config.zone)
      world.zones.add({
        type: config.zone.type,
        map: player.map,
        x: player.x,
        y: player.y,
        radius: config.zone.radius,
        expiresAt: Date.now() + config.zone.duration,
        casterId: player.id,
      });

    if (data.name === SpellName.REVIVE && data.targetId)
      spell.revive(data.targetId, socket, io, world);
  },

  buff: (
    caster: PlayerConfig,
    buff: Buff,
    io: Server,
    world: World,
  ) => {
    const recipients: PlayerConfig[] =
      buff.target === Target.PARTY
        ? (world.parties.getByPlayerId(caster.id)?.members ?? [caster.id])
            .map((id) => world.players.get(id))
            .filter((p): p is PlayerConfig => !!p)
        : [caster];

    const now = Date.now();

    for (const recipient of recipients)
      spell.apply(recipient, buff.effects, now, io, world);
  },

  apply: (
    recipient: PlayerConfig,
    effects: [EffectName, number, number?][],
    now: number,
    io: Server,
    world: World,
  ) => {
    const existing: Effect[] = recipient.effects ?? [];

    const party = world.parties.getByPlayerId(recipient.id);
    const partyId = configs.maps[recipient.map].isInstanced
      ? party?.id
      : undefined;
    const key = world.chunks.toChunkKey(
      recipient.map,
      recipient.x,
      recipient.y,
      partyId,
    );
    const room = key ? `chunk:${key}` : recipient.socketId;

    for (const [name, duration, chance] of effects) {
      if (chance !== undefined && Math.random() > chance) continue;

      const effect: Effect = {
        name,
        expiresAt: now + duration,
        lastTickAt: now,
        ownerId: recipient.id,
        absorb: configs.effects[name].absorb,
      };
      existing.push(effect);

      handlers.broadcast.room(null, io, room, Event.EFFECT_APPLY, {
        id: recipient.id,
        effect,
      });
    }

    world.players.update(recipient.id, { effects: existing });
    world.affected.add(recipient.id);
  },

  revive: (targetId: string, socket: Socket, io: Server, world: World) => {
    const caster = world.players.getBySocketId(socket.id);
    if (!caster || caster.isDead) return;

    const config = configs.spells[SpellName.REVIVE];

    const target = world.players.get(targetId);
    if (!target || !target.isDead || target.map !== caster.map) return;

    const range = config.range ?? 80;
    const dx = target.x - caster.x;
    const dy = target.y - caster.y;
    if (dx * dx + dy * dy > range * range) return;

    const health = target.maxHealth ?? MAX_HEALTH;
    world.players.update(target.id, { isDead: false, health });

    const party = world.parties.getByPlayerId(target.id);
    const partyId = configs.maps[target.map].isInstanced
      ? party?.id
      : undefined;
    const key = world.chunks.toChunkKey(
      target.map,
      target.x,
      target.y,
      partyId,
    );
    const room = key ? `chunk:${key}` : target.socketId;

    handlers.broadcast.room(null, io, room, Event.PLAYER_REVIVE, {
      id: target.id,
      x: target.x,
      y: target.y,
      health,
    });
  },
};
