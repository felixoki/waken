import { handlers } from "../../handlers";
import { EntityName } from "../../types";
import {
  BiomeConfig,
  DoorAnchor,
  Entity,
  Room,
  SeparatorLayer,
  SeparatorStamp,
  TerrainName,
} from "../../types/generation";

const PILLAR = 291;
const NORTH = [300, 317, 334];
const NORTH_WALL = [0, 70, 87];
const SOUTH = 283;
const SOUTH_WALL = 19;
const WEST = [369, 386, 403];
const WEST_WALL = 37;
const EAST = [368, 385, 402];
const EAST_WALL = 35;
const CAP = [359, 376, 393];
const POST = [257, 274];
const BAND = [309, 326, 343];
const END_WEST = [306, 323, 340];
const END_EAST = [310, 327, 344];
const BRANCH_WEST = [297, 273, 290];
const BRANCH_EAST = [314, 275, 292];
const TURN_EAST = [311, 328, 345];
const TURN_WEST = [312, 329, 346];
const ARCH = [431, 448, 465];

const ATTEMPTS = 24;
const SPACING = 5;
const LEVER_MIN = 10;
const LEVER_MAX = 48;

type Side = "west" | "east";

interface Piece {
  solid: number[];
  open: number[];
  contacts: Set<number>;
  stamps: SeparatorStamp[];
  door?: { x: number; y: number };
  nook?: { x0: number; y0: number; x1: number; y1: number; top: boolean };
}

export class SeparatorGenerator {
  private config: BiomeConfig;
  private width: number;
  private height: number;
  private rng: () => number;

  constructor(config: BiomeConfig, seed: string) {
    this.config = config;
    this.width = config.width;
    this.height = config.height;
    this.rng = handlers.generation.seededRandom(
      handlers.generation.hash(`${seed}-separators`),
    );
  }

  generate(
    terrain: TerrainName[],
    rooms: Room[],
    doors: DoorAnchor[],
    pits: Uint8Array,
  ): { stamps: SeparatorStamp[]; occupied: Uint8Array; entities: Entity[] } {
    const { width, height } = this;
    const { tileWidth, tileHeight } = this.config;
    const settings = this.config.rooms?.separators;

    const stamps: SeparatorStamp[] = [];
    const entities: Entity[] = [];
    const occupied = new Uint8Array(width * height);
    const blocked = new Uint8Array(width * height);
    const crowded = new Uint8Array(width * height);
    const gates: { piece: Piece; room: number }[] = [];
    const owner = new Int16Array(width * height).fill(-1);

    if (!settings) return { stamps, occupied, entities };

    const keepout = this._keepout(terrain, rooms);
    const large = this.config.rooms!.distribution.large.size.width.min;

    const place = (r: number, nook: Side | null, strict: boolean): boolean => {
      const room = rooms[r];
      const piece = this._piece(terrain, room, doors, nook);

      if (!piece) return false;
      if (
        !this._fits(
          terrain,
          piece,
          occupied,
          keepout,
          crowded,
          strict ? pits : null,
        )
      )
        return false;

      const before = this._components(terrain, room, blocked, null, true);
      const after = this._components(terrain, room, blocked, piece, true);
      if (after > before) return false;

      const sealed =
        !!piece.door &&
        this._components(terrain, room, blocked, piece, false) > before;
      if (nook && !sealed) return false;

      for (const i of piece.solid) {
        occupied[i] = 1;
        blocked[i] = 1;
        owner[i] = r;
      }
      for (const i of piece.open) occupied[i] = 1;

      for (const i of [...piece.solid, ...piece.open])
        for (let dy = -SPACING; dy <= SPACING; dy++)
          for (let dx = -SPACING; dx <= SPACING; dx++) {
            const nx = (i % width) + dx;
            const ny = ((i / width) | 0) + dy;
            if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
            crowded[ny * width + nx] = 1;
          }

      stamps.push(...piece.stamps);
      if (nook) gates.push({ piece, room: r });

      return true;
    };

    const wanted = this._int(settings.gates.min, settings.gates.max);
    const halls = rooms.map((_, r) => r).filter((r) => rooms[r].width >= large);
    const others = handlers.generation.rooms.shuffle(
      rooms.map((_, r) => r).filter((r) => rooms[r].width < large),
      this.rng,
    );

    const nook = (r: number): boolean => {
      const sides: Side[] =
        this.rng() < 0.5 ? ["west", "east"] : ["east", "west"];

      for (const side of sides)
        for (let attempt = 0; attempt < ATTEMPTS * 2; attempt++)
          if (place(r, side, attempt < ATTEMPTS)) return true;

      return false;
    };

    for (const r of halls) nook(r);

    for (const r of others) {
      if (gates.length >= wanted) break;
      nook(r);
    }

    for (let r = 0; r < rooms.length; r++) {
      const isLarge = rooms[r].width >= large;
      const count = isLarge
        ? this._int(settings.large.min, settings.large.max)
        : this.rng() < settings.chance
          ? 1
          : 0;
      const attempts = isLarge ? ATTEMPTS * 4 : ATTEMPTS;

      for (let n = 0; n < count; n++)
        for (let attempt = 0; attempt < attempts; attempt++)
          if (place(r, null, attempt < attempts * 0.75)) break;
    }

    for (let g = 0; g < gates.length; g++) {
      const { piece, room } = gates[g];
      const door = piece.door!;
      const closed = new Uint8Array(blocked);

      for (const gate of gates) for (const i of gate.piece.open) closed[i] = 1;

      const lever = this._lever(
        terrain,
        rooms,
        room,
        door,
        closed,
        occupied,
        owner,
        keepout,
      );
      if (lever < 0) continue;

      occupied[lever] = 1;

      const link = `gate-${g}`;

      entities.push({
        name: EntityName.CLOSED_DOOR,
        x: (door.x + 1) * tileWidth,
        y: door.y * tileHeight + (tileHeight * 3) / 2,
        link,
      });
      entities.push({
        name: EntityName.LEVER,
        x: (lever % width) * tileWidth + tileWidth / 2,
        y: ((lever / width) | 0) * tileHeight + tileHeight / 2,
        link,
      });

      const nook = piece.nook!;
      const cy = nook.top ? nook.y0 : nook.y1 - 1;
      const far = door.x - nook.x0 > nook.x1 - door.x ? nook.x0 : nook.x1 - 1;
      const near = far === nook.x0 ? nook.x1 - 1 : nook.x0;
      const spots =
        nook.x1 - nook.x0 >= 4 && this.rng() < 0.5 ? [far, near] : [far];

      for (const cx of spots) {
        const cells = [0, 1, width, width + 1].map((d) => cy * width + cx + d);

        if (cells.some((i) => terrain[i] !== TerrainName.FLOOR || occupied[i]))
          continue;

        for (const i of cells) occupied[i] = 1;

        entities.push({
          name: EntityName.CHEST1,
          x: (cx + 1) * tileWidth,
          y: (cy + 1) * tileHeight,
          loot: settings.treasure,
        });
      }
    }

    return { stamps, occupied, entities };
  }

  private _int(min: number, max: number): number {
    return min + Math.floor(this.rng() * (max - min + 1));
  }

  private _keepout(terrain: TerrainName[], rooms: Room[]): Uint8Array {
    const { width, height } = this;
    const keepout = new Uint8Array(width * height);

    const open = (x: number, y: number) =>
      x >= 0 &&
      y >= 0 &&
      x < width &&
      y < height &&
      terrain[y * width + x] === TerrainName.FLOOR;

    const mark = (x: number, y: number) => {
      for (let dy = -3; dy <= 3; dy++)
        for (let dx = -3; dx <= 3; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          keepout[ny * width + nx] = 1;
        }
    };

    for (const room of rooms) {
      for (let x = room.x; x < room.x + room.width; x++) {
        if (open(x, room.y - 1)) mark(x, room.y);
        if (open(x, room.y + room.height)) mark(x, room.y + room.height - 1);
      }

      for (let y = room.y; y < room.y + room.height; y++) {
        if (open(room.x - 1, y)) mark(room.x, y);
        if (open(room.x + room.width, y)) mark(room.x + room.width - 1, y);
      }
    }

    return keepout;
  }

  private _piece(
    terrain: TerrainName[],
    room: Room,
    doors: DoorAnchor[],
    nook: Side | null,
  ): Piece | null {
    const { width } = this;
    const x0 = room.x;
    const y0 = room.y;
    const x1 = room.x + room.width - 1;
    const y1 = room.y + room.height - 1;

    if (room.width < 9 || room.height < 10) return null;

    const piece: Piece = {
      solid: [],
      open: [],
      contacts: new Set(),
      stamps: [],
    };

    const at = (x: number, y: number) => y * width + x;
    const is = (x: number, y: number, t: TerrainName) =>
      terrain[at(x, y)] === t;

    const put = (
      x: number,
      y: number,
      id: number,
      layer: SeparatorLayer = "walls",
      expect?: number,
    ) => piece.stamps.push({ index: at(x, y), id, layer, expect });

    const column = (x: number, y: number, ids: number[]) => {
      put(x, y, ids[0], "walls_above");
      put(x, y + 1, ids[1]);
      put(x, y + 2, ids[2]);
      for (let r = 0; r < 3; r++) piece.solid.push(at(x, y + r));
    };

    const pillar = (x: number, from: number, to: number) => {
      for (let y = from; y <= to; y++) {
        put(x, y, PILLAR);
        piece.solid.push(at(x, y));
      }
    };

    const x =
      nook === "west"
        ? x0 + this._int(4, 7)
        : nook === "east"
          ? x1 - this._int(4, 7)
          : this._int(x0 + 3, x1 - 3);
    const fromNorth = this.rng() < 0.5;
    const shape = nook ? 1 : this._int(0, 2);

    if (x > x1 - 3 || x < x0 + 3) return null;

    if (fromNorth) {
      for (let dx = -1; dx <= 1; dx++)
        if (
          !is(x + dx, y0 - 1, TerrainName.WALL_BASE) ||
          !is(x + dx, y0 - 2, TerrainName.WALL_MID) ||
          !is(x + dx, y0 - 3, TerrainName.WALL_TOP)
        )
          return null;

      for (const door of doors)
        if (door.dir === "north" && door.y === y0 && Math.abs(door.x - x) <= 4)
          return null;

      put(x, y0 - 3, NORTH[0], "walls_above");
      put(x, y0 - 2, NORTH[1], "walls", NORTH_WALL[1]);
      put(x, y0 - 1, NORTH[2], "walls", NORTH_WALL[2]);
      piece.contacts.add(at(x, y0));
    } else {
      for (let dx = -1; dx <= 1; dx++)
        if (!is(x + dx, y1 + 1, TerrainName.VOID)) return null;

      put(x, y1 + 1, SOUTH, "walls_above", SOUTH_WALL);
      piece.contacts.add(at(x, y1));
    }

    if (fromNorth && shape === 0) {
      if (y1 - 5 < y0 + 3) return null;

      const turn = this._int(y0 + 3, Math.min(y0 + 8, y1 - 5));
      const east = this.rng() < 0.5;
      const length = this._int(3, 5);

      pillar(x, y0, turn - 1);
      column(x, turn, east ? TURN_EAST : TURN_WEST);
      this._band(piece, put, x, turn, east, length, length >= 4, false);

      return piece;
    }

    let top: number;
    let bottom: number;

    if (fromNorth) {
      if (y1 - 4 < y0 + 6) return null;

      const cap = this._int(y0 + 6, y1 - 4);

      pillar(x, y0, cap - 1);
      for (let r = 0; r < 3; r++) {
        put(x, cap + r, CAP[r]);
        piece.solid.push(at(x, cap + r));
      }

      top = nook ? y0 + 3 : y0 + 2;
      bottom = cap - 4;
    } else {
      if (y1 - 7 < y0 + 2) return null;

      const post = this._int(y0 + 2, y1 - 7);

      put(x, post, POST[0]);
      put(x, post + 1, POST[1]);
      piece.solid.push(at(x, post), at(x, post + 1));
      pillar(x, post + 2, y1);

      top = post + 3;
      bottom = nook ? y1 - 5 : y1 - 4;
    }

    if (bottom < top) return null;

    const row = this._int(top, bottom);
    const east = nook ? nook === "east" : this.rng() < 0.5;
    const span = east ? x1 - x : x - x0;
    const reach = shape === 1 && span >= 4 && span <= 7;

    for (let r = 0; r < 3; r++)
      piece.stamps = piece.stamps.filter((s) => s.index !== at(x, row + r));

    const branch = east ? BRANCH_EAST : BRANCH_WEST;
    put(x, row, branch[0], "walls_above");
    put(x, row + 1, branch[1]);
    put(x, row + 2, branch[2]);

    if (reach) {
      const wall = east ? x1 + 1 : x0 - 1;

      for (let r = 0; r < 3; r++) {
        if (!is(wall, row + r, TerrainName.VOID)) return null;

        put(
          wall,
          row + r,
          (east ? EAST : WEST)[r],
          "walls",
          east ? EAST_WALL : WEST_WALL,
        );
        piece.contacts.add(at(east ? x1 : x0, row + r));
      }

      this._band(piece, put, x, row, east, span, true, true);

      const left = east ? x + 1 : x0;
      const right = east ? x1 : x - 1;

      piece.nook = fromNorth
        ? { x0: left, y0, x1: right, y1: row - 1, top: true }
        : { x0: left, y0: row + 3, x1: right, y1, top: false };
    } else {
      const length = this._int(2, 4);
      this._band(piece, put, x, row, east, length, length >= 4, false);
    }

    return piece;
  }

  private _band(
    piece: Piece,
    put: (
      x: number,
      y: number,
      id: number,
      layer?: SeparatorLayer,
      expect?: number,
    ) => void,
    x: number,
    y: number,
    east: boolean,
    length: number,
    arched: boolean,
    reach: boolean,
  ) {
    const { width } = this;
    const dir = east ? 1 : -1;
    const arch = arched ? this._int(2, length - 2) : -1;

    for (let k = 1; k <= length; k++) {
      const bx = x + dir * k;
      const slot = k === arch ? 0 : k === arch + 1 ? 1 : -1;

      if (slot >= 0) {
        const tile = east ? slot : 1 - slot;

        put(bx, y, ARCH[0] + tile, "doors_above");
        put(bx, y + 1, ARCH[1] + tile, "doors");
        put(bx, y + 2, ARCH[2] + tile, "doors");

        for (let r = 0; r < 3; r++) piece.open.push((y + r) * width + bx);
        if (tile === 0) piece.door = { x: bx, y };

        continue;
      }

      put(bx, y, BAND[0], "walls_above");
      put(bx, y + 1, BAND[1]);
      put(bx, y + 2, BAND[2]);

      for (let r = 0; r < 3; r++) piece.solid.push((y + r) * width + bx);
    }

    if (reach) return;

    const end = east ? END_EAST : END_WEST;
    const ex = x + dir * (length + 1);

    put(ex, y, end[0], "walls_above");
    put(ex, y + 1, end[1]);
    put(ex, y + 2, end[2]);

    for (let r = 0; r < 3; r++) piece.solid.push((y + r) * width + ex);
  }

  private _fits(
    terrain: TerrainName[],
    piece: Piece,
    occupied: Uint8Array,
    keepout: Uint8Array,
    crowded: Uint8Array,
    pits: Uint8Array | null,
  ): boolean {
    const { width, height } = this;
    const own = new Set([...piece.solid, ...piece.open]);

    const free = (i: number) =>
      i >= 0 &&
      i < width * height &&
      terrain[i] === TerrainName.FLOOR &&
      !occupied[i] &&
      !pits?.[i];

    for (const i of own) {
      if (!free(i) || keepout[i] || crowded[i]) return false;

      for (const step of [-1, 1, -width, width]) {
        const near = i + step;
        if (own.has(near)) continue;

        if (!free(near)) {
          if (piece.contacts.has(i)) continue;
          return false;
        }

        const far = near + step;
        if (!own.has(far) && !free(far)) return false;
      }
    }

    return true;
  }

  private _components(
    terrain: TerrainName[],
    room: Room,
    blocked: Uint8Array,
    piece: Piece | null,
    passable: boolean,
  ): number {
    const { width } = this;
    const walls = new Set(piece?.solid ?? []);

    if (piece && !passable) for (const i of piece.open) walls.add(i);

    const seen = new Set<number>();
    let count = 0;

    const open = (x: number, y: number) => {
      if (x < room.x || x >= room.x + room.width) return false;
      if (y < room.y || y >= room.y + room.height) return false;

      const i = y * width + x;

      return terrain[i] === TerrainName.FLOOR && !blocked[i] && !walls.has(i);
    };

    for (let y = room.y; y < room.y + room.height; y++)
      for (let x = room.x; x < room.x + room.width; x++) {
        const start = y * width + x;
        if (seen.has(start) || !open(x, y)) continue;

        count++;
        seen.add(start);

        const stack = [start];

        while (stack.length) {
          const i = stack.pop()!;
          const cx = i % width;
          const cy = (i / width) | 0;

          for (const [dx, dy] of [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
          ]) {
            const n = (cy + dy) * width + cx + dx;
            if (seen.has(n) || !open(cx + dx, cy + dy)) continue;

            seen.add(n);
            stack.push(n);
          }
        }
      }

    return count;
  }

  private _lever(
    terrain: TerrainName[],
    rooms: Room[],
    room: number,
    door: { x: number; y: number },
    closed: Uint8Array,
    occupied: Uint8Array,
    owner: Int16Array,
    keepout: Uint8Array,
  ): number {
    const { width, height } = this;
    const walkable = (i: number) =>
      (terrain[i] === TerrainName.FLOOR ||
        terrain[i] === TerrainName.RECESSED ||
        terrain[i] === TerrainName.ELEVATED) &&
      !closed[i];

    const start = rooms[0];
    const seeds: number[] = [];

    for (let y = start.y; y < start.y + start.height; y++)
      for (let x = start.x; x < start.x + start.width; x++)
        if (walkable(y * width + x)) seeds.push(y * width + x);

    const reachable = handlers.generation.flood(width, height, walkable, seeds);
    const inside = rooms[room];
    const candidates: { index: number; distance: number }[] = [];

    for (let y = 1; y < height - 1; y++)
      for (let x = 1; x < width - 1; x++) {
        const i = y * width + x;

        if (terrain[i] !== TerrainName.FLOOR) continue;
        if (!reachable[i] || occupied[i] || keepout[i]) continue;
        if (
          x >= inside.x &&
          x < inside.x + inside.width &&
          y >= inside.y &&
          y < inside.y + inside.height
        )
          continue;

        const distance = Math.max(Math.abs(x - door.x), Math.abs(y - door.y));
        if (distance < LEVER_MIN || distance > LEVER_MAX) continue;

        const hidden = [-1, 1, -width, width].some(
          (step) => owner[i + step] >= 0 && owner[i + step] !== room,
        );
        const walled = terrain[i - width] === TerrainName.WALL_BASE;
        const cornered =
          walled &&
          (terrain[i - 1] === TerrainName.VOID ||
            terrain[i + 1] === TerrainName.VOID);
        const tier = hidden ? 0 : cornered ? 1 : walled ? 2 : 3;

        candidates.push({ index: i, distance: distance + tier * LEVER_MAX });
      }

    if (!candidates.length) return -1;

    candidates.sort((a, b) => a.distance - b.distance);

    const pool = candidates.slice(0, 6);

    return pool[Math.floor(this.rng() * pool.length)].index;
  }
}
