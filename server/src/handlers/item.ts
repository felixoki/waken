import { Socket } from "socket.io";
import { Item } from "../types";
import { World } from "../World";

export const item = {
  collect: (data: Item, socket: Socket, world: World) => {
    world.items.add(data.name, data.quantity);

    socket.emit("item:remove", {
      name: data.name,
      quantity: data.quantity,
    });
  },
};
