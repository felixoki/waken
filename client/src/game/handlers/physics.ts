import { Entity } from "../Entity";
import { Event } from "@server/types";

export const physics = {
  overlap: (obj1: any, obj2: any) => {
    const entity = obj1 as Entity;
    const other = obj2 as Entity;

    if (other.clearance !== undefined && entity.z > other.clearance) return;

    entity.scene.game.events.emit(Event.ENTITY_OVERLAP, entity, other);
  },
};
