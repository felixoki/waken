import { DirectionVectors, EffectName, Item, StateName } from "@server/types";
import { configs } from "@server/configs";
import { SPEED_SWIMMING } from "@server/globals";
import { Entity } from "../Entity";
import { robe } from "./robe";
import { water } from "./water";

const vector = new Phaser.Math.Vector2(0, 0);

export const move = {
  speed: (
    items: (Item | null)[],
    effects?: Iterable<EffectName>,
    worn?: Item | null,
  ) => {
    let multiplier = 1;

    for (const item of items) {
      if (!item || robe.is(item.name)) continue;

      const value = configs.entities[item.name]?.modifier?.multipliers?.speed;
      if (value) multiplier *= value;
    }

    const value =
      worn && configs.entities[worn.name]?.modifier?.multipliers?.speed;
    if (value) multiplier *= value;

    if (effects)
      for (const name of effects) {
        const value = configs.effects[name]?.modifier?.multipliers?.speed;
        if (value) multiplier *= value;
      }

    return multiplier;
  },

  getVelocity: (entity: Entity, speed: number) => {
    if (!entity.body) return;

    const moving = entity.moving;
    vector.set(0, 0);

    moving.forEach((direction) => {
      const dv = DirectionVectors[direction];
      vector.x += dv.x;
      vector.y += dv.y;
    });

    if (
      entity.state !== StateName.SWIMMING &&
      entity.state !== StateName.FLYING &&
      entity.z <= 0 &&
      water.swimming(entity)
    )
      speed = Math.min(speed, SPEED_SWIMMING * entity.speed);

    if (vector.x !== 0 || vector.y !== 0) vector.normalize().scale(speed);

    const body = entity.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(vector.x, vector.y);
  },
};
