import { Socket } from "socket.io";
import {
  EntityName,
  EntityPickup,
  MapName,
} from "../types";
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
      map: MapName.VILLAGE,
      name: EntityName.HOUSE1,
      health: 100,
    };

    entities.add(entity.id, entity);
    socket.emit("entity:create", entity);
    socket.broadcast.emit("entity:create", entity);
  },

  pickup: (data: EntityPickup, socket: Socket, entities: EntityStore) => {
    const entity = entities.get(data.id);
    if (!entity) return;

    entities.remove(data.id);
    socket.broadcast.emit("entity:destroy", { id: data.id });
  },
};
