import { DIRECTIONS, DIRECTIONS_CARDINAL } from "@server/globals";
import { Entity } from "../Entity";
import { Input, Stuck, Waypoint } from "@server/types";
import { handlers } from ".";

interface Node {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent?: Node;
}

export const MAX_PATH_EXPANSIONS = 2000;

export const path = {
  heap: {
    push: (heap: Node[], node: Node): void => {
      let i = heap.push(node) - 1;

      while (i > 0) {
        const parent = (i - 1) >> 1;
        if (heap[parent].f <= heap[i].f) break;

        [heap[parent], heap[i]] = [heap[i], heap[parent]];
        i = parent;
      }
    },

    pop: (heap: Node[]): Node => {
      const top = heap[0];
      const last = heap.pop()!;

      if (heap.length) {
        heap[0] = last;

        let i = 0;

        for (;;) {
          const left = 2 * i + 1;
          const right = left + 1;
          let smallest = i;

          if (left < heap.length && heap[left].f < heap[smallest].f)
            smallest = left;
          if (right < heap.length && heap[right].f < heap[smallest].f)
            smallest = right;
          if (smallest === i) break;

          [heap[smallest], heap[i]] = [heap[i], heap[smallest]];
          i = smallest;
        }
      }

      return top;
    },
  },

  isWalkable: (grid: number[][], x: number, y: number): boolean => {
    return grid[y] && grid[y][x] === 0;
  },

  canMoveDiagonally: (
    grid: number[][],
    x: number,
    y: number,
    dx: number,
    dy: number,
  ): boolean => {
    return (
      path.isWalkable(grid, x + dx, y) &&
      path.isWalkable(grid, x, y + dy) &&
      path.isWalkable(grid, x + dx, y + dy)
    );
  },

  heuristic: (
    a: { x: number; y: number },
    b: { x: number; y: number },
  ): number => {
    return Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y);
  },

  findClosestWalkable: (
    grid: number[][],
    x: number,
    y: number,
  ): { x: number; y: number } | null => {
    for (let r = 1; r < 10; r++) {
      for (let dx = -r; dx <= r; dx++) {
        for (let dy = -r; dy <= r; dy++) {
          if (path.isWalkable(grid, x + dx, y + dy)) {
            return { x: x + dx, y: y + dy };
          }
        }
      }
    }

    return null;
  },

  reconstruct: (
    node: Node,
    map: Phaser.Tilemaps.Tilemap,
  ): Array<{ x: number; y: number }> => {
    const waypoints: Array<{ x: number; y: number }> = [];
    let current: Node | undefined = node;

    while (current) {
      waypoints.unshift({
        x: (map.tileToWorldX(current.x) ?? 0) + map.tileWidth / 2,
        y: (map.tileToWorldY(current.y) ?? 0) + map.tileHeight / 2,
      });

      current = current.parent;
    }

    return waypoints;
  },

  mergeObstacles: (
    collisions: number[][],
    obstacles: Array<{ x: number; y: number; width: number; height: number }>,
  ): number[][] => {
    const grid = collisions.map((row) => [...row]);

    obstacles.forEach(({ x, y, width, height }) => {
      for (let dy = 0; dy < height; dy++) {
        for (let dx = 0; dx < width; dx++) {
          if (grid[y + dy]?.[x + dx] !== undefined) {
            grid[y + dy][x + dx] = 1;
          }
        }
      }
    });

    return grid;
  },

  find: (
    grid: number[][],
    start: { x: number; y: number },
    end: { x: number; y: number },
    map: Phaser.Tilemaps.Tilemap,
    allowDiagonals: boolean = false,
    maxExpansions: number = MAX_PATH_EXPANSIONS,
  ): Array<{ x: number; y: number }> | null => {
    if (!path.isWalkable(grid, start.x, start.y)) {
      const closest = path.findClosestWalkable(grid, start.x, start.y);
      if (!closest) return null;
      start = closest;
    }

    if (!path.isWalkable(grid, end.x, end.y)) {
      const closest = path.findClosestWalkable(grid, end.x, end.y);
      if (!closest) return null;
      end = closest;
    }

    const open: Node[] = [];
    const closed: Set<string> = new Set<string>();

    const best: Map<string, number> = new Map();

    best.set(`${start.x},${start.y}`, 0);

    path.heap.push(open, {
      x: start.x,
      y: start.y,
      g: 0,
      h: path.heuristic(start, end),
      f: path.heuristic(start, end),
    });

    let expansions = 0;

    while (open.length) {
      const current = path.heap.pop(open);
      const key = `${current.x},${current.y}`;

      if (closed.has(key)) continue;

      if (++expansions > maxExpansions) return null;

      if (current.x === end.x && current.y === end.y)
        return path.reconstruct(current, map);

      closed.add(key);

      const directions = allowDiagonals ? DIRECTIONS : DIRECTIONS_CARDINAL;

      for (const { dx, dy } of directions) {
        const nx = current.x + dx;
        const ny = current.y + dy;
        const neighbour = `${nx},${ny}`;

        if (closed.has(neighbour)) continue;

        if (!path.isWalkable(grid, nx, ny)) continue;

        if (
          dx !== 0 &&
          dy !== 0 &&
          !path.canMoveDiagonally(grid, current.x, current.y, dx, dy)
        )
          continue;

        const g = current.g + (dx !== 0 && dy !== 0 ? 1.414 : 1);

        const previous = best.get(neighbour);
        if (previous !== undefined && g >= previous) continue;

        best.set(neighbour, g);

        const h = path.heuristic({ x: nx, y: ny }, end);

        path.heap.push(open, {
          x: nx,
          y: ny,
          g,
          h,
          f: g + h,
          parent: current,
        });
      }
    }

    return null;
  },

  getGrid: (entity: Entity): number[][] => {
    const { tileManager } = entity.scene;
    if (!tileManager) return [];

    return entity.scene.managers.entities.getMergedGrid(
      entity.scene,
      entity.map,
    );
  },

  position: (entity: Entity): { x: number; y: number } => {
    const body = entity.body as Phaser.Physics.Arcade.Body | undefined;
    return body
      ? { x: body.center.x, y: body.center.y }
      : { x: entity.x, y: entity.y };
  },

  stuck: (
    entity: Entity,
    stuck: Stuck,
    now: number,
    threshold: number,
  ): boolean => {
    if (now - stuck.lastCheck < stuck.interval) return false;

    stuck.lastCheck = now;

    const moved = Math.hypot(
      entity.x - stuck.lastPosition.x,
      entity.y - stuck.lastPosition.y,
    );
    stuck.lastPosition = { x: entity.x, y: entity.y };

    return moved < threshold;
  },

  follow: (
    entity: Entity,
    path: Waypoint[],
    threshold: number,
    isRunning: boolean,
  ): Partial<Input> | null => {
    if (!path.length) return null;

    const body = entity.body as Phaser.Physics.Arcade.Body | undefined;
    const ox = body ? body.center.x : entity.x;
    const oy = body ? body.center.y : entity.y;

    const next = path[0];
    const distance = Phaser.Math.Distance.Between(ox, oy, next.x, next.y);

    if (distance < threshold) {
      path.shift();
      if (!path.length) return null;
    }

    if (path.length) {
      const angle = Phaser.Math.Angle.Between(ox, oy, path[0].x, path[0].y);
      const direction = handlers.direction.fromAngle(angle, entity.facing);

      return {
        facing: direction,
        moving: [direction],
        isRunning,
      };
    }

    return null;
  },

  isClear: (
    entity: Entity,
    dx: number,
    dy: number,
    distance: number,
    steps: number = 4,
  ): boolean => {
    for (let i = 1; i <= steps; i++) {
      const tile = entity.scene.tileManager.map.getTileAtWorldXY(
        entity.x + dx * distance * (i / steps),
        entity.y + dy * distance * (i / steps),
      );

      if (tile && tile.collides) return false;
    }

    return true;
  },
};
