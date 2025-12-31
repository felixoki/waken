import { Direction, DirectionVectors } from "@server/types";

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
};
