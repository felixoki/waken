import { DirectionVectors } from "@server/types";
import { Entity } from "../Entity";

export const move = {
  getVelocity: (entity: Entity, speed: number) => {
    if (!entity.body) return;

    const moving = entity.moving;
    const vector = new Phaser.Math.Vector2(0, 0);

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
