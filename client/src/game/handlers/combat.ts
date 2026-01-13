import { Direction, DirectionVectors } from "@server/types";
import { Entity } from "../Entity";

export const combat = {
  getDirectionalOffset: (direction: Direction, distance: number) => {
    const offsets = {
      [Direction.UP]: { x: 0, y: -distance },
      [Direction.DOWN]: { x: 0, y: distance },
      [Direction.LEFT]: { x: -distance, y: 0 },
      [Direction.RIGHT]: { x: distance, y: 0 },
    };

    return offsets[direction] || { x: 0, y: 0 };
  },

  getDirectionVector: (direction: Direction) => {
    return DirectionVectors[direction] || { x: 0, y: 0 };
  },

  getDiagonalDirectionVector: (directions: Direction[]) => {
    let vector = { x: 0, y: 0 };

    directions.forEach((direction) => {
      const dirVector = DirectionVectors[direction];
      vector.x += dirVector.x;
      vector.y += dirVector.y;
    });

    const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);

    if (magnitude > 0) {
      vector.x /= magnitude;
      vector.y /= magnitude;
    }

    return vector;
  },

  getDirectionToPoint: (entity: Entity, target: { x: number; y: number }) => {
    const dx = target.x - entity.x;
    const dy = target.y - entity.y;

    const magnitude = Math.sqrt(dx * dx + dy * dy);

    if (magnitude > 0) return { x: dx / magnitude, y: dy / magnitude };

    return { x: 0, y: 0 };
  },

  hurt: (entity: Entity, health: number) => {
    entity.health = health;

    entity.scene.tweens.add({
      targets: entity,
      alpha: 0.1,
      duration: 50,
      yoyo: true,
      repeat: 2,
    });
  },

  knockback: (entity: Entity, knockback: { x: number; y: number }) => {
    entity.body.setVelocity(
      entity.body.velocity.x + knockback.x,
      entity.body.velocity.y + knockback.y
    );

    const drag = entity.body.drag.x;
    entity.body.setDrag(800);
    entity.scene.time.delayedCall(300, () => entity.body.setDrag(drag));
  },
};
