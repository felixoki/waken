import { Server, Socket } from "socket.io";
import { Event, SpellName } from "../types/index.js";
import { World } from "../World.js";
import { configs } from "../configs/index.js";

export const spell = {
  learn: (data: { spell: SpellName }, socket: Socket, world: World) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player || player.spells.includes(data.spell)) return;

    player.spells.push(data.spell);
  },

  cast: (name: SpellName, socket: Socket, _io: Server, world: World) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player || player.isDead) return;

    const config = configs.spells[name];
    if (!config) return;

    const mana = Math.max(player.mana - config.mana, 0);
    world.players.update(player.id, { mana });
    
    socket.emit(Event.PLAYER_MANA, mana);
  },
};
