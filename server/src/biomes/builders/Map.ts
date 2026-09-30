import { handlers } from "../../handlers";
import { TilesetLoader } from "../../loaders/Tileset";
import { EntityName, SurfaceName } from "../../types";
import { configs } from "../../configs";
import {
  DUNGEON_LADDER_COUNT,
  DIRECTIONS_CARDINAL,
  LEDGE_CLEARANCE,
  PEAK_CLEARANCE,
  SEAM_MARGIN,
} from "../../globals";
import {
  BiomeBand,
  BiomeConfig,
  BiomeName,
  DoorAnchor,
  Entity,
  GeneratedMap,
  TERRAIN_ORDER,
  TerrainName,
  TileRole,
} from "../../types/generation";
import { BorderGenerator } from "../generators/Border";
import { DoorGenerator } from "../generators/Door";
import { EntranceGenerator } from "../generators/Entrance";
import { FaceGenerator } from "../generators/Face";
import { PatchGenerator } from "../generators/Patch";
import { entrances } from "../../configs/entrances";
import { LedgeGenerator } from "../generators/Ledge";
import { RoomGenerator } from "../generators/Room";
import { StairGenerator } from "../generators/Stair";
import { TerraceGenerator } from "../generators/Terrace";
import { TerrainGenerator } from "../generators/Terrain";
import { WallGenerator } from "../generators/Wall";
import { TerrainSmoother } from "../smoothers/Terrain";
import { DetailSpawner } from "../spawners/Detail";
import { EntitySpawner } from "../spawners/Entity";

export class MapBuilder {
  private bands: BiomeBand[];
  private host: number;
  private config: BiomeConfig;
  private loader: TilesetLoader;
  private seed: string;
  private unlocked: number;
  private width: number;
  private height: number;

  constructor(
    configs: BiomeConfig[],
    host: number,
    loader: TilesetLoader,
    seed: string,
    unlocked = 0,
  ) {
    const [first] = configs;

    this.bands = [];
    let y = 0;

    for (const config of configs) {
      if (
        config.width !== first.width ||
        config.tileWidth !== first.tileWidth ||
        config.tileHeight !== first.tileHeight
      )
        throw new Error(
          `Biome ${config.id} cannot stack on ${first.id}: width or tile size differs`,
        );

      this.bands.push({ config, y });
      y += config.height;
    }

    this.host = host;
    this.config = configs[host];
    this.loader = loader;
    this.seed = seed;
    this.unlocked = unlocked;
    this.width = first.width;
    this.height = y;
  }

  build(): GeneratedMap {
    const { width, height, bands } = this;
    const { tileWidth, tileHeight, layers } = this.config;
    const host = bands[this.host];

    const generators = {
      terrain: TerrainGenerator,
      room: RoomGenerator,
      terrace: TerraceGenerator,
    };

    const grid: TerrainName[] = new Array(width * height);
    const region = new Uint8Array(width * height);
    const roomEntities: Entity[] = [];
    const elevations: (Uint8Array | undefined)[] = [];

    let roomSpawn: { x: number; y: number } | undefined;
    let roomExit: { x: number; y: number } | undefined;
    let roomDoors: DoorAnchor[] | undefined;

    for (let b = 0; b < bands.length; b++) {
      const { config, y } = bands[b];
      const generator = new generators[config.generator](
        config,
        config.noise.seed ?? this.seed,
      );
      const generated = generator.generate() as {
        terrain: TerrainName[];
        entities: Entity[];
        spawn?: { x: number; y: number };
        exit?: { x: number; y: number };
        doors?: DoorAnchor[];
        elevation?: Uint8Array;
      };

      elevations.push(generated.elevation);

      const smoothed = this.smooth(config, generated.terrain);
      const local = b > 0 ? this.seam(config, smoothed) : smoothed;
      const offset = y * width;

      for (let i = 0; i < local.length; i++) {
        grid[offset + i] = local[i];
        region[offset + i] = b;
      }

      const dy = y * tileHeight;
      const shift = (p?: { x: number; y: number }) =>
        p && { x: p.x, y: p.y + dy };

      for (const e of generated.entities)
        roomEntities.push({ ...e, y: e.y + dy });

      if (b !== this.host) continue;

      roomSpawn = shift(generated.spawn);
      roomExit = shift(generated.exit);
      roomDoors = generated.doors?.map((d) => ({ ...d, y: d.y + y }));
    }

    const tilesetOrder = this.collectTilesets();
    const firstgids = new Map<string, number>();

    let nextGid = 1;

    for (const name of tilesetOrder) {
      firstgids.set(name, nextGid);
      const tileset = this.loader.load(name);
      nextGid += tileset.tilecount;
    }

    const ledges = new Array(width * height).fill(0);
    const overlay = new Array(width * height).fill(0);
    const rock = new Uint8Array(width * height);
    const elevation = new Uint8Array(width * height);
    let hasLedges = false;

    for (let b = 0; b < bands.length; b++) {
      const local = elevations[b];
      if (!local) continue;

      const { config, y } = bands[b];
      const offset = y * width;
      const seed = config.noise.seed ?? this.seed;
      const gid = (name: string) => firstgids.get(name)!;

      elevation.set(local, offset);

      const faces = new FaceGenerator(config, this.loader, gid, seed).generate(
        local,
      );
      const patches = new PatchGenerator(config, this.loader, gid, seed).generate(
        local,
        faces.data,
      );

      for (let i = 0; i < faces.data.length; i++) {
        if (faces.data[i]) {
          ledges[offset + i] = faces.data[i];
          hasLedges = true;
        }

        if (faces.data[i] || faces.stairs[i]) rock[offset + i] = 1;
        overlay[offset + i] = faces.stairs[i] || patches.data[i];
      }

      for (const [i, t] of faces.under) grid[offset + i] = t;
      for (const i of patches.grass) grid[offset + i] = TerrainName.GRASS;
    }

    const blocked = new Uint8Array(width * height);

    for (let i = 0; i < ledges.length; i++) {
      if (!ledges[i] && !overlay[i]) continue;

      blocked[i] = 1;
      if (!rock[i]) continue;

      const x = i % width;
      const y = (i / width) | 0;

      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && ny >= 0 && nx < width && ny < height)
            blocked[ny * width + nx] = 1;
        }
    }

    const terrain = this.mask(grid, region, this.host);
    const view = { ...this.config, width, height };

    /**
     * Build fill layers
     */
    let layerId = 1;
    const tiledLayers: any[] = [];
    const fillSeed = handlers.generation.hash(`${this.seed}-fill`);

    const fillOrder: TerrainName[] = [];

    for (const band of this.ordered())
      for (const l of band.config.layers)
        if (!fillOrder.includes(l.terrain)) fillOrder.push(l.terrain);

    for (const fillTerrain of fillOrder) {
      let data: number[] | null = null;
      let surface: SurfaceName | undefined;

      for (const { config, y: top } of bands) {
        const index = config.layers.findIndex((l) => l.terrain === fillTerrain);
        if (index < 0) continue;

        const layerConfig = config.layers[index];
        const fills = this.loader.query(layerConfig.tileset, {
          role: TileRole.FILL,
          terrain: layerConfig.terrain,
        });

        if (!fills.length) continue;

        data ??= new Array(width * height).fill(0);
        surface ??= layerConfig.surface;

        const gid = firstgids.get(layerConfig.tileset)!;
        const isBaseLayer = index === 0;

        for (let y = top; y < top + config.height; y++)
          for (let x = 0; x < width; x++) {
            const idx = handlers.generation.toIndex(x, y, width);

            if (
              isBaseLayer ||
              handlers.generation.isTerrainAtOrAbove(
                grid[idx],
                layerConfig.terrain,
              )
            ) {
              let tile = fills[0];

              if (fills.length > 1) {
                const rng = handlers.generation.seededRandom(
                  handlers.generation.spatialHash(x, y, fillSeed),
                );

                if (rng() < 0.125)
                  tile = fills[1 + Math.floor(rng() * (fills.length - 1))];
              }

              data[idx] = gid + tile.id;
            }
          }
      }

      if (!data || !data.some((gid) => gid !== 0)) continue;

      tiledLayers.push(
        handlers.generation.createLayer(
          layerId++,
          fillTerrain,
          width,
          height,
          data,
          surface && [{ name: "surface", type: "string", value: surface }],
        ),
      );
    }

    /**
     * Build overlay layer
     */
    const detailSpawner = new DetailSpawner(this.seed, width, height, blocked);

    for (const band of this.ordered()) {
      const masked = this.mask(grid, region, bands.indexOf(band));

      for (const detailConfig of band.config.details ?? []) {
        const detailGid = firstgids.get(detailConfig.tileset);
        if (detailGid === undefined) continue;

        detailSpawner.spawn(masked, detailConfig, detailGid, overlay);
      }
    }

    if (overlay.some((gid) => gid !== 0))
      tiledLayers.push(
        handlers.generation.createLayer(
          layerId++,
          "overlay",
          width,
          height,
          overlay,
        ),
      );

    if (hasLedges)
      tiledLayers.push(
        handlers.generation.createLayer(
          layerId++,
          "ledges",
          width,
          height,
          ledges,
          [
            { name: "clearance", type: "int", value: LEDGE_CLEARANCE },
            { name: "collides", type: "bool", value: true },
            { name: "seeThrough", type: "bool", value: true },
          ],
        ),
      );

    /**
     * Build wall layer
     */
    if (this.config.walls) {
      const gid = firstgids.get(this.config.walls)!;
      const generator = new WallGenerator(
        { width, height },
        this.loader,
      );
      const { below, above } = generator.generate(
        terrain,
        this.config.walls,
        gid,
      );

      for (let i = 0; i < below.length; i++)
        if (below[i] !== 0 || above[i] !== 0)
          for (const layer of tiledLayers) layer.data[i] = 0;

      /**
       * Wall underlay
       */
      const floorFills = this.loader.query(this.config.walls, {
        role: TileRole.FILL,
        terrain: TerrainName.FLOOR,
      });
      const floorTile = floorFills.length ? gid + floorFills[0].id : 0;
      const voidFills = this.loader.query(this.config.walls, {
        role: TileRole.FILL,
        terrain: TerrainName.VOID,
      });
      const ceilingTile = voidFills.length ? gid + voidFills[0].id : floorTile;

      const voidBacked = new Set<number>();
      for (const tile of this.loader.load(this.config.walls).tiles ?? [])
        if (
          handlers.generation.parseProperties(tile.properties).backing === "void"
        )
          voidBacked.add(gid + tile.id);

      if (floorTile) {
        const underlay = new Array(width * height).fill(0);

        const floorBottom = new Int32Array(width).fill(-1);

        for (let x = 0; x < width; x++)
          for (let y = height - 1; y >= 0; y--)
            if (terrain[y * width + x] === TerrainName.FLOOR) {
              floorBottom[x] = y;
              break;
            }

        const touchesFloor = (x: number, y: number) => {
          for (let dy = -1; dy <= 1; dy++)
            for (let dx = -1; dx <= 1; dx++) {
              if (!dx && !dy) continue;
              const nx = x + dx;
              const ny = y + dy;
              if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
              if (terrain[ny * width + nx] === TerrainName.FLOOR) return true;
            }

          return false;
        };

        for (let i = 0; i < below.length; i++) {
          if (below[i] === 0 && above[i] === 0) continue;
          const x = i % width;
          const y = (i / width) | 0;
          underlay[i] =
            voidBacked.has(below[i]) ||
            voidBacked.has(above[i]) ||
            (!touchesFloor(x, y) && y < floorBottom[x])
              ? ceilingTile
              : floorTile;
        }

        tiledLayers.push(
          handlers.generation.createLayer(
            layerId++,
            "walls_floor",
            width,
            height,
            underlay,
          ),
        );
      }

      tiledLayers.push(
        handlers.generation.createLayer(
          layerId++,
          "walls",
          width,
          height,
          below,
          [{ name: "collides", type: "bool", value: true }],
        ),
      );

      tiledLayers.push(
        handlers.generation.createLayer(
          layerId++,
          "walls_above",
          width,
          height,
          above,
          [
            { name: "collides", type: "bool", value: true },
            { name: "rendersAbove", type: "bool", value: true },
          ],
        ),
      );

      /**
       * Void fill: the open ceiling renders above the player, while void
       * pockets sealed inside the wall band render as solid rock below it.
       */
      const voidLayer = layers.find((l) => l.terrain === TerrainName.VOID);

      if (voidLayer) {
        const voidFills = this.loader.query(voidLayer.tileset, {
          role: TileRole.FILL,
          terrain: TerrainName.VOID,
        });

        if (voidFills.length) {
          const voidGid = firstgids.get(voidLayer.tileset)!;
          const tile = voidGid + voidFills[0].id;

          const renderable = (i: number) =>
            terrain[i] === TerrainName.VOID && below[i] === 0 && above[i] === 0;

          const exterior = handlers.generation.flood(
            width,
            height,
            renderable,
            handlers.generation.borderIndices(width, height),
          );

          const voidAbove = new Array(width * height).fill(0);
          const voidBelow = new Array(width * height).fill(0);

          for (let i = 0; i < terrain.length; i++) {
            if (!renderable(i)) continue;
            if (exterior[i]) voidAbove[i] = tile;
            else voidBelow[i] = tile;
          }

          tiledLayers.push(
            handlers.generation.createLayer(
              layerId++,
              "void_fill",
              width,
              height,
              voidBelow,
              [{ name: "collides", type: "bool", value: true }],
            ),
          );

          tiledLayers.push(
            handlers.generation.createLayer(
              layerId++,
              "void_above",
              width,
              height,
              voidAbove,
              [{ name: "rendersAbove", type: "bool", value: true }],
            ),
          );
        }
      }
    }

    /**
     * Build ledge layer
     */
    if (this.config.ledge) {
      const gid = firstgids.get(this.config.ledge)!;
      const gen = new LedgeGenerator(
        { width, height },
        this.loader,
      );
      const ledges = gen.generate(terrain, this.config.ledge, gid);

      const stairGen = new StairGenerator({
        width,
        height,
      });
      const stairs = stairGen.generate(terrain, gid, this.seed, ledges);

      tiledLayers.push(
        handlers.generation.createLayer(
          layerId++,
          "ledges",
          width,
          height,
          ledges,
          [{ name: "collides", type: "bool", value: true }],
        ),
      );

      tiledLayers.push(
        handlers.generation.createLayer(
          layerId++,
          "stairs",
          width,
          height,
          stairs,
          [{ name: "collides", type: "bool", value: true }],
        ),
      );
    }

    /**
     * Build door layer
     */
    if (roomDoors && roomDoors.length && this.config.walls) {
      const gid = firstgids.get(this.config.walls)!;
      const doorGen = new DoorGenerator({
        width,
        height,
      });
      const { below: doorsBelow, above: doorsAbove } = doorGen.generate(
        roomDoors,
        gid,
      );

      const wallLayers = tiledLayers.filter((l) =>
        ["walls", "walls_above", "void_above"].includes(l.name),
      );

      for (let i = 0; i < doorsBelow.length; i++)
        if (doorsBelow[i] !== 0 || doorsAbove[i] !== 0)
          for (const layer of wallLayers) layer.data[i] = 0;

      tiledLayers.push(
        handlers.generation.createLayer(
          layerId++,
          "doors",
          width,
          height,
          doorsBelow,
          [{ name: "collides", type: "bool", value: true }],
        ),
      );

      tiledLayers.push(
        handlers.generation.createLayer(
          layerId++,
          "doors_above",
          width,
          height,
          doorsAbove,
          [
            { name: "collides", type: "bool", value: true },
            { name: "rendersAbove", type: "bool", value: true },
          ],
        ),
      );
    }

    /**
     * Build border layers
     */
    const borderGenerator = new BorderGenerator({ width, height }, this.loader);

    const elevate = (t: TerrainName): number => TERRAIN_ORDER.indexOf(t);

    const sorted = this.ordered()
      .flatMap((band) =>
        band.config.borders.map((border) => ({
          border,
          band: bands.indexOf(band),
        })),
      )
      .sort((a, b) => elevate(a.border.from) - elevate(b.border.from));

    const borderLayers = new Map<
      string,
      ReturnType<typeof handlers.generation.createLayer>
    >();

    for (const { border, band } of sorted) {
      const gid = firstgids.get(border.tileset)!;
      const data = this.clip(
        borderGenerator.generate(grid, border, gid),
        region,
        band,
      );
      const name = `${border.from}_${border.to}_border`;
      const existing = borderLayers.get(name);

      if (existing) {
        for (let i = 0; i < data.length; i++)
          if (data[i]) existing.data[i] = data[i];
        continue;
      }

      const properties = border.collides
        ? [{ name: "collides", type: "bool", value: true }]
        : undefined;

      const layer = handlers.generation.createLayer(
        layerId++,
        name,
        width,
        height,
        data,
        properties,
      );

      borderLayers.set(name, layer);
      tiledLayers.push(layer);
    }

    /**
     * Spawn entities
     */
    const hostTerrain = grid.slice(
      host.y * width,
      (host.y + this.config.height) * width,
    );
    const hostSpawn = handlers.generation.find.spawn(this.config, hostTerrain);
    const spawn = roomSpawn ?? {
      x: hostSpawn.x,
      y: hostSpawn.y + host.y * tileHeight,
    };

    const entities: Entity[] = [];

    for (const band of this.ordered()) {
      const b = bands.indexOf(band);
      const spawner = new EntitySpawner(
        { ...band.config, width, height },
        band.config.noise.seed ?? this.seed,
      );

      const within =
        bands.length > 1 ? region.map((r) => (r === b ? 1 : 0)) : undefined;

      entities.push(...spawner.spawn(grid, spawn, elevation, blocked, within));
    }

    entities.push(...roomEntities);

    /**
     * Peaks
     */
    for (let b = 0; b < bands.length; b++) {
      const { peak } = bands[b].config;
      if (!peak || peak.requires > this.unlocked || !elevations[b]) continue;

      const spot = this.summit(bands[b], elevation, blocked);
      if (!spot) continue;

      const minX = (spot.x - PEAK_CLEARANCE) * tileWidth;
      const maxX = (spot.x + PEAK_CLEARANCE + 1) * tileWidth;
      const minY = (spot.y - PEAK_CLEARANCE) * tileHeight;
      const maxY = (spot.y + PEAK_CLEARANCE + 1) * tileHeight;

      for (let i = entities.length - 1; i >= 0; i--) {
        const e = entities[i];
        if (e.x >= minX && e.x < maxX && e.y >= minY && e.y < maxY)
          entities.splice(i, 1);
      }

      const pos = handlers.generation.tileToWorld(spot.x, spot.y, tileWidth, tileHeight);
      const offset = configs.entities[peak.entity]?.offset;

      entities.push({
        name: peak.entity,
        x: pos.x + (offset?.x ?? 0),
        y: pos.y + (offset?.y ?? 0),
      });
    }

    /**
     * Wells (forest only)
     */
    if (this.config.id === BiomeName.FOREST) {
      const occupied = new Set<number>();

      for (const e of entities) {
        const tx = Math.floor(e.x / tileWidth);
        const ty = Math.floor(e.y / tileHeight);

        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++)
            if (handlers.generation.inBounds(tx + dx, ty + dy, width, height))
              occupied.add(
                handlers.generation.toIndex(tx + dx, ty + dy, width),
              );
      }

      const wells = handlers.generation.find.positions.well(
        view,
        terrain,
        spawn,
        10,
        this.seed,
        occupied,
      );

      for (const pos of wells)
        entities.push({ name: EntityName.WELL, x: pos.x, y: pos.y });

      /**
       * Entrances
       */
      const taken: { x: number; y: number }[] = [];

      for (const def of entrances) {
        if ((def.requires ?? 0) > this.unlocked) continue;

        const generator = new EntranceGenerator(view, this.seed, def);

        for (let n = 0; n < (def.count ?? 1); n++) {
          const entrance = generator.generate(terrain, spawn, n, taken);

          if (!entrance) continue;

          taken.push(entrance.origin);

          const pad = 1;
          const fw = def.width;
          const fh = def.height;
          const minX = (entrance.origin.x - pad) * tileWidth;
          const maxX = (entrance.origin.x + fw + pad) * tileWidth;
          const minY = (entrance.origin.y - pad) * tileHeight;
          const maxY = (entrance.origin.y + fh + pad) * tileHeight;

          for (let i = entities.length - 1; i >= 0; i--) {
            const e = entities[i];
            if (e.x >= minX && e.x < maxX && e.y >= minY && e.y < maxY)
              entities.splice(i, 1);
          }

          entities.push(...entrance.entities);
        }
      }
    }

    /**
     * Torches and ladders (dungeon only)
     */
    if (this.config.id === BiomeName.DUNGEON) {
      const torches = handlers.generation.find.positions.torch(
        view,
        terrain,
      );

      for (const pos of torches)
        entities.push({ name: EntityName.TORCH1, x: pos.x, y: pos.y });

      const ladders = handlers.generation.find.positions.ladder(
        view,
        terrain,
        DUNGEON_LADDER_COUNT,
        torches,
        this.seed,
      );
      const offset = configs.entities[EntityName.LADDER]?.offset;

      for (const pos of ladders)
        entities.push({
          name: EntityName.LADDER,
          x: pos.x + (offset?.x ?? 0),
          y: pos.y + (offset?.y ?? 0),
        });
    }

    /**
     * Cave exit
     */
    if (this.config.id === BiomeName.CAVE && roomExit) {
      entities.push({
        name: EntityName.CAVE_EXIT,
        x: roomExit.x,
        y: roomExit.y,
      });
    }

    /**
     * Assemble final map
     */
    const tilesets: any[] = [];

    for (const name of tilesetOrder) {
      const ts = this.loader.load(name);

      tilesets.push({
        columns: ts.columns,
        firstgid: firstgids.get(name)!,
        image: ts.image,
        imageheight: ts.imageheight,
        imagewidth: ts.imagewidth,
        margin: ts.margin,
        name: ts.name,
        spacing: ts.spacing,
        tilecount: ts.tilecount,
        tileheight: ts.tileheight,
        tilewidth: ts.tilewidth,
        ...(ts.tiles?.length ? { tiles: ts.tiles } : {}),
      });
    }

    const tilemap = {
      compressionlevel: -1,
      height,
      infinite: false,
      layers: tiledLayers,
      nextlayerid: layerId,
      nextobjectid: 1,
      orientation: "orthogonal",
      properties: [
        {
          name: "bands",
          type: "string",
          value: JSON.stringify(
            this.bands.map(({ config, y }) => ({
              label: config.label,
              y,
              height: config.height,
            })),
          ),
        },
      ],
      renderorder: "right-down",
      tiledversion: "1.11.0",
      tileheight: tileHeight,
      tilesets,
      tilewidth: tileWidth,
      type: "map",
      version: "1.10",
      width,
    };

    return {
      tilemap,
      spawn,
      entities,
    };
  }

  private smooth(config: BiomeConfig, terrain: TerrainName[]): TerrainName[] {
    if (!config.smoothing) return terrain;

    const { width, height } = config;
    const smoother = new TerrainSmoother(config);

    let result = smoother.smooth(
      terrain,
      config.smoothing.iterations,
      config.smoothing.threshold,
      "all",
    );
    result = handlers.generation.enforceMinimumWater(result, width, height);
    result = handlers.generation.unifyShores(result, width, height);
    result = handlers.generation.enforceMinimumBlock(
      result,
      width,
      height,
      TerrainName.GROUND,
      TerrainName.GRASS,
    );

    return result;
  }

  private seam(config: BiomeConfig, terrain: TerrainName[]): TerrainName[] {
    const { width, height } = config;
    const result = [...terrain];
    const seen = new Uint8Array(width * height);

    for (let start = 0; start < SEAM_MARGIN * width; start++) {
      if (seen[start] || result[start] !== TerrainName.WATER) continue;

      const stack = [start];
      const pond: number[] = [];
      seen[start] = 1;

      while (stack.length) {
        const i = stack.pop()!;
        pond.push(i);

        const x = i % width;
        const y = (i / width) | 0;

        for (const { dx, dy } of DIRECTIONS_CARDINAL) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;

          const n = ny * width + nx;
          if (seen[n] || result[n] !== TerrainName.WATER) continue;

          seen[n] = 1;
          stack.push(n);
        }
      }

      for (const i of pond) result[i] = TerrainName.GRASS;
    }

    return result;
  }

  private summit(
    band: BiomeBand,
    elevation: Uint8Array,
    blocked: Uint8Array,
  ): { x: number; y: number } | null {
    const { width } = this;
    const top = band.y;
    const bottom = band.y + band.config.height;
    const seed = handlers.generation.hash(`${band.config.noise.seed ?? this.seed}-peak`);

    let highest = 0;
    for (let i = top * width; i < bottom * width; i++)
      highest = Math.max(highest, elevation[i]);

    for (let level = highest; level >= 1; level--)
      for (let reach = PEAK_CLEARANCE; reach >= PEAK_CLEARANCE - 1; reach--) {
        const candidates: { x: number; y: number }[] = [];

        for (let y = top + reach; y < bottom - reach; y++)
          for (let x = reach; x < width - reach; x++) {
            let open = true;

            for (let dy = -reach; dy <= reach && open; dy++)
              for (let dx = -reach; dx <= reach && open; dx++) {
                const i = (y + dy) * width + x + dx;
                open = elevation[i] === level && !blocked[i];
              }

            if (open) candidates.push({ x, y });
          }

        if (candidates.length)
          return candidates[
            handlers.generation.spatialHash(candidates.length, level, seed) %
              candidates.length
          ];
      }

    return null;
  }

  private mask(
    grid: TerrainName[],
    region: Uint8Array,
    band: number,
  ): TerrainName[] {
    if (this.bands.length === 1) return grid;
    return grid.map((t, i) => (region[i] === band ? t : TerrainName.VOID));
  }

  private clip(data: number[], region: Uint8Array, band: number): number[] {
    if (this.bands.length === 1) return data;

    for (let i = 0; i < data.length; i++) if (region[i] !== band) data[i] = 0;
    return data;
  }

  private ordered(): BiomeBand[] {
    const host = this.bands[this.host];
    return [host, ...this.bands.filter((b) => b !== host)];
  }

  private collectTilesets(): string[] {
    const names = new Set<string>();

    for (const { config } of this.ordered()) {
      for (const layer of config.layers) names.add(layer.tileset);
      for (const border of config.borders) names.add(border.tileset);
      for (const detail of config.details ?? []) names.add(detail.tileset);
      if (config.walls) names.add(config.walls);
      if (config.ledge) names.add(config.ledge);
      for (const name of config.tilesets ?? []) names.add(name);
    }

    return Array.from(names);
  }
}
