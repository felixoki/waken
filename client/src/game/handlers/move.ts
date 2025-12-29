import { DirectionVectors } from "@server/types";
import { Entity } from "../Entity";

export const move = {
  getVelocity: (entity: Entity, speed: number) => {
    if (!entity.body) return;

    const directions = entity.directions;
    const vector = new Phaser.Math.Vector2(0, 0);

    directions.forEach((direction) => {
      const dv = DirectionVectors[direction];
      vector.x += dv.x;
      vector.y += dv.y;
    });

    if (vector.x !== 0 || vector.y !== 0) vector.normalize().scale(speed);

    entity.body.setVelocity(vector.x, vector.y);
  },
};
