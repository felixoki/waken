import { Entity } from "../Entity";

export const physics = {
  overlap: (obj1: any, obj2: any) => {
    const entity = obj1 as Entity;
    const other = obj2 as Entity;

    entity.scene.game.events.emit("entity:overlap", entity, other);
  },
};
