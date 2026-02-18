import { DIRECTIONS, DIRECTIONS_CARDINAL } from "@server/globals";
import { Scene } from "../scenes/Scene";
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

export const path = {
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

    open.push({
      x: start.x,
      y: start.y,
      g: 0,
      h: path.heuristic(start, end),
      f: path.heuristic(start, end),
    });

    while (open.length) {
      open.sort((a, b) => a.f - b.f);
      const current = open.shift()!;

      if (current.x === end.x && current.y === end.y)
        return path.reconstruct(current, map);

      closed.add(`${current.x},${current.y}`);

      const directions = allowDiagonals ? DIRECTIONS : DIRECTIONS_CARDINAL;

      for (const { dx, dy } of directions) {
        const nx = current.x + dx;
        const ny = current.y + dy;

        if (closed.has(`${nx},${ny}`)) continue;

        if (!path.isWalkable(grid, nx, ny)) continue;

        if (
          dx !== 0 &&
          dy !== 0 &&
          !path.canMoveDiagonally(grid, current.x, current.y, dx, dy)
        )
          continue;

        const g = current.g + (dx !== 0 && dy !== 0 ? 1.414 : 1);
        const h = path.heuristic({ x: nx, y: ny }, end);
        const f = g + h;

        const existing = open.find((n) => n.x === nx && n.y === ny);
        if (existing && g >= existing.g) continue;

        const n: Node = {
          x: nx,
          y: ny,
          g,
          h,
          f,
          parent: current,
        };

        if (existing) open.splice(open.indexOf(existing), 1);

        open.push(n);
      }
    }

    return null;
  },

  getGrid: (scene: Scene): number[][] => {
    const { tileManager } = scene;
    if (!tileManager) return [];

    return path.mergeObstacles(
      tileManager.getCollisionGrid(),
      scene.managers.entities.getStatic(
        scene,
        tileManager.map.tileWidth,
        tileManager.map.tileHeight,
      ),
    );
  },

  stuck: (
    entity: Entity,
    stuck: Stuck,
    now: number,
    threshold: number,
  ): boolean => {
    if (now - stuck.lastCheck < stuck.interval) return false;

    stuck.lastCheck = now;

    const deltaX = Math.abs(entity.x - stuck.lastPosition.x);
    const deltaY = Math.abs(entity.y - stuck.lastPosition.y);

    stuck.lastPosition = { x: entity.x, y: entity.y };

    return deltaX < threshold && deltaY < threshold;
  },

  follow: (
    entity: Entity,
    path: Waypoint[],
    threshold: number,
    isRunning: boolean,
  ): Partial<Input> | null => {
    if (!path.length) return null;

    const next = path[0];
    const distance = Phaser.Math.Distance.Between(
      entity.x,
      entity.y,
      next.x,
      next.y,
    );

    if (distance < threshold) {
      path.shift();
      if (!path.length) return null;
    }

    if (path.length) {
      const angle = Phaser.Math.Angle.Between(
        entity.x,
        entity.y,
        path[0].x,
        path[0].y,
      );
      const direction = handlers.direction.fromAngle(angle);

      return {
        facing: direction,
        moving: [direction],
        isRunning,
      };
    }

    return null;
  },
};
