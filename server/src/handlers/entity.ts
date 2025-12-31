import { Socket } from "socket.io";
import { EntityHit } from "../types";
import { EntityStore } from "../stores/Entity";
import { randomInt, randomUUID } from "crypto";
import { PlayerStore } from "../stores/Player";

export const entity = {
  create: (socket: Socket, entities: EntityStore, players: PlayerStore) => {
    const player = players.getBySocketId(socket.id);
    if (!player || !player.isHost) return;

    const entity = {
      x: randomInt(0, 400),
      y: randomInt(0, 400),
      id: randomUUID(),
    };
    entities.add(entity.id, entity);

    socket.emit("entity:create", entity);
    socket.broadcast.emit("entity:create", entity);
  },
  hit: (data: EntityHit, _socket: Socket, _entities: EntityStore) => {
    // target is always an entity
    // attacker is always a player
    console.log("Entity hit data received on server:", data);
  },
};
