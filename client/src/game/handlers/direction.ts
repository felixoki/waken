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

  fromAngle: (angle: number, current?: Direction): Direction => {
    const deg = Phaser.Math.RadToDeg(angle);

    const getZone = (d: number): Direction => {
      if (d >= -45 && d < 45) return Direction.RIGHT;
      if (d >= 45 && d < 135) return Direction.DOWN;
      if (d >= -135 && d < -45) return Direction.UP;
      return Direction.LEFT;
    };

    const candidate = getZone(deg);
    if (!current || candidate === current) return candidate;

    const H = 12;
    
    switch (current) {
      case Direction.RIGHT: if (deg >= -(45 + H) && deg < 45 + H) return current; break;
      case Direction.DOWN: if (deg >= 45 - H && deg < 135 + H) return current; break;
      case Direction.UP: if (deg >= -135 - H && deg < -45 + H) return current; break;
      case Direction.LEFT: if (deg >= 135 - H || deg < -135 + H) return current; break;
    }

    return candidate;
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

  fromVector: (
    dx: number,
    dy: number,
    threshold: number = 0.3,
  ): Direction[] => {
    const axes: [number, Direction, Direction][] = [
      [dx, Direction.RIGHT, Direction.LEFT],
      [dy, Direction.DOWN, Direction.UP],
    ];

    return axes
      .filter(([v]) => Math.abs(v) > threshold)
      .map(([v, pos, neg]) => (v > 0 ? pos : neg));
  },
};
