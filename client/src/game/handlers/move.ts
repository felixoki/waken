import { DirectionVectors, EffectName, Item } from "@server/types";
import { configs } from "@server/configs";
import { Entity } from "../Entity";

const vector = new Phaser.Math.Vector2(0, 0);

export const move = {
  speed: (items: (Item | null)[], effects?: Iterable<EffectName>) => {
    let multiplier = 1;

    for (const item of items) {
      const value =
        item && configs.entities[item.name]?.modifier?.multipliers?.speed;
      if (value) multiplier *= value;
    }

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

    if (vector.x !== 0 || vector.y !== 0) vector.normalize().scale(speed);

    const body = entity.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(vector.x, vector.y);
  },
};
