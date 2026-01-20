import { Socket } from "socket.io";
import { Item } from "../types";
import { InstanceManager } from "../managers/Instance";

export const item = {
  collect: (
    data: Item,
    socket: Socket,
    instances: InstanceManager,
  ) => {
    const instance = instances.getBySocketId(socket.id);
    if (!instance) return;

    instance.items.add(data.name, data.quantity);
    socket.emit("item:remove", {
      name: data.name,
      quantity: data.quantity,
    });
  },
};
