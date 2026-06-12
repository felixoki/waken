import { fork } from "child_process";
import { fileURLToPath } from "url";
import { TiledProperty } from "../types";
import {
  GeneratedMap,
  Neighbors,
  Range,
  Room,
  RoomConfig,
  RoomDifficulty,
  RoomInterior,
  RoomInteriorOrigin,
  TERRAIN_ORDER,
  TerrainName,
} from "../types/generation";
import { join, dirname } from "path";
import {
  CORNERS,
  DUNGEON_RECESS_GAP,
  DUNGEON_RECESS_MARGIN,
  DUNGEON_RECESS_MAX_H,
  DUNGEON_RECESS_MAX_W,
  DUNGEON_RECESS_MIN_H,
  DUNGEON_RECESS_MIN_W,
} from "../globals";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __ext = __filename.endsWith(".ts") ? "ts" : "js";

export const generation = {
  toIndex: (x: number, y: number, width: number): number => {
    return y * width + x;
  },

  inBounds: (x: number, y: number, width: number, height: number): boolean => {
    return x >= 0 && x < width && y >= 0 && y < height;
  },

  forEachNeighbor: (
    x: number,
    y: number,
    width: number,
    height: number,
    directions: ReadonlyArray<{ dx: number; dy: number }>,
    callback: (nx: number, ny: number, neighborIndex: number) => void,
  ): void => {
    for (const { dx, dy } of directions) {
      const nx = x + dx;
      const ny = y + dy;

      if (generation.inBounds(nx, ny, width, height))
        callback(nx, ny, generation.toIndex(nx, ny, width));
    }
  },

  getNeighbors: <T>(
    grid: T[],
    x: number,
    y: number,
    width: number,
    height: number,
    fallback: T,
  ): Neighbors<T> => {
    const get = (dx: number, dy: number): T => {
      const nx = x + dx;
      const ny = y + dy;

      return generation.inBounds(nx, ny, width, height)
        ? grid[generation.toIndex(nx, ny, width)]
        : fallback;
    };

    return {
      north: get(0, -1),
      south: get(0, 1),
      west: get(-1, 0),
      east: get(1, 0),
      northwest: get(-1, -1),
      northeast: get(1, -1),
      southeast: get(1, 1),
      southwest: get(-1, 1),
    };
  },

  spiralSearch: (
    centerX: number,
    centerY: number,
    width: number,
    height: number,
    predicate: (x: number, y: number) => boolean,
  ): { x: number; y: number } | null => {
    for (let radius = 0; radius < Math.max(width, height); radius++)
      for (let dy = -radius; dy <= radius; dy++)
        for (let dx = -radius; dx <= radius; dx++) {
          if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;

          const x = centerX + dx;
          const y = centerY + dy;

          if (generation.inBounds(x, y, width, height) && predicate(x, y))
            return { x, y };
        }

    return null;
  },

  getTerrainRank: (terrain: TerrainName): number => {
    return TERRAIN_ORDER.indexOf(terrain);
  },

  isTerrainAtOrAbove: (current: TerrainName, target: TerrainName): boolean => {
    return (
      generation.getTerrainRank(current) >= generation.getTerrainRank(target)
    );
  },

  hash: (str: string): number => {
    let hash = 0;

    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash = hash & hash;
    }

    return hash;
  },

  hashToUnit: (hash: number): number => {
    return Math.abs(hash) / 2147483647;
  },

  spatialHash: (x: number, y: number, seed: number): number => {
    return ((x * 73856093) ^ (y * 19349663) ^ (seed * 83492791)) >>> 0;
  },

  seededRandom: (seed: number): (() => number) => {
    let t = (seed >>> 0) + 0x6d2b79f5;
    return () => {
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  },

  tileToWorld: (
    tileX: number,
    tileY: number,
    tileW: number,
    tileH: number,
  ) => ({
    x: tileX * tileW + tileW / 2,
    y: tileY * tileH + tileH / 2,
  }),

  parseProperties: (props?: TiledProperty[]): Record<string, any> => {
    const result: Record<string, any> = {};
    if (!props) return result;

    for (const p of props) result[p.name] = p.value;
    return result;
  },

  removeProtrusions: (
    terrain: TerrainName[],
    width: number,
    height: number,
  ): TerrainName[] => {
    const result = [...terrain];

    for (let y = 0; y < height; y++)
      for (let x = 0; x < width; x++) {
        const index = generation.toIndex(x, y, width);
        const current = result[index];

        const north = y > 0 ? terrain[index - width] : null;
        const south = y < height - 1 ? terrain[index + width] : null;
        const west = x > 0 ? terrain[index - 1] : null;
        const east = x < width - 1 ? terrain[index + 1] : null;

        const con = {
          h: west === current || east === current,
          v: north === current || south === current,
        };

        if (!con.h && !con.v) {
          const neighbors = [north, south, west, east].filter(
            (t): t is TerrainName => t !== null && t !== current,
          );

          if (neighbors.length) result[index] = neighbors[0];
        }

        if (con.v && !con.h) {
          const replacement = west ?? east;

          if (replacement && replacement !== current)
            result[index] = replacement;
        }

        if (con.h && !con.v) {
          const replacement = north ?? south;

          if (replacement && replacement !== current)
            result[index] = replacement;
        }
      }

    return result;
  },

  hasTerrainMargin: (
    x: number,
    y: number,
    margin: number,
    terrain: TerrainName[],
    allowed: TerrainName[],
    width: number,
    height: number,
  ): boolean => {
    for (let dy = -margin; dy <= margin; dy++)
      for (let dx = -margin; dx <= margin; dx++) {
        const nx = x + dx;
        const ny = y + dy;

        if (!generation.inBounds(nx, ny, width, height)) return false;
        if (!allowed.includes(terrain[generation.toIndex(nx, ny, width)]))
          return false;
      }

    return true;
  },

  straightWallCells: (
    terrain: TerrainName[],
    row: TerrainName,
    width: number,
    height: number,
  ): { x: number; y: number }[] => {
    const cells: { x: number; y: number }[] = [];

    for (let y = 0; y < height; y++)
      for (let x = 1; x < width - 1; x++) {
        const i = generation.toIndex(x, y, width);
        if (terrain[i] !== row) continue;
        if (terrain[i - 1] !== row || terrain[i + 1] !== row) continue;

        cells.push({ x, y });
      }

    return cells;
  },

  isInBlock: (
    x: number,
    y: number,
    width: number,
    height: number,
    grid: TerrainName[],
    target: TerrainName,
  ) => {
    return CORNERS.some((corners) =>
      corners.every(([dx, dy]) => {
        const nx = x + dx;
        const ny = y + dy;

        return (
          generation.inBounds(nx, ny, width, height) &&
          grid[generation.toIndex(nx, ny, width)] === target
        );
      }),
    );
  },

  enforceMinimumWater: (
    terrain: TerrainName[],
    width: number,
    height: number,
  ): TerrainName[] => {
    const result = [...terrain];

    for (let y = 0; y < height; y++)
      for (let x = 0; x < width; x++) {
        const idx = generation.toIndex(x, y, width);
        if (result[idx] !== TerrainName.WATER) continue;

        const inBlock = generation.isInBlock(
          x,
          y,
          width,
          height,
          terrain,
          TerrainName.WATER,
        );

        if (!inBlock) {
          const neighbors: TerrainName[] = [];

          for (const [dx, dy] of [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
          ]) {
            const nx = x + dx;
            const ny = y + dy;

            if (generation.inBounds(nx, ny, width, height)) {
              const t = result[generation.toIndex(nx, ny, width)];
              if (t !== TerrainName.WATER) neighbors.push(t);
            }
          }

          result[idx] = neighbors.length ? neighbors[0] : TerrainName.GRASS;
        }
      }

    return result;
  },

  enforceMinimumBlock: (
    terrain: TerrainName[],
    width: number,
    height: number,
    target: TerrainName,
    replacement: TerrainName,
  ): TerrainName[] => {
    const result = [...terrain];

    for (let y = 0; y < height; y++)
      for (let x = 0; x < width; x++) {
        const idx = generation.toIndex(x, y, width);
        if (result[idx] !== target) continue;

        const inBlock = generation.isInBlock(
          x,
          y,
          width,
          height,
          terrain,
          target,
        );

        if (!inBlock) result[idx] = replacement;
      }

    return result;
  },

  unifyShores: (
    terrain: TerrainName[],
    width: number,
    height: number,
  ): TerrainName[] => {
    const result = [...terrain];
    const visited = new Set<number>();

    for (let y = 0; y < height; y++)
      for (let x = 0; x < width; x++) {
        const start = generation.toIndex(x, y, width);
        if (result[start] !== TerrainName.WATER || visited.has(start)) continue;

        const region: number[] = [];
        const stack = [start];

        while (stack.length) {
          const idx = stack.pop()!;

          if (visited.has(idx)) continue;
          if (result[idx] !== TerrainName.WATER) continue;

          visited.add(idx);
          region.push(idx);

          const rx = idx % width;
          const ry = Math.floor(idx / width);

          if (rx > 0) stack.push(idx - 1);
          if (rx < width - 1) stack.push(idx + 1);
          if (ry > 0) stack.push(idx - width);
          if (ry < height - 1) stack.push(idx + width);
        }

        const counts = new Map<TerrainName, number>();
        const adjacent = new Set<number>();

        for (const idx of region) {
          const rx = idx % width;
          const ry = Math.floor(idx / width);

          for (const [dx, dy] of [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
            [-1, -1],
            [1, -1],
            [-1, 1],
            [1, 1],
          ]) {
            const nx = rx + dx;
            const ny = ry + dy;

            if (!generation.inBounds(nx, ny, width, height)) continue;

            const nIdx = generation.toIndex(nx, ny, width);
            const t = result[nIdx];

            if (t === TerrainName.WATER) continue;

            adjacent.add(nIdx);
            counts.set(t, (counts.get(t) ?? 0) + 1);
          }
        }

        if (!counts.size) continue;

        let dominant = TerrainName.GRASS;
        let maxCount = 0;

        for (const [t, c] of counts)
          if (c > maxCount) {
            maxCount = c;
            dominant = t;
          }

        const buffer = 3;
        const converted = new Set<number>();

        for (const idx of region) {
          const rx = idx % width;
          const ry = Math.floor(idx / width);

          for (let dy = -buffer; dy <= buffer; dy++)
            for (let dx = -buffer; dx <= buffer; dx++) {
              const nx = rx + dx;
              const ny = ry + dy;

              if (!generation.inBounds(nx, ny, width, height)) continue;
              const nIdx = generation.toIndex(nx, ny, width);

              if (result[nIdx] === TerrainName.WATER) continue;
              if (result[nIdx] === dominant) continue;

              converted.add(nIdx);
            }
        }

        for (const nIdx of converted) result[nIdx] = dominant;
      }

    return result;
  },

  createLayer: (
    id: number,
    name: string,
    width: number,
    height: number,
    data: number[],
    properties?: TiledProperty[],
  ) => ({
    id,
    name,
    type: "tilelayer" as const,
    visible: true,
    width,
    height,
    data,
    opacity: 1,
    x: 0,
    y: 0,
    ...(properties ? { properties } : {}),
  }),

  start: (biome: string, seed: string): Promise<GeneratedMap | null> => {
    return new Promise((resolve, reject) => {
      const worker = fork(join(__dirname, `../workers/generate.${__ext}`), [], {
        stdio: ["inherit", "inherit", "inherit", "ipc"],
      });

      const timeout = setTimeout(() => {
        worker.kill("SIGTERM");
        reject(new Error("Worker timed out"));
      }, 30_000);

      const cleanup = () => clearTimeout(timeout);

      worker.on("message", (result: GeneratedMap | null) => {
        cleanup();
        resolve(result);
      });

      worker.on("error", (err) => {
        cleanup();
        reject(err);
      });

      worker.on("exit", (code) => {
        cleanup();
        if (code !== 0) reject(new Error(`Worker exited with code ${code}`));
      });

      worker.send({ biome, seed });
    });
  },

  rooms: {
    assign: (
      rooms: Room[],
      depths: number[],
      config: RoomConfig,
      rng: () => number,
    ) => {
      const { assignment, templates } = config;

      return rooms.map((_, i) => {
        const depth = depths[i];

        const eligible = templates.filter((t) => {
          if (
            depth <= assignment.easyDepth &&
            t.difficulty !== RoomDifficulty.EASY
          )
            return false;

          if (t.depth?.min !== undefined && depth < t.depth.min) return false;
          if (t.depth?.max !== undefined && depth > t.depth.max) return false;

          return true;
        });

        const weight = eligible.reduce((sum, t) => sum + (t.weight ?? 1), 0);
        let roll = rng() * weight;

        for (const t of eligible) {
          roll -= t.weight ?? 1;
          if (roll <= 0) return t;
        }

        return eligible[eligible.length - 1];
      });
    },

    place: (
      width: number,
      height: number,
      size: { width: Range; height: Range },
      count: number,
      padding: number,
      rooms: Room[],
      rng: () => number,
      range?: Range,
    ) => {
      for (let i = 0; i < count; i++) {
        const w =
          size.width.min +
          Math.floor(rng() * (size.width.max - size.width.min));
        const h =
          size.height.min +
          Math.floor(rng() * (size.height.max - size.height.min));
        const x = 1 + Math.floor(rng() * (width - w - 2));

        const yMin = Math.max(range?.min ?? 1, 1);
        const yMax = Math.min(range?.max ?? height - h - 2, height - h - 2);

        const y = yMin + Math.floor(rng() * (yMax - yMin + 1));

        const candidate: Room = { x, y, width: w, height: h };
        const overlaps = rooms.some(
          (r) =>
            candidate.x - padding < r.x + r.width &&
            candidate.x + candidate.width + padding > r.x &&
            candidate.y - padding < r.y + r.height &&
            candidate.y + candidate.height + padding > r.y,
        );

        if (!overlaps) rooms.push(candidate);
      }
    },

    recess: {
      rect: {
        place: (
          terrain: TerrainName[],
          room: Room,
          innerWidth: number,
          innerHeight: number,
          mapWidth: number,
          mapHeight: number,
          rng: () => number,
        ): { x: number; y: number; w: number; h: number } | null => {
          const maxAttempts = 10;

          for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const rw = Math.min(
              innerWidth,
              DUNGEON_RECESS_MIN_W +
                Math.floor(
                  rng() * (DUNGEON_RECESS_MAX_W - DUNGEON_RECESS_MIN_W),
                ),
            );
            const rh = Math.min(
              innerHeight,
              DUNGEON_RECESS_MIN_H +
                Math.floor(
                  rng() * (DUNGEON_RECESS_MAX_H - DUNGEON_RECESS_MIN_H),
                ),
            );
            const rx =
              room.x +
              DUNGEON_RECESS_MARGIN +
              Math.floor(rng() * Math.max(1, innerWidth - rw));
            const ry =
              room.y +
              DUNGEON_RECESS_MARGIN +
              Math.floor(rng() * Math.max(1, innerHeight - rh));

            let blocked = false;

            for (
              let dy = -DUNGEON_RECESS_GAP;
              dy <= rh + DUNGEON_RECESS_GAP - 1 && !blocked;
              dy++
            )
              for (
                let dx = -DUNGEON_RECESS_GAP;
                dx <= rw + DUNGEON_RECESS_GAP - 1 && !blocked;
                dx++
              ) {
                if (dy >= 0 && dy < rh && dx >= 0 && dx < rw) continue;
                const ci = (ry + dy) * mapWidth + (rx + dx);

                if (
                  ci >= 0 &&
                  ci < mapWidth * mapHeight &&
                  terrain[ci] === TerrainName.RECESSED
                ) {
                  blocked = true;
                }
              }

            if (blocked) continue;

            generation.rooms.recess.rect.fill(
              terrain,
              rx,
              ry,
              rw,
              rh,
              mapWidth,
            );

            return { x: rx, y: ry, w: rw, h: rh };
          }

          return null;
        },

        fill: (
          terrain: TerrainName[],
          rx: number,
          ry: number,
          rw: number,
          rh: number,
          mapWidth: number,
        ) => {
          for (let dy = 0; dy < rh; dy++)
            for (let dx = 0; dx < rw; dx++) {
              const idx = (ry + dy) * mapWidth + (rx + dx);

              if (terrain[idx] === TerrainName.FLOOR)
                terrain[idx] = TerrainName.RECESSED;
            }
        },
      },
    },

    cornerRef: (
      room: Room,
      origin: RoomInteriorOrigin,
      tileWidth: number,
      tileHeight: number,
    ) => {
      const refs = {
        [RoomInteriorOrigin.TOP_RIGHT]: {
          x: (room.x + room.width) * tileWidth,
          y: room.y * tileHeight,
        },
        [RoomInteriorOrigin.TOP_LEFT]: {
          x: room.x * tileWidth,
          y: room.y * tileHeight,
        },
        [RoomInteriorOrigin.BOTTOM_RIGHT]: {
          x: (room.x + room.width) * tileWidth,
          y: (room.y + room.height) * tileHeight,
        },
        [RoomInteriorOrigin.BOTTOM_LEFT]: {
          x: room.x * tileWidth,
          y: (room.y + room.height) * tileHeight,
        },
      };

      return refs[origin];
    },

    isWallIntact: (
      terrain: TerrainName[],
      room: Room,
      piece: RoomInterior,
      mapWidth: number,
      mapHeight: number,
      tileWidth: number,
    ): boolean => {
      const furthestX = Math.min(...piece.entities.map((e) => e.x));
      const span = Math.ceil(Math.abs(furthestX) / tileWidth);

      const walls = {
        [RoomInteriorOrigin.TOP_RIGHT]: {
          along: (dx: number) => ({
            x: room.x + room.width - 1 - dx,
            y: room.y - 1,
          }),
          side: (dy: number) => ({ x: room.x + room.width, y: room.y + dy }),
          sideRange: [0, 1, 2],
        },
        [RoomInteriorOrigin.TOP_LEFT]: {
          along: (dx: number) => ({ x: room.x + dx, y: room.y - 1 }),
          side: (dy: number) => ({ x: room.x - 1, y: room.y + dy }),
          sideRange: [0, 1, 2],
        },
        [RoomInteriorOrigin.BOTTOM_RIGHT]: {
          along: (dx: number) => ({
            x: room.x + room.width - 1 - dx,
            y: room.y + room.height,
          }),
          side: (dy: number) => ({
            x: room.x + room.width,
            y: room.y + room.height - 1 + dy,
          }),
          sideRange: [-2, -1, 0],
        },
        [RoomInteriorOrigin.BOTTOM_LEFT]: {
          along: (dx: number) => ({ x: room.x + dx, y: room.y + room.height }),
          side: (dy: number) => ({
            x: room.x - 1,
            y: room.y + room.height - 1 + dy,
          }),
          sideRange: [-2, -1, 0],
        },
      };

      const { along, side, sideRange } = walls[piece.origin];
      const checks: { x: number; y: number }[] = [];

      for (let dx = 0; dx < span; dx++) checks.push(along(dx));
      for (const dy of sideRange) checks.push(side(dy));

      return checks.every(({ x, y }) => {
        if (x < 0 || y < 0 || x >= mapWidth || y >= mapHeight) return true;
        return terrain[y * mapWidth + x] !== TerrainName.FLOOR;
      });
    },

    fitsInRoom: (
      room: Room,
      piece: RoomInterior,
      tileWidth: number,
    ): boolean => {
      const furthestX = Math.min(...piece.entities.map((e) => e.x));
      return Math.abs(furthestX) <= room.width * tileWidth;
    },

    shuffle: <T>(arr: T[], rng: () => number): T[] => {
      const a = arr.slice();

      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }

      return a;
    },

    overlaps: (
      a: { minX: number; minY: number; maxX: number; maxY: number },
      b: { minX: number; minY: number; maxX: number; maxY: number },
    ) =>
      a.minX < b.maxX && a.maxX > b.minX && a.minY < b.maxY && a.maxY > b.minY,

    doorBounds: (
      terrain: TerrainName[],
      room: Room,
      mapWidth: number,
      mapHeight: number,
      tileWidth: number,
      tileHeight: number,
      clearance = 2,
    ) => {
      const boxes: {
        minX: number;
        minY: number;
        maxX: number;
        maxY: number;
      }[] = [];

      const open = (tx: number, ty: number) =>
        tx >= 0 &&
        ty >= 0 &&
        tx < mapWidth &&
        ty < mapHeight &&
        terrain[ty * mapWidth + tx] === TerrainName.FLOOR;

      const box = (tx: number, ty: number, ex: number, ey: number) => {
        const x0 = Math.min(tx, tx + ex);
        const x1 = Math.max(tx, tx + ex);
        const y0 = Math.min(ty, ty + ey);
        const y1 = Math.max(ty, ty + ey);

        boxes.push({
          minX: x0 * tileWidth,
          minY: y0 * tileHeight,
          maxX: (x1 + 1) * tileWidth,
          maxY: (y1 + 1) * tileHeight,
        });
      };

      for (let tx = room.x; tx < room.x + room.width; tx++) {
        if (open(tx, room.y - 1)) box(tx, room.y - 1, 0, clearance);
        if (open(tx, room.y + room.height))
          box(tx, room.y + room.height, 0, -clearance);
      }

      for (let ty = room.y; ty < room.y + room.height; ty++) {
        if (open(room.x - 1, ty)) box(room.x - 1, ty, clearance, 0);
        if (open(room.x + room.width, ty))
          box(room.x + room.width, ty, -clearance, 0);
      }

      return boxes;
    },
  },
};
