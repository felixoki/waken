import { Entity } from "../Entity";
import { Hitbox } from "../Hitbox";

export const physics = {
  overlap: (obj1: any, obj2: any) => {
    const entity = obj1 as Entity;
    const hitbox = obj2 as Hitbox;

    if (hitbox.ownerId === entity.id || hitbox.hits.has(entity.id)) return;

    /**
     * Emit overlaps to the server
     */
    console.log("Overlap detected between", entity, "and", hitbox);
  },
};
