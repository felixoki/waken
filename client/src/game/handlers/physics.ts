import { Entity } from "../Entity";
import { Event } from "@server/types";

type Collidable = Parameters<Phaser.Types.Physics.Arcade.ArcadePhysicsCallback>[0];

export const physics = {
  clearance: (a: Collidable, b: Collidable): boolean => {
    const entity = (a instanceof Entity ? a : b) as Entity;
    const wall = (a instanceof Entity ? b : a) as Phaser.GameObjects.Rectangle;
    const clearance = wall.getData("clearance");

    if (typeof clearance !== "number") return true;

    return entity.z <= clearance;
  },

  overlap: (obj1: any, obj2: any) => {
    const entity = obj1 as Entity;
    const other = obj2 as Entity;

    if (other.clearance !== undefined && entity.z > other.clearance) return;

    entity.scene.game.events.emit(Event.ENTITY_OVERLAP, entity, other);
  },
};
