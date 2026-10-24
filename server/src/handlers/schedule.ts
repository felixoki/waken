import { Server } from "socket.io";
import { World } from "../World";
import {
  Condition,
  EntityConfig,
  Event,
  Mood,
  Placement,
  Position,
} from "../types";
import { conditions } from "../story/conditions.js";
import { configs } from "../configs/index.js";
import { timetable } from "../story/schedule.js";
import { handlers } from ".";

export const schedule = {
  apply: (world: World, io: Server): boolean => {
    const phase = world.getTime().phase;
    const context = handlers.story.world(world);
    const passes = (when: Condition | undefined) =>
      conditions.passes(when, context);
    let pending = false;

    for (const entity of world.entities.all) {
      const entry = configs.schedules[entity.name];
      if (!entry || !entity.anchor) continue;

      const sleepless = world.economy.getMood(entity.name) === Mood.SLEEPLESS;
      const placement = timetable.place(entry, phase, sleepless, passes);
      const key = schedule.key(placement);

      if (entity.placement === key) continue;

      if (entity.isLocked) {
        pending = true;
        continue;
      }

      schedule.move(entity, schedule.target(placement, entity, world), io, world);
      entity.placement = key;
    }

    return pending;
  },

  key: (placement: Placement): string =>
    "spot" in placement ? placement.spot : "away" in placement ? "away" : "anchor",

  target: (
    placement: Placement,
    entity: EntityConfig,
    world: World,
  ): Position | null => {
    if ("away" in placement) return null;
    if ("spot" in placement)
      return world.spots.get(placement.spot) ?? entity.anchor ?? null;

    return entity.anchor ?? null;
  },

  move: (
    entity: EntityConfig,
    target: Position | null,
    io: Server,
    world: World,
  ) => {
    if (!entity.away) {
      const chunk = world.chunks.getChunkByEntity(entity.id);

      world.chunks.removeEntity(entity.id);
      handlers.broadcast.entity(
        io,
        world,
        Event.ENTITY_LEAVE,
        entity.id,
        entity.map,
        chunk,
      );
    }

    entity.away = !target;
    if (!target) return;

    entity.map = target.map;
    entity.x = target.x;
    entity.y = target.y;

    world.chunks.registerEntity(entity.id, entity.map, entity.x, entity.y);
    handlers.broadcast.entity(
      io,
      world,
      Event.ENTITY_ARRIVE,
      entity,
      entity.map,
      world.chunks.toChunkKey(entity.map, entity.x, entity.y),
    );
  },
};
