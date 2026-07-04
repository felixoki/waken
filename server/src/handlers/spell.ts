import { Server, Socket } from "socket.io";
import { EntityName, Event, SpellName } from "../types/index.js";
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

    if (data.name === SpellName.REVIVE && data.targetId)
      spell.revive(data.targetId, socket, io, world);
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
