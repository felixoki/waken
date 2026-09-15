import {
  ComponentName,
  Direction,
  SleepableConfig,
  StateName,
} from "@server/types";
import { configs } from "@server/configs";
import { Entity } from "../Entity";

export const sleep = {
  bed: (entity: Entity): Entity | undefined =>
    entity.bed ? entity.scene.managers.entities.get(entity.bed) : undefined,

  config: (bed: Entity | undefined): SleepableConfig | undefined => {
    if (!bed) return undefined;

    const component = configs.entities[bed.name]?.components.find(
      (c) => c.name === ComponentName.SLEEPABLE,
    );

    return component?.name === ComponentName.SLEEPABLE
      ? component.config
      : undefined;
  },

  is: (entity: Entity): boolean => entity.state === StateName.SLEEPING,

  exit: (
    entity: Entity,
    config: SleepableConfig,
  ): Direction | undefined => {
    const held = entity.moving.find((direction) => !!config.exits[direction]);
    if (held) return held;

    return (Object.keys(config.exits) as Direction[])[0];
  },
};
