import { handlers } from "../../handlers";
import { NoiseGenerator } from "./Noise";
import { TerrainSmoother } from "../smoothers/Terrain";
import {
  DUNGEON_LOOP_CHANCE,
  DUNGEON_RECESS_CLUSTERS,
  DUNGEON_RECESS_MARGIN,
  DUNGEON_RECESS_MAX_H,
  DUNGEON_RECESS_MAX_W,
  DUNGEON_RECESS_MIN_DIM,
  DUNGEON_RECESS_MIN_H,
  DUNGEON_RECESS_MIN_W,
  DUNGEON_RECESS_RECTS_PER_CLUSTER,
  DUNGEON_ROOM_ATTEMPTS,
  DUNGEON_ROOM_FURNISH_CHANCE,
  DUNGEON_ROOM_PADDING,
} from "../../globals";
import { EntityName, ZoneName } from "../../types";
import {
  BiomeConfig,
  DoorAnchor,
  Entity,
  Room,
  RoomInterior,
  RoomInteriorOrigin,
  TerrainName,
} from "../../types/generation";

const MIN_WALL_RUN = 6;

export class RoomGenerator {
  private config: BiomeConfig;
  private seed: string;
  private rooms: Room[] = [];
  private doors: DoorAnchor[] = [];
  private lakes: { x: number; y: number; w: number; h: number }[] = [];

  constructor(config: BiomeConfig, seed: string) {
    this.config = config;
    this.seed = seed;
  }

  generate(): {
    terrain: TerrainName[];
    entities: Entity[];
    spawn?: { x: number; y: number };
    exit?: { x: number; y: number };
    descent?: { x: number; y: number };
    descents?: { x: number; y: number }[];
    doors: DoorAnchor[];
  } {
    const { width, height } = this.config;
    const { tileWidth, tileHeight } = this.config;

    const terrain = new Array(width * height).fill(TerrainName.VOID);
    const entities: Entity[] = [];

    this._place();

    for (const room of this.rooms) this._rectify(terrain, room);

    this._erode(terrain);

    const { edges, centers } = this._connect();
    const depths = this._depths(edges);

    for (const [a, b] of edges)
      this._corridor(terrain, centers[a], centers[b], 4);

    for (const [a, b] of edges)
      this._door(terrain, centers[a], centers[b], this.rooms[a], this.rooms[b]);

    const cleaned = handlers.generation.removeProtrusions(
      terrain,
      width,
      height,
    );
    for (let i = 0; i < cleaned.length; i++) terrain[i] = cleaned[i];

    this._carve(terrain);
    this._walls(terrain);

    this._water(terrain);

    const { rooms: roomConfig } = this.config;

    if (roomConfig) {
      const hash = handlers.generation.hash(`${this.seed}-rooms`);
      const rng = handlers.generation.seededRandom(hash);
      const assigned = handlers.generation.rooms.assign(
        this.rooms,
        depths,
        roomConfig,
        rng,
      );

      const byCorner = new Map<RoomInteriorOrigin, RoomInterior[]>();

      for (const piece of roomConfig.interior) {
        const list = byCorner.get(piece.origin) ?? [];
        list.push(piece);
        byCorner.set(piece.origin, list);
      }

      for (let i = 0; i < this.rooms.length; i++) {
        const room = this.rooms[i];
        const template = assigned[i];

        if (!template) continue;

        const isLarge =
          room.width >= roomConfig.distribution.large.size.width.min;

        for (const piece of template.enemies ?? []) {
          const count =
            piece.count.min +
            Math.floor(rng() * (piece.count.max - piece.count.min + 1));

          for (let j = 0; j < count; j++) {
            const entity =
              piece.entities[Math.floor(rng() * piece.entities.length)];
            const ox = room.x + 1 + Math.floor(rng() * (room.width - 2));
            const oy = room.y + 1 + Math.floor(rng() * (room.height - 2));

            entities.push({
              name: entity,
              x: ox * tileWidth,
              y: oy * tileHeight,
            });
          }
        }

        if (isLarge)
          for (const piece of template.traps ?? []) {
            const count =
              piece.count.min +
              Math.floor(rng() * (piece.count.max - piece.count.min + 1));

            for (let j = 0; j < count; j++) {
              const entity =
                piece.entities[Math.floor(rng() * piece.entities.length)];

              let ox = -1;
              let oy = -1;

              for (let attempt = 0; attempt < 12; attempt++) {
                const tx = room.x + 1 + Math.floor(rng() * (room.width - 2));
                const ty = room.y + 1 + Math.floor(rng() * (room.height - 2));

                let clear = true;

                for (let dy = -1; dy <= 1 && clear; dy++)
                  for (let dx = -1; dx <= 1 && clear; dx++)
                    if (
                      terrain[(ty + dy) * width + (tx + dx)] !==
                      TerrainName.FLOOR
                    )
                      clear = false;

                if (clear) {
                  ox = tx;
                  oy = ty;
                  break;
                }
              }

              if (ox < 0) continue;

              entities.push({
                name: entity,
                x: ox * tileWidth,
                y: oy * tileHeight,
              });
            }
          }

        if (!isLarge && roomConfig.interior.length) {
          const corners = handlers.generation.rooms.shuffle(
            [
              RoomInteriorOrigin.TOP_RIGHT,
              RoomInteriorOrigin.TOP_LEFT,
              RoomInteriorOrigin.BOTTOM_RIGHT,
              RoomInteriorOrigin.BOTTOM_LEFT,
            ].filter((c) => byCorner.has(c)),
            rng,
          );

          const placed = handlers.generation.rooms.doorBounds(
            terrain,
            room,
            width,
            height,
            tileWidth,
            tileHeight,
          );

          for (const corner of corners) {
            if (rng() > DUNGEON_ROOM_FURNISH_CHANCE) continue;

            const pool = byCorner.get(corner)!;
            const piece = pool[Math.floor(rng() * pool.length)];

            if (
              !handlers.generation.rooms.isWallIntact(
                terrain,
                room,
                piece,
                width,
                height,
                tileWidth,
              ) ||
              !handlers.generation.rooms.fitsInRoom(room, piece, tileWidth)
            )
              continue;

            const ref = handlers.generation.rooms.cornerRef(
              room,
              corner,
              tileWidth,
              tileHeight,
            );

            const survivors: (Entity & {
              box: { minX: number; minY: number; maxX: number; maxY: number };
            })[] = [];

            for (const e of piece.entities) {
              const ex = ref.x + e.x;
              const ey = ref.y + e.y;
              const box = {
                minX: ex - tileWidth,
                minY: ey - tileHeight,
                maxX: ex + tileWidth,
                maxY: ey + tileHeight,
              };

              if (
                placed.some((b) => handlers.generation.rooms.overlaps(b, box))
              )
                continue;

              survivors.push({ name: e.name, x: ex, y: ey, loot: e.loot, box });
            }

            for (const s of survivors) {
              placed.push(s.box);
              entities.push({ name: s.name, x: s.x, y: s.y, loot: s.loot });
            }
          }
        }
      }
    }

    const spawnRoom = this.rooms[0];

    let doorX = 0;
    let exit: { x: number; y: number } | undefined;
    let spawn: { x: number; y: number } | undefined;

    if (spawnRoom) {
      const floorTopAt = (c: number) => {
        for (let y = 0; y < height; y++)
          if (terrain[y * width + c] === TerrainName.FLOOR) return y;
        return -1;
      };

      let col = spawnRoom.x + Math.floor(spawnRoom.width / 2);
      let top = floorTopAt(col);

      if (top >= 0) {
        let left = col;
        let right = col;
        while (
          left - 1 >= 0 &&
          terrain[top * width + left - 1] === TerrainName.FLOOR
        )
          left--;
        while (
          right + 1 < width &&
          terrain[top * width + right + 1] === TerrainName.FLOOR
        )
          right++;
        col = (left + right) >> 1;
        top = floorTopAt(col);
      }

      if (top < 0) top = spawnRoom.y;

      doorX = col * tileWidth;
      exit = { x: doorX, y: (top - 1) * tileHeight };
      spawn = { x: doorX, y: (top + 1) * tileHeight };
    }

    let deepest = 0;
    for (let i = 1; i < depths.length; i++)
      if (depths[i] > depths[deepest]) deepest = i;

    const deepRoom = this.rooms[deepest];
    const descent = deepRoom
      ? {
          x: (deepRoom.x + Math.floor(deepRoom.width / 2)) * tileWidth,
          y: (deepRoom.y + Math.floor(deepRoom.height / 2)) * tileHeight,
        }
      : undefined;

    const fish = this.config.rooms?.water?.fish;

    if (fish?.length)
      for (const lake of this.lakes) {
        entities.push({
          name: EntityName.ZONE,
          x: lake.x,
          y: lake.y,
          zone: { type: ZoneName.FISH, width: lake.w, height: lake.h, fish },
        });
        entities.push({
          name: EntityName.TEXTURE_SPAWNER,
          x: lake.x,
          y: lake.y,
          textureSpawner: {
            sprites: fish,
            duration: 15000,
            radius: Math.min(lake.w, lake.h) / 2,
            frames: 9,
            frameRate: 12,
          },
        });
      }

    return { terrain, entities, spawn, exit, descent, doors: this.doors };
  }

  private _place() {
    const hash = handlers.generation.hash(this.seed);
    const rng = handlers.generation.seededRandom(hash);

    const { width, height } = this.config;
    if (!this.config.rooms) return;
    const { large, small } = this.config.rooms.distribution;

    const largeRange = large.yRange
      ? {
          min: Math.floor(large.yRange.min * height),
          max: Math.floor(large.yRange.max * height),
        }
      : undefined;

    handlers.generation.rooms.place(
      width,
      height,
      large.size,
      large.count.max,
      DUNGEON_ROOM_PADDING,
      this.rooms,
      rng,
      largeRange,
    );
    handlers.generation.rooms.place(
      width,
      height,
      small.size,
      DUNGEON_ROOM_ATTEMPTS,
      DUNGEON_ROOM_PADDING,
      this.rooms,
      rng,
    );
  }

  private _rectify(terrain: TerrainName[], room: Room) {
    const { width } = this.config;

    for (let dy = 0; dy < room.height; dy++)
      for (let dx = 0; dx < room.width; dx++)
        terrain[(room.y + dy) * width + (room.x + dx)] = TerrainName.FLOOR;
  }

  private _erode(terrain: TerrainName[]) {
    const cfg = this.config.rooms?.erosion;
    if (!cfg) return;

    const { width } = this.config;
    const noise = new NoiseGenerator({
      seed: `${this.seed}-erode`,
      scale: cfg.scale,
      octaves: 2,
    });

    for (const room of this.rooms) {
      const reach = Math.max(2, Math.min(room.width, room.height) * cfg.band);

      for (let dy = 0; dy < room.height; dy++)
        for (let dx = 0; dx < room.width; dx++) {
          if (dy < cfg.north) continue;

          const gx = room.x + dx;
          const gy = room.y + dy;
          const idx = gy * width + gx;
          if (terrain[idx] !== TerrainName.FLOOR) continue;

          const edge = Math.min(dx, room.width - 1 - dx, room.height - 1 - dy);
          const norm = Math.min(1, edge / reach);
          const n = (noise.generate(gx, gy) + 1) / 2;
          if (n < cfg.threshold * (1 - norm)) terrain[idx] = TerrainName.VOID;
        }
    }

    if (cfg.smoothing > 0) {
      const smoother = new TerrainSmoother(this.config);
      const smoothed = smoother.smooth(terrain, cfg.smoothing, 4, "all");
      for (let i = 0; i < smoothed.length; i++) terrain[i] = smoothed[i];
    }

    if (cfg.clearance > 0) this._clearance(terrain, cfg.clearance);

    if (cfg.quantize > 1) this._quantize(terrain, cfg.quantize);

    this._widenPinches(terrain);

    this._prune(terrain);
  }

  private _widenPinches(terrain: TerrainName[]) {
    const { width, height } = this.config;

    for (let x = 0; x < width; x++)
      for (let y = 0; y < height; ) {
        if (terrain[y * width + x] !== TerrainName.VOID) {
          y++;
          continue;
        }

        const start = y;
        while (y < height && terrain[y * width + x] === TerrainName.VOID) y++;
        const end = y - 1;

        const floorAbove =
          start > 0 && terrain[(start - 1) * width + x] === TerrainName.FLOOR;
        const floorBelow =
          end < height - 1 &&
          terrain[(end + 1) * width + x] === TerrainName.FLOOR;

        if (floorAbove && floorBelow && end - start + 1 < MIN_WALL_RUN)
          for (let yy = start; yy <= end; yy++)
            terrain[yy * width + x] = TerrainName.FLOOR;
      }
  }

  private _prune(terrain: TerrainName[]) {
    const { width, height } = this.config;
    const gen = handlers.generation;

    const exterior = gen.flood(
      width,
      height,
      (i) => terrain[i] === TerrainName.VOID,
      gen.borderIndices(width, height),
    );

    for (let i = 0; i < terrain.length; i++)
      if (terrain[i] === TerrainName.VOID && !exterior[i])
        terrain[i] = TerrainName.FLOOR;

    const centers = this.rooms.map(
      (room) =>
        (room.y + (room.height >> 1)) * width + room.x + (room.width >> 1),
    );
    const keep = gen.flood(
      width,
      height,
      (i) => terrain[i] === TerrainName.FLOOR,
      centers,
    );

    for (let i = 0; i < terrain.length; i++)
      if (terrain[i] === TerrainName.FLOOR && !keep[i])
        terrain[i] = TerrainName.VOID;
  }

  private _quantize(terrain: TerrainName[], q: number) {
    const { width, height } = this.config;
    const src = terrain.slice();

    for (let by = 0; by < height; by += q)
      for (let bx = 0; bx < width; bx += q) {
        let floor = 0;
        let total = 0;

        for (let dy = 0; dy < q && by + dy < height; dy++)
          for (let dx = 0; dx < q && bx + dx < width; dx++) {
            total++;
            if (src[(by + dy) * width + (bx + dx)] === TerrainName.FLOOR)
              floor++;
          }

        const fill = floor * 2 >= total ? TerrainName.FLOOR : TerrainName.VOID;

        for (let dy = 0; dy < q && by + dy < height; dy++)
          for (let dx = 0; dx < q && bx + dx < width; dx++)
            terrain[(by + dy) * width + (bx + dx)] = fill;
      }
  }

  private _clearance(terrain: TerrainName[], radius: number) {
    const closed = this._morph(
      this._morph(terrain, radius, true),
      radius,
      false,
    );
    const opened = this._morph(
      this._morph(closed, radius, false),
      radius,
      true,
    );
    for (let i = 0; i < opened.length; i++) terrain[i] = opened[i];
  }

  private _morph(
    src: TerrainName[],
    radius: number,
    dilate: boolean,
  ): TerrainName[] {
    const { width, height } = this.config;
    const out = new Array<TerrainName>(src.length);

    for (let y = 0; y < height; y++)
      for (let x = 0; x < width; x++) {
        let result = !dilate;

        for (let dy = -radius; dy <= radius && result !== dilate; dy++)
          for (let dx = -radius; dx <= radius && result !== dilate; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            const floor =
              nx >= 0 &&
              nx < width &&
              ny >= 0 &&
              ny < height &&
              src[ny * width + nx] === TerrainName.FLOOR;

            result = dilate ? result || floor : result && floor;
          }

        out[y * width + x] = result ? TerrainName.FLOOR : TerrainName.VOID;
      }

    return out;
  }

  private _water(terrain: TerrainName[]) {
    const cfg = this.config.rooms?.water;
    if (!cfg) return;

    const { width } = this.config;
    const rng = handlers.generation.seededRandom(
      handlers.generation.hash(`${this.seed}-water`),
    );
    const noise = new NoiseGenerator({
      seed: `${this.seed}-water`,
      scale: cfg.scale,
      octaves: 2,
    });

    for (const room of this.rooms) {
      if (rng() > cfg.chance) continue;

      const radius =
        cfg.radius.min +
        Math.floor(rng() * (cfg.radius.max - cfg.radius.min + 1));
      const margin = radius + 2;

      if (room.width < 2 * margin || room.height < 2 * margin) continue;

      const jitter = 3;
      const cx =
        room.x +
        (room.width >> 1) +
        Math.floor(rng() * (2 * jitter + 1)) -
        jitter;
      const cy =
        room.y +
        (room.height >> 1) +
        Math.floor(rng() * (2 * jitter + 1)) -
        jitter;

      for (let dy = -radius; dy <= radius; dy++)
        for (let dx = -radius; dx <= radius; dx++) {
          const gx = cx + dx;
          const gy = cy + dy;
          const idx = gy * width + gx;
          if (terrain[idx] !== TerrainName.FLOOR) continue;

          const dist = Math.sqrt(dx * dx + dy * dy) / radius;
          const n = (noise.generate(gx, gy) + 1) / 2;
          if (dist < cfg.threshold || n > dist)
            terrain[idx] = TerrainName.WATER;
        }
    }

    const cleaned = handlers.generation.enforceMinimumWater(
      terrain,
      width,
      this.config.height,
    );
    for (let i = 0; i < cleaned.length; i++) terrain[i] = cleaned[i];

    for (const room of this.rooms) {
      let minx = Infinity;
      let maxx = -Infinity;
      let miny = Infinity;
      let maxy = -Infinity;
      const cells: number[] = [];

      for (let dy = 0; dy < room.height; dy++)
        for (let dx = 0; dx < room.width; dx++) {
          const idx = (room.y + dy) * width + (room.x + dx);
          if (terrain[idx] !== TerrainName.WATER) continue;
          cells.push(idx);
          if (dx < minx) minx = dx;
          if (dx > maxx) maxx = dx;
          if (dy < miny) miny = dy;
          if (dy > maxy) maxy = dy;
        }

      if (!cells.length) continue;

      if (maxx - minx + 1 < 4 || maxy - miny + 1 < 4) {
        for (const idx of cells) terrain[idx] = TerrainName.FLOOR;
        continue;
      }

      const { tileWidth, tileHeight } = this.config;
      this.lakes.push({
        x: (room.x + (minx + maxx) / 2 + 0.5) * tileWidth,
        y: (room.y + (miny + maxy) / 2 + 0.5) * tileHeight,
        w: (maxx - minx + 1) * tileWidth,
        h: (maxy - miny + 1) * tileHeight,
      });
    }
  }

  private _connect() {
    const gen = handlers.generation;
    const rng = gen.seededRandom(gen.hash(`${this.seed}-corridors`));
    const centers = this.rooms.map((r) => ({
      x: r.x + Math.floor(r.width / 2),
      y: r.y + Math.floor(r.height / 2),
    }));

    const n = centers.length;
    const inTree = new Array(n).fill(false);
    const edges: [number, number][] = [];

    inTree[0] = true;

    for (let added = 1; added < n; added++) {
      const best = { dist: Infinity, from: 0, to: 0 };

      for (let i = 0; i < n; i++) {
        if (!inTree[i]) continue;

        for (let j = 0; j < n; j++) {
          if (inTree[j]) continue;

          const dx = centers[i].x - centers[j].x;
          const dy = centers[i].y - centers[j].y;
          const dist = dx * dx + dy * dy;

          if (dist < best.dist) {
            best.dist = dist;
            best.from = i;
            best.to = j;
          }
        }
      }

      inTree[best.to] = true;
      edges.push([best.from, best.to]);
    }

    for (let i = 0; i < n; i++)
      for (let j = i + 1; j < n; j++) {
        const already = edges.some(
          ([a, b]) => (a === i && b === j) || (a === j && b === i),
        );

        if (!already && rng() < DUNGEON_LOOP_CHANCE) edges.push([i, j]);
      }

    const mstCount = n - 1;
    const degree = new Array(n).fill(0);

    for (const [a, b] of edges) {
      degree[a]++;
      degree[b]++;
    }

    for (let e = edges.length - 1; e >= mstCount; e--) {
      const [a, b] = edges[e];

      if (degree[a] > 4 || degree[b] > 4) {
        degree[a]--;
        degree[b]--;
        edges.splice(e, 1);
      }
    }

    return { edges, centers };
  }

  private _corridor(
    terrain: TerrainName[],
    from: { x: number; y: number },
    to: { x: number; y: number },
    thickness: number,
  ) {
    const { width, height } = this.config;
    const direction = { x: to.x - from.x, y: to.y - from.y };
    const lo = -Math.floor((thickness - 1) / 2);
    const hi = lo + thickness - 1;

    for (let x = from.x; x !== to.x; x += Math.sign(direction.x))
      for (let dy = lo; dy <= hi; dy++) {
        const py = from.y + dy;
        if (py >= 0 && py < height) terrain[py * width + x] = TerrainName.FLOOR;
      }

    for (let y = from.y; y !== to.y; y += Math.sign(direction.y))
      for (let dx = lo; dx <= hi; dx++) {
        const px = to.x + dx;
        if (px >= 0 && px < width) terrain[y * width + px] = TerrainName.FLOOR;
      }

    for (let dy = lo; dy <= hi; dy++)
      for (let dx = lo; dx <= hi; dx++) {
        const px = to.x + dx;
        const py = from.y + dy;

        if (px >= 0 && px < width && py >= 0 && py < height)
          terrain[py * width + px] = TerrainName.FLOOR;
      }
  }

  private _door(
    terrain: TerrainName[],
    from: { x: number; y: number },
    to: { x: number; y: number },
    roomA: Room,
    roomB: Room,
  ) {
    const col = to.x;

    const dirB: "north" | "south" | null =
      from.y < roomB.y
        ? "north"
        : from.y > roomB.y + roomB.height - 1
          ? "south"
          : null;

    const dirA: "north" | "south" | null =
      col >= roomA.x && col <= roomA.x + roomA.width - 1
        ? to.y < roomA.y
          ? "north"
          : to.y > roomA.y + roomA.height - 1
            ? "south"
            : null
        : null;

    if (dirB && dirA) {
      const edgeYB = dirB === "north" ? roomB.y : roomB.y + roomB.height - 1;
      const edgeYA = dirA === "north" ? roomA.y : roomA.y + roomA.height - 1;

      if (Math.abs(edgeYB - edgeYA) - 1 < 8) return;
    }

    this._tryDoor(terrain, col, roomB, dirB);
    this._tryDoor(terrain, col, roomA, dirA);
  }

  private _tryDoor(
    terrain: TerrainName[],
    col: number,
    room: Room,
    dir: "north" | "south" | null,
  ) {
    if (!dir) return;

    const { width, height } = this.config;
    const edgeY = dir === "north" ? room.y : room.y + room.height - 1;
    const step = dir === "north" ? -1 : 1;

    for (let i = 1; i <= 4; i++) {
      const y = edgeY + step * i;

      if (y < 0 || y >= height) return;
      if (terrain[y * width + col] !== TerrainName.FLOOR) return;
      if (this._inAnyRoom(col, y)) return;
    }

    const wallRow = edgeY + step;
    const left = col - 2;
    const right = col + 3;

    if (left < 0 || right >= width) return;

    if (left < room.x || right > room.x + room.width - 1) return;

    for (let x = col - 1; x <= col + 2; x++)
      if (terrain[wallRow * width + x] !== TerrainName.FLOOR) return;

    if (terrain[wallRow * width + left] !== TerrainName.VOID) return;
    if (terrain[wallRow * width + right] !== TerrainName.VOID) return;

    this.doors.push({ x: col, y: edgeY, dir });
  }

  private _inAnyRoom(x: number, y: number): boolean {
    for (const room of this.rooms)
      if (
        x >= room.x &&
        x <= room.x + room.width - 1 &&
        y >= room.y &&
        y <= room.y + room.height - 1
      )
        return true;

    return false;
  }

  private _walls(terrain: TerrainName[]) {
    const { width, height } = this.config;

    const layers: [TerrainName, TerrainName][] = [
      [TerrainName.FLOOR, TerrainName.WALL_BASE],
      [TerrainName.WALL_BASE, TerrainName.WALL_MID],
      [TerrainName.WALL_MID, TerrainName.WALL_TOP],
    ];

    for (const [below, becomes] of layers)
      for (let y = 0; y < height - 1; y++)
        for (let x = 0; x < width; x++) {
          const idx = y * width + x;

          if (terrain[idx] !== TerrainName.VOID) continue;
          if (terrain[(y + 1) * width + x] === below) terrain[idx] = becomes;
        }
  }

  private _depths(edges: [number, number][]): number[] {
    const n = this.rooms.length;
    const adj: number[][] = Array.from({ length: n }, () => []);

    for (const [a, b] of edges) {
      adj[a].push(b);
      adj[b].push(a);
    }

    const depths = new Array(n).fill(-1);
    depths[0] = 0;

    const queue = [0];

    for (let i = 0; i < queue.length; i++) {
      const current = queue[i];

      for (const neighbor of adj[current]) {
        if (depths[neighbor] !== -1) continue;
        depths[neighbor] = depths[current] + 1;
        queue.push(neighbor);
      }
    }

    return depths;
  }

  private _carve(terrain: TerrainName[]) {
    const { width } = this.config;

    if (!this.config.rooms) return;
    if (!this.config.rooms.hasRecesses) return;

    const { large } = this.config.rooms.distribution;

    const hash = handlers.generation.hash(`${this.seed}-pools`);
    const rng = handlers.generation.seededRandom(hash);

    for (const room of this.rooms) {
      if (room.width < large.size.width.min) continue;

      const inner = {
        width: room.width - 2 * DUNGEON_RECESS_MARGIN,
        height: room.height - 2 * DUNGEON_RECESS_MARGIN,
      };

      if (
        inner.width < DUNGEON_RECESS_MIN_DIM ||
        inner.height < DUNGEON_RECESS_MIN_DIM
      )
        continue;

      for (let c = 0; c < DUNGEON_RECESS_CLUSTERS; c++) {
        const anchor = handlers.generation.rooms.recess.rect.place(
          terrain,
          room,
          inner.width,
          inner.height,
          width,
          this.config.height,
          rng,
        );
        if (!anchor) continue;

        for (let r = 1; r < DUNGEON_RECESS_RECTS_PER_CLUSTER; r++) {
          const rw = Math.min(
            inner.width,
            DUNGEON_RECESS_MIN_W +
              Math.floor(rng() * (DUNGEON_RECESS_MAX_W - DUNGEON_RECESS_MIN_W)),
          );
          const rh = Math.min(
            inner.height,
            DUNGEON_RECESS_MIN_H +
              Math.floor(rng() * (DUNGEON_RECESS_MAX_H - DUNGEON_RECESS_MIN_H)),
          );

          let rx =
            anchor.x + Math.floor(rng() * anchor.w) - Math.floor(rw * 0.3);
          let ry =
            anchor.y + Math.floor(rng() * anchor.h) - Math.floor(rh * 0.3);

          rx = Math.max(
            room.x + DUNGEON_RECESS_MARGIN,
            Math.min(rx, room.x + room.width - DUNGEON_RECESS_MARGIN - rw),
          );
          ry = Math.max(
            room.y + DUNGEON_RECESS_MARGIN,
            Math.min(ry, room.y + room.height - DUNGEON_RECESS_MARGIN - rh),
          );

          handlers.generation.rooms.recess.rect.fill(
            terrain,
            rx,
            ry,
            rw,
            rh,
            width,
          );
        }
      }
    }
  }
}
