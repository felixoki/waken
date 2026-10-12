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
  DUNGEON_WALL_SPAN,
  DUNGEON_ROOM_PADDING,
  ROOM_ENEMY_ATTEMPTS,
} from "../../globals";
import { ComponentName, EntityName, ZoneName } from "../../types";
import { configs } from "../../configs";
import {
  BiomeConfig,
  DoorAnchor,
  Entity,
  Room,
  RoomInterior,
  RoomInteriorOrigin,
  SeparatorStamp,
  Setpiece,
  SetpiecePlacement,
  TerrainName,
} from "../../types/generation";
import { SeparatorGenerator } from "./Separator";

const MIN_WALL_RUN = 6;
const POND_HEADROOM = 4;
const EXIT_SPAN = [-2, -1, 0, 1];
const POND_CHANNEL = 3;
const POND_MIN_AREA = 28;
const POND_WOBBLE = 0.5;
const POND_BODY = 6;
const POND_SHORE_REACH = 3;
const TUNNEL_HEADROOM = 3;
const TUNNEL_BULGE = 0.3;
const RECESS_CLEARANCE = 2;
const RECESS_MIN = 5;
const TRAP_WIDTH = 3;
const TRAP_DEPTH = 4;
const TRAP_MARGIN = 3;
const TRAP_SPACING = 12;

export class RoomGenerator {
  private config: BiomeConfig;
  private seed: string;
  private rooms: Room[] = [];
  private doors: DoorAnchor[] = [];
  private lakes: {
    x: number;
    y: number;
    w: number;
    h: number;
    deep: { x: number; y: number; radius: number };
  }[] = [];
  private isles: Uint8Array;
  private treasures = new Map<Room, { x: number; y: number }>();

  constructor(config: BiomeConfig, seed: string) {
    this.config = config;
    this.seed = seed;
    this.isles = new Uint8Array(config.width * config.height);
  }

  generate(): {
    terrain: TerrainName[];
    entities: Entity[];
    spawn?: { x: number; y: number };
    exit?: { x: number; y: number };
    doors: DoorAnchor[];
    separators: SeparatorStamp[];
    setpieces: SetpiecePlacement[];
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

    const grid = this.config.rooms?.erosion?.quantize ?? 0;

    for (const [a, b] of edges)
      if (grid > 1) this._tunnel(terrain, centers[a], centers[b], grid);
      else this._corridor(terrain, centers[a], centers[b], 4);

    this._bridge(terrain);

    for (const [a, b] of edges)
      this._door(terrain, centers[a], centers[b], this.rooms[a], this.rooms[b]);

    const cleaned = handlers.generation.removeProtrusions(
      terrain,
      width,
      height,
    );
    for (let i = 0; i < cleaned.length; i++) terrain[i] = cleaned[i];

    const step = this.config.rooms?.erosion?.step ?? 0;
    if (step > 1)
      while (this._level(terrain, step) || this._widenPinches(terrain));

    this._walls(terrain);

    const altars = this._altars(terrain);
    const sacred = new Set(altars.map((a) => a.room));

    const draft = [...terrain];
    const pits = new Uint8Array(width * height);

    this._carve(draft, pits);

    for (let i = 0; i < draft.length; i++)
      if (draft[i] === TerrainName.RECESSED) pits[i] = 1;

    const separators = new SeparatorGenerator(this.config, this.seed).generate(
      terrain,
      this.rooms,
      this.doors,
      pits,
      sacred,
    );

    this._carve(terrain, separators.occupied);
    this._water(terrain);

    entities.push(...separators.entities);
    entities.push(...this._traps(terrain));

    const { rooms: roomConfig } = this.config;

    if (roomConfig) {
      const hash = handlers.generation.hash(`${this.seed}-rooms`);
      const rng = handlers.generation.seededRandom(hash);
      const assigned = handlers.generation.rooms.assign(
        this.rooms,
        depths,
        roomConfig,
        rng,
        this.config.origin,
      );

      if (roomConfig.assignment.uniform) assigned.fill(assigned[0]);

      const lair = depths.lastIndexOf(Math.max(...depths));

      const byCorner = new Map<RoomInteriorOrigin, RoomInterior[]>();

      for (const piece of roomConfig.interior) {
        const list = byCorner.get(piece.origin) ?? [];
        list.push(piece);
        byCorner.set(piece.origin, list);
      }

      for (let i = 0; i < this.rooms.length; i++) {
        const room = this.rooms[i];
        const template = assigned[i];
        const altar = altars.find((a) => a.room === i);
        const shrine = altar && roomConfig.altars;

        if (!template && !shrine) continue;

        const isLarge =
          room.width >= roomConfig.distribution.large.size.width.min;

        const groups = shrine
          ? shrine.enemies
          : template?.solitary && i !== lair
            ? []
            : (template?.enemies ?? []);

        for (const piece of groups) {
          const count =
            piece.count.min +
            Math.floor(rng() * (piece.count.max - piece.count.min + 1));

          for (let j = 0; j < count; j++) {
            const entity =
              piece.entities[Math.floor(rng() * piece.entities.length)];

            for (let attempt = 0; attempt < ROOM_ENEMY_ATTEMPTS; attempt++) {
              const ox = room.x + 1 + Math.floor(rng() * (room.width - 2));
              const oy = room.y + 1 + Math.floor(rng() * (room.height - 2));

              if (separators.occupied[oy * width + ox]) continue;
              if (this._blocked(terrain, oy * width + ox)) continue;
              if (
                altar &&
                ox >= altar.x &&
                ox < altar.x + altar.setpiece.width &&
                oy < altar.y + altar.setpiece.height
              )
                continue;

              entities.push({
                name: entity,
                x: ox * tileWidth,
                y: oy * tileHeight,
              });
              break;
            }
          }
        }

        if (altar && shrine) {
          for (const e of altar.setpiece.entities) {
            const storage = configs.entities[e.name]?.components.find(
              (c) => c.name === ComponentName.STORAGE,
            );
            const stocked =
              storage?.name === ComponentName.STORAGE && storage.config.loot;

            entities.push({
              name: e.name,
              x: altar.x * tileWidth + e.x,
              y: altar.y * tileHeight + e.y,
              loot: storage && !stocked ? shrine.loot : undefined,
            });
          }

          if (shrine.boss && altar === altars[0])
            entities.push({
              name: shrine.boss,
              x: (room.x + (room.width >> 1)) * tileWidth + tileWidth / 2,
              y: (altar.y + altar.setpiece.height + 1) * tileHeight,
            });

          if (shrine.exit && altar === altars[0]) {
            const offset = configs.entities[shrine.exit.entity]?.offset;

            entities.push({
              name: shrine.exit.entity,
              x:
                (altar.x + altar.setpiece.width) * tileWidth +
                tileWidth / 2 +
                (offset?.x ?? 0),
              y: room.y * tileHeight - tileHeight / 2 + (offset?.y ?? 0),
            });
          }

          continue;
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

          const taken: typeof placed = [];

          for (let y = room.y; y < room.y + room.height; y++)
            for (let x = room.x; x < room.x + room.width; x++)
              if (separators.occupied[y * width + x])
                taken.push({
                  minX: x * tileWidth,
                  minY: y * tileHeight,
                  maxX: (x + 1) * tileWidth,
                  maxY: (y + 1) * tileHeight,
                });

          const spots = corners.map((origin) => ({
            origin,
            ref: handlers.generation.rooms.cornerRef(
              room,
              origin,
              tileWidth,
              tileHeight,
            ),
            alcove: false,
          }));

          if (roomConfig.alcoves)
            for (const corner of separators.corners)
              if (corner.room === i && byCorner.has(corner.origin))
                spots.push({
                  origin: corner.origin,
                  ref: { x: corner.x * tileWidth, y: corner.y * tileHeight },
                  alcove: true,
                });

          const bounds = {
            minX: room.x * tileWidth,
            maxX: (room.x + room.width) * tileWidth,
            maxY: (room.y + room.height) * tileHeight,
          };

          let major = false;

          for (const { origin, ref, alcove } of spots) {
            if (rng() > (roomConfig.furnish ?? DUNGEON_ROOM_FURNISH_CHANCE))
              continue;

            const pool = byCorner.get(origin)!;
            const options = roomConfig.intact
              ? handlers.generation.rooms.shuffle(pool, rng)
              : [pool[Math.floor(rng() * pool.length)]];

            for (const piece of options) {
              if (piece.major && major) continue;

              if (
                !alcove &&
                (!handlers.generation.rooms.isWallIntact(
                  terrain,
                  room,
                  piece,
                  width,
                  height,
                  tileWidth,
                ) ||
                  !handlers.generation.rooms.fitsInRoom(room, piece, tileWidth))
              )
                continue;

              const survivors: (Entity & {
                box: { minX: number; minY: number; maxX: number; maxY: number };
              })[] = [];

              for (const e of piece.entities) {
                const ex = ref.x + e.x;
                const ey = ref.y + e.y;
                const extent = RoomGenerator.extent(e.name, tileWidth, tileHeight);
                const inset = configs.entities[e.name]?.flat ? tileWidth : 0;
                const box = {
                  minX: ex - extent.x + inset,
                  minY: ey - extent.y + inset,
                  maxX: ex + extent.x - inset,
                  maxY: ey + extent.y - inset,
                };

                if (
                  alcove &&
                  (box.minX < bounds.minX ||
                    box.maxX > bounds.maxX ||
                    box.maxY > bounds.maxY)
                )
                  continue;

                if (
                  placed.some((b) => handlers.generation.rooms.overlaps(b, box))
                )
                  continue;

                if (taken.some((b) => handlers.generation.rooms.overlaps(b, box)))
                  continue;

                survivors.push({ name: e.name, x: ex, y: ey, loot: e.loot, box });
              }

              if (roomConfig.intact && survivors.length < piece.entities.length)
                continue;

              for (const s of survivors) {
                placed.push(s.box);
                entities.push({ name: s.name, x: s.x, y: s.y, loot: s.loot });
              }

              major ||= !!piece.major;

              break;
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
      /** Seed a flood from every floor tile in the spawn room so the exit
       * anchor is always on floor reachable from where the player materializes,
       * even if erosion or water carved through the room centre. */
      const seeds: number[] = [];

      for (let y = spawnRoom.y; y < spawnRoom.y + spawnRoom.height; y++)
        for (let x = spawnRoom.x; x < spawnRoom.x + spawnRoom.width; x++) {
          const i = y * width + x;
          if (terrain[i] === TerrainName.FLOOR) seeds.push(i);
        }

      const reachable = handlers.generation.flood(
        width,
        height,
        (i) => terrain[i] === TerrainName.FLOOR,
        seeds,
      );

      /** Topmost reachable floor tile inside the spawn room becomes the exit */
      let anchor = -1;

      const lift = this.config.rooms?.erosion?.quantize ?? 0;

      for (
        let y = Math.max(0, spawnRoom.y - lift);
        y < spawnRoom.y + spawnRoom.height && anchor < 0;
        y++
      )
        for (let x = spawnRoom.x; x < spawnRoom.x + spawnRoom.width; x++) {
          const i = y * width + x;
          if (reachable[i]) {
            anchor = i;
            break;
          }
        }

      const faced = (x: number, y: number) =>
        EXIT_SPAN.every(
          (dx) =>
            reachable[y * width + x + dx] &&
            terrain[(y - 1) * width + x + dx] === TerrainName.WALL_BASE,
        );
      const face: number[] = [];

      for (
        let y = Math.max(1, spawnRoom.y - lift);
        lift > 0 && y < spawnRoom.y + spawnRoom.height && !face.length;
        y++
      )
        for (let x = spawnRoom.x; x < spawnRoom.x + spawnRoom.width; x++)
          if (faced(x, y)) face.push(y * width + x);

      if (lift > 0 && !face.length) {
        const cx = spawnRoom.x + (spawnRoom.width >> 1);
        let nearest = Infinity;

        for (let y = 1; y < height; y++)
          for (let x = 2; x < width - 1; x++) {
            if (!faced(x, y)) continue;

            const dist = Math.abs(x - cx) + Math.abs(y - spawnRoom.y);
            if (dist >= nearest) continue;

            nearest = dist;
            face.length = 0;
            face.push(y * width + x);
          }
      }

      if (face.length) anchor = face[face.length >> 1];

      if (anchor >= 0) {
        const ay = (anchor / width) | 0;

        let left = anchor % width;
        let right = anchor % width;
        while (left - 1 >= 0 && reachable[ay * width + left - 1]) left--;
        while (right + 1 < width && reachable[ay * width + right + 1]) right++;
        const col = face.length ? anchor % width : (left + right) >> 1;

        doorX = col * tileWidth;
        exit = { x: doorX, y: Math.max(0, ay - 1) * tileHeight };
        spawn = { x: doorX, y: (ay + 1) * tileHeight };
      }
    }

    const treasure = this.config.rooms?.water?.treasure;

    if (treasure)
      for (const isle of this.treasures.values())
        entities.push({
          name: treasure.entity,
          x: (isle.x + 0.5) * tileWidth,
          y: (isle.y + 0.5) * tileHeight,
          loot: treasure.loot,
        });

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
          x: lake.deep.x,
          y: lake.deep.y,
          textureSpawner: {
            sprites: fish,
            duration: 15000,
            radius: lake.deep.radius,
            frames: 9,
            frameRate: 12,
          },
        });
      }

    return {
      terrain,
      entities,
      spawn,
      exit,
      doors: this.doors,
      separators: separators.stamps,
      setpieces: altars.map(({ setpiece, x, y, room }) => ({
        setpiece,
        x,
        y,
        span: { x: this.rooms[room].x, width: this.rooms[room].width },
      })),
    };
  }

  static extent(
    name: EntityName,
    tileWidth: number,
    tileHeight: number,
  ): { x: number; y: number } {

    for (const component of configs.entities[name]?.components ?? []) {
      if (
        component.name !== ComponentName.TEXTURE &&
        component.name !== ComponentName.TEXTURE_ANIMATION
      )
        continue;

      const { tiles, tileSize } = component.config;
      const columns = Math.max(...tiles.map((t) => t.end - t.start + 1));

      return {
        x: Math.max(tileWidth, (columns * tileSize) / 2),
        y: Math.max(tileHeight, (tiles.length * tileSize) / 2),
      };
    }

    return { x: tileWidth, y: tileHeight };
  }

  private _traps(terrain: TerrainName[]): Entity[] {
    const settings = this.config.rooms?.traps;
    if (!settings) return [];

    const { width, height, tileWidth, tileHeight } = this.config;
    const rng = handlers.generation.seededRandom(
      handlers.generation.hash(`${this.seed}-traps`),
    );

    const passage = (x: number, y: number) =>
      x >= 0 &&
      y >= 0 &&
      x < width &&
      y < height &&
      terrain[y * width + x] === TerrainName.FLOOR &&
      !this._inAnyRoom(x, y);

    const walled = (x: number, y: number) =>
      x < 0 ||
      y < 0 ||
      x >= width ||
      y >= height ||
      terrain[y * width + x] !== TerrainName.FLOOR;

    const span = (x: number, y: number, dx: number, dy: number) => {
      if (!passage(x, y)) return null;

      let from = 0;
      let to = 0;

      while (passage(x + (from - 1) * dx, y + (from - 1) * dy)) from--;
      while (passage(x + (to + 1) * dx, y + (to + 1) * dy)) to++;

      if (!walled(x + (from - 1) * dx, y + (from - 1) * dy)) return null;
      if (!walled(x + (to + 1) * dx, y + (to + 1) * dy)) return null;

      return { from, to };
    };

    const sites: { x: number; y: number }[] = [];

    const gated = (x: number, y: number) =>
      this.doors.some((door) => {
        const top = door.dir === "north" ? door.y - 3 : door.y + 1;

        return (
          Math.abs(door.x - x) <= TRAP_WIDTH + TRAP_MARGIN &&
          y + TRAP_DEPTH + TRAP_MARGIN > top &&
          y - TRAP_MARGIN < top + 3
        );
      });

    for (let y = TRAP_MARGIN; y < height - TRAP_MARGIN; y++)
      for (let x = TRAP_MARGIN; x < width - TRAP_MARGIN; x++) {
        if (gated(x, y)) continue;

        const across = span(x, y, 1, 0);

        if (across && across.from === 0 && across.to === TRAP_WIDTH) {
          let straight = true;

          for (let r = -TRAP_MARGIN; r < TRAP_DEPTH + TRAP_MARGIN; r++) {
            const row = span(x, y + r, 1, 0);
            if (!row || row.from !== 0 || row.to !== TRAP_WIDTH) straight = false;
          }

          if (straight)
            sites.push({
              x: ((x + (TRAP_WIDTH + 1) / 2) * tileWidth) | 0,
              y: (y + 1) * tileHeight,
            });
        }

        const along = span(x, y, 0, 1);

        if (along && along.from === 0 && along.to === TRAP_DEPTH - 1) {
          let straight = true;

          for (let c = -TRAP_MARGIN; c < TRAP_WIDTH + TRAP_MARGIN; c++) {
            const column = span(x + c, y, 0, 1);
            const below = terrain[(y + TRAP_DEPTH) * width + x + c];

            if (!column || column.from !== 0 || column.to !== TRAP_DEPTH - 1)
              straight = false;
            if (below !== TerrainName.VOID && below !== TerrainName.WALL_TOP)
              straight = false;
          }

          if (straight)
            sites.push({
              x: ((x + TRAP_WIDTH / 2) * tileWidth) | 0,
              y: (y + 1) * tileHeight,
            });
        }
      }

    const count =
      settings.count.min +
      Math.floor(rng() * (settings.count.max - settings.count.min + 1));
    const traps: Entity[] = [];

    for (const site of handlers.generation.rooms.shuffle(sites, rng)) {
      if (traps.length >= count) break;

      const crowded = traps.some(
        (t) =>
          Math.abs(t.x - site.x) < TRAP_SPACING * tileWidth &&
          Math.abs(t.y - site.y) < TRAP_SPACING * tileHeight,
      );
      if (crowded) continue;

      traps.push({
        name: settings.entities[Math.floor(rng() * settings.entities.length)],
        x: site.x,
        y: site.y,
      });
    }

    return traps;
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

    const { limit } = this.config.rooms.distribution;
    if (!limit) return;

    const count = limit.min + Math.floor(rng() * (limit.max - limit.min + 1));
    this.rooms.length = Math.min(this.rooms.length, Math.max(1, count));
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

  private _level(terrain: TerrainName[], step: number): boolean {
    const { width, height } = this.config;
    const floor = (x: number, y: number) =>
      terrain[y * width + x] === TerrainName.FLOOR;
    let levelled = false;

    for (let changed = true; changed; ) {
      changed = false;

      for (let y = 1; y < height - 1; y++)
        for (let x = 0; x < width - 1; x++)
          for (const [a, b] of [
            [x, x + 1],
            [x + 1, x],
          ]) {
            if (floor(a, y) || !floor(a, y + 1)) continue;
            if (floor(b, y) || floor(b, y + 1)) continue;

            let end = y + 2;
            while (end <= y + step && end < height && !floor(b, end)) end++;
            if (end > y + step || end >= height) continue;

            for (let yy = y + 1; yy < end; yy++)
              terrain[yy * width + b] = TerrainName.FLOOR;
            changed = true;
            levelled = true;
          }
    }

    return levelled;
  }

  private _widenPinches(terrain: TerrainName[]): boolean {
    const { width, height } = this.config;
    let widened = false;

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

        if (floorAbove && floorBelow && end - start + 1 < MIN_WALL_RUN) {
          for (let yy = start; yy <= end; yy++)
            terrain[yy * width + x] = TerrainName.FLOOR;
          widened = true;
        }
      }

    return widened;
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

      let radius =
        cfg.radius.min +
        Math.floor(rng() * (cfg.radius.max - cfg.radius.min + 1));

      const hugs = rng() < (cfg.edge ?? 0);
      if (hugs) radius += POND_SHORE_REACH;

      const center = hugs
        ? this._shore(terrain, room, rng)
        : this._middle(terrain, room, rng);
      if (!center) continue;

      const before = terrain.slice();

      for (; radius >= cfg.radius.min; radius -= 2) {
        this._pond(terrain, room, center, radius, cfg.threshold, noise);
        if (this._intact(terrain, room)) break;

        for (let i = 0; i < before.length; i++) terrain[i] = before[i];
      }

      if (radius >= cfg.radius.min && rng() < (cfg.island ?? 0)) {
        const isle = this._island(terrain, center, radius, noise);
        if (isle) this.treasures.set(room, isle);
      }
    }

    const cleaned = handlers.generation.enforceMinimumWater(
      terrain,
      width,
      this.config.height,
    );
    for (let i = 0; i < cleaned.length; i++)
      if (cleaned[i] !== TerrainName.WATER && terrain[i] === TerrainName.WATER)
        terrain[i] = TerrainName.FLOOR;

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

      if (
        maxx - minx + 1 < 4 ||
        maxy - miny + 1 < 4 ||
        cells.length < POND_MIN_AREA
      ) {
        for (const idx of cells) terrain[idx] = TerrainName.FLOOR;
        continue;
      }

      if (this.treasures.has(room)) continue;

      const { tileWidth, tileHeight } = this.config;
      this.lakes.push({
        x: (room.x + (minx + maxx) / 2 + 0.5) * tileWidth,
        y: (room.y + (miny + maxy) / 2 + 0.5) * tileHeight,
        w: (maxx - minx + 1) * tileWidth,
        h: (maxy - miny + 1) * tileHeight,
        deep: this._deepest(terrain, cells),
      });
    }
  }

  private _deepest(terrain: TerrainName[], cells: number[]) {
    const { width, height, tileWidth, tileHeight } = this.config;
    let best = cells[0];
    let reach = 0;

    for (const i of cells) {
      const x = i % width;
      const y = (i / width) | 0;
      let depth = 1;

      for (let open = true; open; ) {
        for (let dy = -depth; dy <= depth && open; dy++)
          for (let dx = -depth; dx <= depth && open; dx++) {
            const nx = x + dx;
            const ny = y + dy;

            open =
              nx >= 0 &&
              nx < width &&
              ny >= 0 &&
              ny < height &&
              terrain[ny * width + nx] === TerrainName.WATER;
          }

        if (open) depth++;
      }

      if (depth > reach) {
        reach = depth;
        best = i;
      }
    }

    return {
      x: ((best % width) + 0.5) * tileWidth,
      y: (((best / width) | 0) + 0.5) * tileHeight,
      radius: Math.max(tileWidth / 4, (reach - 1) * tileWidth),
    };
  }

  private _blocked(terrain: TerrainName[], i: number): boolean {
    const cell = terrain[i];

    return (
      this.isles[i] === 1 ||
      cell === TerrainName.VOID ||
      cell === TerrainName.WATER ||
      cell === TerrainName.WALL_BASE ||
      cell === TerrainName.WALL_MID ||
      cell === TerrainName.WALL_TOP
    );
  }

  private _middle(terrain: TerrainName[], room: Room, rng: () => number) {
    const { width } = this.config;
    let sx = 0;
    let sy = 0;
    let count = 0;

    for (let y = room.y; y < room.y + room.height; y++)
      for (let x = room.x; x < room.x + room.width; x++) {
        if (terrain[y * width + x] !== TerrainName.FLOOR) continue;

        sx += x;
        sy += y;
        count++;
      }

    if (!count) return null;

    const jitter = 3;

    return {
      x: Math.round(sx / count) + Math.floor(rng() * (2 * jitter + 1)) - jitter,
      y: Math.round(sy / count) + Math.floor(rng() * (2 * jitter + 1)) - jitter,
    };
  }

  private _shore(terrain: TerrainName[], room: Room, rng: () => number) {
    const { width } = this.config;
    const solid = (x: number, y: number) =>
      terrain[y * width + x] !== TerrainName.FLOOR;
    const spots: { x: number; y: number }[] = [];

    for (let y = room.y + POND_HEADROOM + 2; y < room.y + room.height; y++)
      for (let x = room.x; x < room.x + room.width; x++) {
        if (solid(x, y)) continue;
        if (solid(x - 1, y) || solid(x + 1, y) || solid(x, y + 1))
          spots.push({ x, y });
      }

    return spots.length ? spots[Math.floor(rng() * spots.length)] : null;
  }

  private _pond(
    terrain: TerrainName[],
    room: Room,
    center: { x: number; y: number },
    radius: number,
    threshold: number,
    noise: NoiseGenerator,
  ) {
    const { width, height } = this.config;
    const top = room.y + POND_HEADROOM;
    const cy = Math.max(center.y, top + Math.ceil(radius * threshold));
    const wet = new Set<number>();

    for (let dy = -radius; dy <= radius; dy++)
      for (let dx = -radius; dx <= radius; dx++) {
        const gx = center.x + dx;
        const gy = cy + dy;

        if (gx < 1 || gx >= width - 1 || gy < top || gy >= height - 1) continue;

        const idx = gy * width + gx;
        if (terrain[idx] !== TerrainName.FLOOR) continue;

        const dist = Math.sqrt(dx * dx + dy * dy) / radius;
        const n = (noise.generate(gx, gy) + 1) / 2;
        if (dist < threshold + (n - 0.5) * POND_WOBBLE) wet.add(idx);
      }

    const full = (i: number) => wet.has(i) || terrain[i] !== TerrainName.FLOOR;
    const offsets = [-1, 0, 1];

    for (const i of wet) {
      const solid = offsets.some((oy) =>
        offsets.some((ox) => {
          let painted = 0;

          for (const dy of offsets)
            for (const dx of offsets) {
              const n = i + (oy + dy) * width + ox + dx;

              if (!full(n)) return false;
              if (wet.has(n)) painted++;
            }

          return painted >= POND_BODY;
        }),
      );

      if (solid) terrain[i] = TerrainName.WATER;
    }
  }

  private _intact(terrain: TerrainName[], room: Room): boolean {
    const { width, height } = this.config;
    const seeds: number[] = [];

    for (let x = room.x; x < room.x + room.width; x++)
      if (terrain[room.y * width + x] === TerrainName.FLOOR)
        seeds.push(room.y * width + x);

    const reached = handlers.generation.flood(
      width,
      height,
      (i) => terrain[i] === TerrainName.FLOOR,
      seeds,
    );

    for (let i = 0; i < terrain.length; i++) {
      if (terrain[i] !== TerrainName.FLOOR || reached[i]) continue;

      for (const n of [i - 1, i + 1, i - width, i + width])
        if (
          terrain[n] !== TerrainName.FLOOR &&
          terrain[n] !== TerrainName.WATER
        )
          return false;
    }

    return true;
  }

  private _island(
    terrain: TerrainName[],
    center: { x: number; y: number },
    radius: number,
    noise: NoiseGenerator,
  ) {
    const { width, height } = this.config;
    const reach = Math.max(2, radius / 3);
    const land = new Set<number>();

    const deep = (x: number, y: number) => {
      for (let dy = -POND_CHANNEL; dy <= POND_CHANNEL; dy++)
        for (let dx = -POND_CHANNEL; dx <= POND_CHANNEL; dx++) {
          const nx = x + dx;
          const ny = y + dy;

          if (nx < 0 || nx >= width || ny < 0 || ny >= height) return false;
          if (terrain[ny * width + nx] !== TerrainName.WATER) return false;
        }

      return true;
    };

    for (let dy = -radius; dy <= radius; dy++)
      for (let dx = -radius; dx <= radius; dx++) {
        const gx = center.x + dx;
        const gy = center.y + dy;
        const n = (noise.generate(gx + 97, gy + 31) + 1) / 2;

        if (Math.sqrt(dx * dx + dy * dy) > reach * (0.6 + n * 0.8)) continue;
        if (deep(gx, gy)) land.add(gy * width + gx);
      }

    const block = (i: number) =>
      [0, -1, -width, -width - 1].some((o) =>
        [0, 1, width, width + 1].every((d) => land.has(i + o + d)),
      );

    for (const i of [...land].filter((i) => !block(i))) land.delete(i);
    if (land.size < 4) return null;

    let sx = 0;
    let sy = 0;

    for (const i of land) {
      terrain[i] = TerrainName.FLOOR;
      this.isles[i] = 1;
      sx += i % width;
      sy += (i / width) | 0;
    }

    const cx = sx / land.size;
    const cy = sy / land.size;
    let best = -1;
    let nearest = Infinity;

    for (const i of land) {
      const dist = Math.hypot((i % width) - cx, ((i / width) | 0) - cy);

      if (dist < nearest) {
        nearest = dist;
        best = i;
      }
    }

    return { x: best % width, y: (best / width) | 0 };
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

  private _tunnel(
    terrain: TerrainName[],
    from: { x: number; y: number },
    to: { x: number; y: number },
    grid: number,
  ) {
    const { width, height } = this.config;
    const rng = handlers.generation.seededRandom(
      handlers.generation.hash(`${this.seed}-tunnel-${from.x}-${from.y}`),
    );
    const columns = Math.floor(width / grid);
    const rows = Math.floor(height / grid);
    const end = { x: Math.floor(to.x / grid), y: Math.floor(to.y / grid) };
    let x = Math.floor(from.x / grid);
    let y = Math.floor(from.y / grid);

    const dig = (bx: number, by: number, span: number) => {
      for (let dy = 0; dy < span; dy++)
        for (let dx = 0; dx < span; dx++) {
          const cx = bx + dx;
          const cy = by + dy;

          if (cx < 1 || cx >= columns - 1) continue;
          if (cy < TUNNEL_HEADROOM || cy >= rows - 1) continue;

          for (let ty = 0; ty < grid; ty++)
            for (let tx = 0; tx < grid; tx++)
              terrain[(cy * grid + ty) * width + cx * grid + tx] =
                TerrainName.FLOOR;
        }
    };

    for (let guard = columns * rows; guard > 0; guard--) {
      dig(x, y, rng() < TUNNEL_BULGE ? 3 : 2);
      if (x === end.x && y === end.y) break;

      const dx = Math.abs(end.x - x);
      const dy = Math.abs(end.y - y);

      if (rng() * (dx + dy) < dx) x += Math.sign(end.x - x);
      else y += Math.sign(end.y - y);
    }
  }

  private _altars(
    terrain: TerrainName[],
  ): { room: number; setpiece: Setpiece; x: number; y: number }[] {
    const config = this.config.rooms?.altars;
    if (!config) return [];

    const { width, height } = this.config;
    const { setpiece, count } = config;
    const rng = handlers.generation.seededRandom(
      handlers.generation.hash(`${this.seed}-altars`),
    );
    const at = (x: number, y: number) => terrain[y * width + x];
    const below = setpiece.height - setpiece.anchor.y;
    const candidates: {
      room: number;
      setpiece: Setpiece;
      x: number;
      y: number;
    }[] = [];

    for (let r = 1; r < this.rooms.length; r++) {
      const room = this.rooms[r];
      const x = room.x + (room.width >> 1) - setpiece.anchor.x;
      const y = room.y - setpiece.anchor.y;

      if (y < 2 || room.y + below >= height) continue;
      if (x - 1 < room.x || x + setpiece.width > room.x + room.width - 1)
        continue;

      let fits = true;

      for (let cx = x - 1; cx <= x + setpiece.width && fits; cx++) {
        fits =
          at(cx, room.y - 1) === TerrainName.WALL_BASE &&
          at(cx, room.y - 2) === TerrainName.WALL_MID &&
          at(cx, room.y - 3) === TerrainName.WALL_TOP;

        for (let cy = y - 2; cy < room.y - 3 && fits; cy++)
          fits = at(cx, cy) === TerrainName.VOID;

        for (let cy = room.y; cy <= room.y + below && fits; cy++)
          fits = at(cx, cy) === TerrainName.FLOOR;
      }

      if (fits) candidates.push({ room: r, setpiece, x, y });
    }

    const wanted = count.min + Math.floor(rng() * (count.max - count.min + 1));

    return handlers.generation.rooms.shuffle(candidates, rng).slice(0, wanted);
  }

  private _bridge(terrain: TerrainName[]) {
    const { width, height } = this.config;

    for (let x = 0; x < width; x++) {
      let last = -1;

      for (let y = 0; y < height; y++) {
        if (terrain[y * width + x] !== TerrainName.FLOOR) continue;

        const gap = y - last - 1;

        if (last >= 0 && gap > 0 && gap < DUNGEON_WALL_SPAN)
          for (let fy = last + 1; fy < y; fy++)
            terrain[fy * width + x] = TerrainName.FLOOR;

        last = y;
      }
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

  private _carve(terrain: TerrainName[], occupied: Uint8Array) {
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

      this._clear(terrain, room, occupied);
    }
  }

  private _clear(terrain: TerrainName[], room: Room, occupied: Uint8Array) {
    const { width } = this.config;
    const x1 = room.x + room.width;
    const y1 = room.y + room.height;
    let cleared = false;

    for (let y = room.y; y < y1; y++)
      for (let x = room.x; x < x1; x++) {
        if (!occupied[y * width + x]) continue;

        for (let dy = -RECESS_CLEARANCE; dy <= RECESS_CLEARANCE; dy++)
          for (let dx = -RECESS_CLEARANCE; dx <= RECESS_CLEARANCE; dx++) {
            const i = (y + dy) * width + x + dx;
            if (terrain[i] !== TerrainName.RECESSED) continue;

            terrain[i] = TerrainName.FLOOR;
            cleared = true;
          }
      }

    if (!cleared) return;

    const keep = new Set<number>();

    for (let y = room.y; y <= y1 - RECESS_MIN; y++)
      for (let x = room.x; x <= x1 - RECESS_MIN; x++) {
        let solid = true;

        for (let dy = 0; dy < RECESS_MIN && solid; dy++)
          for (let dx = 0; dx < RECESS_MIN && solid; dx++)
            if (terrain[(y + dy) * width + x + dx] !== TerrainName.RECESSED)
              solid = false;

        if (!solid) continue;

        for (let dy = 0; dy < RECESS_MIN; dy++)
          for (let dx = 0; dx < RECESS_MIN; dx++)
            keep.add((y + dy) * width + x + dx);
      }

    for (let y = room.y; y < y1; y++)
      for (let x = room.x; x < x1; x++) {
        const i = y * width + x;

        if (terrain[i] === TerrainName.RECESSED && !keep.has(i))
          terrain[i] = TerrainName.FLOOR;
      }
  }
}
