import {
  DIRECTIONS,
  DIRECTIONS_CARDINAL,
  PATH_DEADZONE,
  PATH_MARGIN,
  PATH_SNAP,
} from "@server/globals";
import { Entity } from "../Entity";
import { Direction, Input, Stuck, Waypoint } from "@server/types";
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

interface Space {
  data: Uint8Array;
  width: number;
  height: number;
  step: number;
}

const spaces = new WeakMap<number[][], Map<string, Space>>();
const search = {
  size: 0,
  g: new Float32Array(0),
  f: new Float32Array(0),
  parent: new Int32Array(0),
  stamp: new Uint32Array(0),
  closed: new Uint32Array(0),
  run: 0,
};

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
      const dx = path[0].x - ox;
      const dy = path[0].y - oy;
      const direction = handlers.direction.fromAngle(
        Math.atan2(dy, dx),
        entity.facing,
      );
      const moving = [direction];
      const horizontal =
        direction === Direction.LEFT || direction === Direction.RIGHT;
      const across = horizontal ? dy : dx;

      if (Math.abs(across) > PATH_DEADZONE)
        moving.push(
          horizontal
            ? across > 0
              ? Direction.DOWN
              : Direction.UP
            : across > 0
              ? Direction.RIGHT
              : Direction.LEFT,
        );

      return {
        facing: direction,
        moving,
        isRunning,
      };
    }

    return null;
  },

  direct: (entity: Entity, target: Entity): boolean => {
    const map = entity.scene.tileManager?.map;
    const grid = handlers.path.getGrid(entity);
    if (!map || !grid.length) return true;

    const body = entity.body as Phaser.Physics.Arcade.Body | undefined;
    const hw = body?.halfWidth ?? 0;
    const hh = body?.halfHeight ?? 0;
    const from = handlers.path.position(entity);
    const to = handlers.path.position(target);
    const length = Phaser.Math.Distance.Between(from.x, from.y, to.x, to.y);
    const steps = Math.max(1, Math.ceil(length / (map.tileWidth / 2)));
    const corners = [
      [0, 0],
      [-hw, -hh],
      [hw, -hh],
      [-hw, hh],
      [hw, hh],
    ];

    for (const [ox, oy] of corners)
      for (let i = 0; i <= steps; i++) {
        const x = from.x + ((to.x - from.x) * i) / steps + ox;
        const y = from.y + ((to.y - from.y) * i) / steps + oy;

        if (
          !handlers.path.isWalkable(
            grid,
            Math.floor(x / map.tileWidth),
            Math.floor(y / map.tileHeight),
          )
        )
          return false;
      }

    return true;
  },

  space: (entity: Entity): Space | null => {
    const map = entity.scene.tileManager?.map;
    const body = entity.body as Phaser.Physics.Arcade.Body | undefined;
    const grid = handlers.path.getGrid(entity);
    if (!map || !grid.length) return null;

    const hw = (body ? Math.ceil(body.halfWidth) : 0) + PATH_MARGIN;
    const hh = (body ? Math.ceil(body.halfHeight) : 0) + PATH_MARGIN;
    const key = `${hw}:${hh}`;

    let sizes = spaces.get(grid);
    if (!sizes) spaces.set(grid, (sizes = new Map()));

    const cached = sizes.get(key);
    if (cached) return cached;

    const tw = map.tileWidth;
    const th = map.tileHeight;
    const step = tw / 2;
    const rows = grid.length;
    const cols = grid[0].length;
    const width = cols * 2 + 1;
    const height = rows * 2 + 1;
    const data = new Uint8Array(width * height);

    for (let i = 0; i < width; i++)
      if (i * step - hw < 0 || i * step + hw > cols * tw)
        for (let j = 0; j < height; j++) data[j * width + i] = 1;

    for (let j = 0; j < height; j++)
      if (j * step - hh < 0 || j * step + hh > rows * th)
        for (let i = 0; i < width; i++) data[j * width + i] = 1;

    for (let ty = 0; ty < rows; ty++)
      for (let tx = 0; tx < cols; tx++) {
        if (!grid[ty][tx]) continue;

        const left = tx * tw - hw;
        const right = (tx + 1) * tw + hw;
        const top = ty * th - hh;
        const bottom = (ty + 1) * th + hh;
        const i0 = Math.max(0, Math.floor(left / step) + 1);
        const i1 = Math.min(width - 1, Math.ceil(right / step) - 1);
        const j0 = Math.max(0, Math.floor(top / step) + 1);
        const j1 = Math.min(height - 1, Math.ceil(bottom / step) - 1);

        for (let j = j0; j <= j1; j++)
          for (let i = i0; i <= i1; i++) data[j * width + i] = 1;
      }

    const space = { data, width, height, step };
    sizes.set(key, space);
    return space;
  },

  node: (space: Space, x: number, y: number): number => {
    const { data, width, height, step } = space;
    const ci = Math.round(x / step);
    const cj = Math.round(y / step);
    let best = -1;
    let distance = Infinity;

    for (let r = 0; r <= PATH_SNAP && best < 0; r++)
      for (let j = cj - r; j <= cj + r; j++)
        for (let i = ci - r; i <= ci + r; i++) {
          if (Math.max(Math.abs(i - ci), Math.abs(j - cj)) !== r) continue;
          if (i < 0 || j < 0 || i >= width || j >= height) continue;
          if (data[j * width + i]) continue;

          const d = Math.hypot(i * step - x, j * step - y);
          if (d < distance) {
            distance = d;
            best = j * width + i;
          }
        }

    return best;
  },

  plan: (
    entity: Entity,
    to: Waypoint,
    diagonals: boolean,
    maxExpansions: number = MAX_PATH_EXPANSIONS * 8,
  ): Waypoint[] | null => {
    const space = handlers.path.space(entity);
    if (!space) return null;

    const { data, width, step } = space;
    const from = handlers.path.position(entity);
    const start = handlers.path.node(space, from.x, from.y);
    const end = handlers.path.node(space, to.x, to.y);
    if (start < 0 || end < 0) return null;

    const size = data.length;

    if (search.size !== size) {
      search.size = size;
      search.g = new Float32Array(size);
      search.f = new Float32Array(size);
      search.parent = new Int32Array(size);
      search.stamp = new Uint32Array(size);
      search.closed = new Uint32Array(size);
      search.run = 0;
    }

    const run = ++search.run;
    const { g, f, parent, stamp, closed } = search;
    const ex = end % width;
    const ey = (end / width) | 0;
    const h = (n: number) => {
      const dx = Math.abs((n % width) - ex);
      const dy = Math.abs(((n / width) | 0) - ey);
      return diagonals
        ? Math.max(dx, dy) + 0.414 * Math.min(dx, dy)
        : dx + dy;
    };

    const heap: number[] = [];
    const push = (n: number) => {
      let i = heap.push(n) - 1;
      while (i > 0) {
        const p = (i - 1) >> 1;
        if (f[heap[p]] <= f[heap[i]]) break;
        [heap[p], heap[i]] = [heap[i], heap[p]];
        i = p;
      }
    };
    const pop = () => {
      const top = heap[0];
      const last = heap.pop()!;
      if (heap.length) {
        heap[0] = last;
        let i = 0;
        for (;;) {
          const l = 2 * i + 1;
          const r = l + 1;
          let s = i;
          if (l < heap.length && f[heap[l]] < f[heap[s]]) s = l;
          if (r < heap.length && f[heap[r]] < f[heap[s]]) s = r;
          if (s === i) break;
          [heap[s], heap[i]] = [heap[i], heap[s]];
          i = s;
        }
      }
      return top;
    };

    stamp[start] = run;
    g[start] = 0;
    f[start] = h(start);
    parent[start] = -1;
    push(start);

    const moves = diagonals ? DIRECTIONS : DIRECTIONS_CARDINAL;
    const free = (i: number, j: number) =>
      i >= 0 && j >= 0 && i < width && j < space.height && !data[j * width + i];

    let expansions = 0;

    while (heap.length) {
      const current = pop();
      if (closed[current] === run) continue;
      if (++expansions > maxExpansions) return null;

      if (current === end) {
        const nodes: number[] = [];
        for (let n = current; n >= 0; n = parent[n]) nodes.unshift(n);

        const waypoints: Waypoint[] = [];

        for (let k = 0; k < nodes.length; k++) {
          const n = nodes[k];
          const next = nodes[k + 1];

          if (k > 0 && next !== undefined && next - n === n - nodes[k - 1])
            continue;

          waypoints.push({ x: (n % width) * step, y: ((n / width) | 0) * step });
        }

        return waypoints;
      }

      closed[current] = run;

      const ci = current % width;
      const cj = (current / width) | 0;

      for (const { dx, dy } of moves) {
        const ni = ci + dx;
        const nj = cj + dy;
        if (!free(ni, nj)) continue;
        if (dx && dy && !(free(ci + dx, cj) && free(ci, cj + dy))) continue;

        const n = nj * width + ni;
        if (closed[n] === run) continue;

        const cost = g[current] + (dx && dy ? 1.414 : 1);
        if (stamp[n] === run && cost >= g[n]) continue;

        stamp[n] = run;
        g[n] = cost;
        f[n] = cost + h(n);
        parent[n] = current;
        push(n);
      }
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
