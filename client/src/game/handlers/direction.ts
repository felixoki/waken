import { Direction, DirectionVectors } from "@server/types";
import { Entity } from "../Entity";

export const direction = {
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

  fromAngle: (angle: number): Direction => {
    const deg = Phaser.Math.RadToDeg(angle);
    if (deg >= -45 && deg < 45) return Direction.RIGHT;
    if (deg >= 45 && deg < 135) return Direction.DOWN;
    if (deg >= -135 && deg < -45) return Direction.UP;
    
    return Direction.LEFT;
  },

  toAngle: (dir: Direction): number => {
    const angles = {
      [Direction.RIGHT]: 0,
      [Direction.DOWN]: Math.PI / 2,
      [Direction.LEFT]: Math.PI,
      [Direction.UP]: -Math.PI / 2,
    };

    return angles[dir] ?? 0;
  },
};
