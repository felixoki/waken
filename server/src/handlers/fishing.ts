import { Server, Socket } from "socket.io";
import { EntityName, FishName } from "../types";
import { FISHING_LANDING_DISTANCE } from "../globals.js";
import { World } from "../World";
import { handlers } from ".";
import { configs } from "../configs";

export const fishing = {
  catch: (
    data: { name: EntityName; x: number; y: number },
    socket: Socket,
    io: Server,
    world: World,
  ) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player) return;

    if (!(Object.values(FishName) as string[]).includes(data.name)) return;

    const dx = data.x - player.x;
    const dy = data.y - player.y;

    if (Math.sqrt(dx * dx + dy * dy) > FISHING_LANDING_DISTANCE) return;

    const party = world.parties.getByPlayerId(player.id);
    const partyId = configs.maps[player.map].isInstanced ? party?.id : undefined;

    handlers.entity.create(
      {
        name: data.name,
        map: player.map,
        x: data.x,
        y: data.y,
        health: 1,
        maxHealth: 1,
        isLocked: false,
      },
      socket,
      io,
      world,
      partyId,
    );
  },
};
