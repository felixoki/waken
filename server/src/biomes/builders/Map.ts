import { handlers } from "../../handlers";
import { TilesetLoader } from "../../loaders/Tileset";
import { EntityName, SurfaceName } from "../../types";
import { configs } from "../../configs";
import {
  DUNGEON_CANDLE_CLEARANCE,
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
  SeparatorStamp,
  SetpiecePlacement,
  SiteConfig,
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
    const { tileWidth, tileHeight } = this.config;
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
    let roomSeparators: SeparatorStamp[] | undefined;
    let roomSetpieces: SetpiecePlacement[] = [];

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
        separators?: SeparatorStamp[];
        setpieces?: SetpiecePlacement[];
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
      roomSeparators = generated.separators?.map((s) => ({
        ...s,
        index: s.index + offset,
      }));
      roomSetpieces = (generated.setpieces ?? []).map((p) => ({
        ...p,
        y: p.y + y,
      }));
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
        const exact =
          !!config.walls &&
          !config.borders.some(
            (b) => b.from === fillTerrain || b.to === fillTerrain,
          );

        for (let y = top; y < top + config.height; y++)
          for (let x = 0; x < width; x++) {
            const idx = handlers.generation.toIndex(x, y, width);

            if (
              isBaseLayer ||
              (exact
                ? grid[idx] === fillTerrain
                : handlers.generation.isTerrainAtOrAbove(
                    grid[idx],
                    layerConfig.terrain,
                  ))
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
        let floor = tiledLayers.find((l) => l.name === TerrainName.FLOOR);

        if (!floor) {
          floor = handlers.generation.createLayer(
            layerId++,
            TerrainName.FLOOR,
            width,
            height,
            new Array(width * height).fill(0),
          );
          tiledLayers.push(floor);
        }

        const underlay: number[] = floor.data;
        const ground = tiledLayers.find((l) => l.name === "overlay") ?? floor;

        (ground.properties ??= []).push({
          name: "shadows",
          type: "bool",
          value: true,
        });

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
       * Void
       */
      const ceiling = tiledLayers.find((l) => l.name === TerrainName.VOID);

      if (ceiling) {
        for (let i = 0; i < ceiling.data.length; i++)
          if (tiledLayers.some((l) => l !== ceiling && l.data[i] !== 0))
            ceiling.data[i] = 0;

        ceiling.properties = [
          { name: "rendersAbove", type: "bool", value: true },
        ];
        tiledLayers.push(
          ...tiledLayers.splice(tiledLayers.indexOf(ceiling), 1),
        );
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

      const stair = this.config.stair;
      const stairGen = new StairGenerator({ width, height }, stair?.tiles);
      const stairs = stairGen.generate(
        terrain,
        stair ? firstgids.get(stair.tileset)! : gid,
        this.seed,
        ledges,
      );

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

      tiledLayers.push(
        handlers.generation.createLayer(
          layerId++,
          "stairs",
          width,
          height,
          stairs,
          [
            { name: "clearance", type: "int", value: LEDGE_CLEARANCE },
            { name: "collides", type: "bool", value: true },
            { name: "seeThrough", type: "bool", value: true },
            { name: "walkable", type: "bool", value: true },
          ],
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
        ["walls", "walls_above", TerrainName.VOID].includes(l.name),
      );

      new WallGenerator({ width, height }, this.loader).doors(
        this.config.walls,
        gid,
        tiledLayers.find((l) => l.name === "walls").data,
        doorsBelow,
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

    if (this.config.walls)
      new WallGenerator({ width, height }, this.loader).flatten(
        terrain,
        firstgids.get(this.config.walls)!,
        tiledLayers.find((l) => l.name === "walls").data,
        tiledLayers.find((l) => l.name === "walls_above").data,
        tiledLayers.find((l) => l.name === "doors_above")?.data,
      );

    /**
     * Build separators
     */
    const separated = new Set<number>();

    if (roomSeparators?.length && this.config.walls) {
      const gid = firstgids.get(this.config.walls)!;

      const data = (name: string, rendersAbove: boolean): number[] => {
        let layer = tiledLayers.find((l) => l.name === name);

        if (!layer) {
          layer = handlers.generation.createLayer(
            layerId++,
            name,
            width,
            height,
            new Array(width * height).fill(0),
            rendersAbove
              ? [
                  { name: "collides", type: "bool", value: true },
                  { name: "rendersAbove", type: "bool", value: true },
                ]
              : [{ name: "collides", type: "bool", value: true }],
          );
          tiledLayers.push(layer);
        }

        return layer.data;
      };

      for (const stamp of roomSeparators) {
        const target = data(stamp.layer, stamp.layer.endsWith("_above"));

        if (
          stamp.expect !== undefined &&
          target[stamp.index] !== gid + stamp.expect
        )
          continue;

        target[stamp.index] = gid + stamp.id;
        separated.add(stamp.index);
      }

      const overlaid = tiledLayers.find((l) => l.name === "overlay");
      if (overlaid) for (const i of separated) overlaid.data[i] = 0;
    }

    const sanctums = roomSetpieces.map((p) => ({
      minX: p.span.x * tileWidth,
      minY: (p.y - 1) * tileHeight,
      maxX: (p.span.x + p.span.width) * tileWidth,
      maxY: (p.y + p.setpiece.height) * tileHeight,
    }));

    for (const p of roomSetpieces)
      for (let y = p.y; y < p.y + p.setpiece.anchor.y; y++)
        for (let x = p.span.x; x < p.span.x + p.span.width; x++)
          separated.add(y * width + x);

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
     * Sites
     */
    for (let b = 0; b < bands.length; b++)
      for (const site of bands[b].config.sites ?? []) {
        if (site.requires > this.unlocked || !elevations[b]) continue;

        const origin = this.site(bands[b], site, grid, elevation, blocked);
        if (!origin) continue;

        const minX = (origin.x - 1) * tileWidth;
        const maxX = (origin.x + site.width + 1) * tileWidth;
        const minY = (origin.y - 1) * tileHeight;
        const maxY = (origin.y + site.height + 1) * tileHeight;

        for (let i = entities.length - 1; i >= 0; i--) {
          const e = entities[i];
          if (e.x >= minX && e.x < maxX && e.y >= minY && e.y < maxY)
            entities.splice(i, 1);
        }

        entities.push({
          name: site.entity,
          x: (origin.x + site.width / 2) * tileWidth,
          y: (origin.y + site.height / 2) * tileHeight,
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
     * Torches and ladders (dungeon and temple only)
     */
    if (
      this.config.id === BiomeName.DUNGEON ||
      this.config.id === BiomeName.TEMPLE
    ) {
      const torches = handlers.generation.find.positions.torch(
        view,
        terrain,
      );

      const fixtures = (pos: { x: number; y: number }) => {
        const i =
          Math.floor(pos.y / tileHeight) * width + Math.floor(pos.x / tileWidth);

        return !separated.has(i - 1) && !separated.has(i) && !separated.has(i + 1);
      };

      for (const pos of torches.filter(fixtures))
        entities.push({ name: EntityName.TORCH1, x: pos.x, y: pos.y });

      const ladders = handlers.generation.find.positions.ladder(
        view,
        terrain,
        DUNGEON_LADDER_COUNT,
        torches,
        this.seed,
      );
      const offset = configs.entities[EntityName.LADDER]?.offset;

      for (const pos of ladders.filter(fixtures))
        entities.push({
          name: EntityName.LADDER,
          x: pos.x + (offset?.x ?? 0),
          y: pos.y + (offset?.y ?? 0),
        });

      /**
       * Candles
       */
      if (this.config.walls) {
        const windows = new Array(width * height).fill(0);
        const candles = [
          EntityName.CANDLES1,
          EntityName.CANDLES2,
          EntityName.CANDLES3,
        ];
        const obstacles = [...sanctums];

        for (const e of entities) {
          const fixture =
            e.name === EntityName.TORCH1 || e.name === EntityName.LADDER;
          const extent = RoomGenerator.extent(e.name, tileWidth, tileHeight);
          const reach = fixture
            ? DUNGEON_CANDLE_CLEARANCE * tileWidth - extent.x + 4
            : 0;

          obstacles.push({
            minX: e.x - extent.x - reach,
            minY: e.y - extent.y - (fixture ? tileHeight : 0),
            maxX: e.x + extent.x + reach,
            maxY: e.y + extent.y + (fixture ? tileHeight : 0),
          });
        }

        const niches = new WallGenerator({ width, height }, this.loader).niches(
          this.config.walls,
          firstgids.get(this.config.walls)!,
          tiledLayers.find((l) => l.name === "walls").data,
          windows,
          obstacles,
          tileWidth,
          tileHeight,
          this.seed,
        );

        for (const niche of niches)
          entities.push({
            name: candles[niche.size - 1],
            x: (niche.x + 1) * tileWidth,
            y: (niche.y + 1) * tileHeight,
          });

        if (niches.length)
          tiledLayers.push(
            handlers.generation.createLayer(
              layerId++,
              "windows",
              width,
              height,
              windows,
            ),
          );

        /**
         * Arches
         */
        const arch = this.config.arches;

        if (arch) {
          const fixtures = entities
            .filter(
              (e) =>
                e.name === EntityName.TORCH1 || e.name === EntityName.LADDER,
            )
            .map((e) => ({
              minX: e.x - tileWidth,
              minY: e.y - tileHeight * 2,
              maxX: e.x + tileWidth,
              maxY: e.y + tileHeight * 2,
            }));

          const { data, spots } = new WallGenerator(
            { width, height },
            this.loader,
          ).arches(
            arch,
            tiledLayers.find((l) => l.name === "walls").data,
            firstgids.get(this.config.walls)!,
            firstgids.get(arch.tileset)!,
            [...fixtures, ...sanctums],
            windows,
            tileWidth,
            tileHeight,
            this.seed,
          );

          const rows = arch.tiles.length;
          const columns = arch.tiles[0].length;

          for (const spot of spots)
            entities.push({
              name: arch.entity,
              x: (spot.x + columns / 2) * tileWidth,
              y: (spot.y + rows - 1) * tileHeight,
            });

          if (spots.length) {
            const at = tiledLayers.findIndex(
              (l) => l.name === "walls_above",
            );

            tiledLayers.splice(
              at,
              0,
              handlers.generation.createLayer(
                layerId++,
                "arches",
                width,
                height,
                data,
                [{ name: "collides", type: "bool", value: true }],
              ),
            );
          }
        }
      }
    }

    /**
     * Skins
     */
    const skinned = new Set<string>();

    for (const skin of this.config.skins ?? []) {
      const base = firstgids.get(skin.of)!;
      const first = firstgids.get(skin.tileset)!;
      const swaps = new Map<number, number>();

      for (const tile of this.loader.load(skin.tileset).tiles ?? []) {
        const of = handlers.generation.parseProperties(tile.properties).skinOf;
        if (of !== undefined) swaps.set(base + of, first + tile.id);
      }

      for (const layer of tiledLayers)
        for (let i = 0; i < layer.data.length; i++) {
          const swap = swaps.get(layer.data[i]);
          if (swap !== undefined) layer.data[i] = swap;
        }

      skinned.add(skin.of);
    }

    /**
     * Variants
     */
    const variantSeed = handlers.generation.hash(`${this.seed}-variants`);

    for (const variant of this.config.variants ?? []) {
      const base = firstgids.get(variant.of)!;
      const first = firstgids.get(variant.tileset)!;
      const options = new Map<number, number[]>();

      for (const tile of this.loader.load(variant.tileset).tiles ?? []) {
        const of = handlers.generation.parseProperties(tile.properties)
          .variantOf;
        if (of === undefined) continue;

        const list = options.get(base + of) ?? [];
        list.push(first + tile.id);
        options.set(base + of, list);
      }

      for (const layer of tiledLayers) {
        if (!["walls", "walls_above", "ledges"].includes(layer.name)) continue;

        for (let i = 0; i < layer.data.length; i++) {
          const list = options.get(layer.data[i]);
          if (!list) continue;

          const rng = handlers.generation.seededRandom(
            handlers.generation.spatialHash(
              i % width,
              (i / width) | 0,
              variantSeed,
            ),
          );

          if (rng() < variant.chance)
            layer.data[i] = list[Math.floor(rng() * list.length)];
        }
      }
    }

    /**
     * Setpieces
     */
    for (const p of roomSetpieces) {
      const covered = new Set<number>();

      for (const layer of p.setpiece.layers)
        for (const [dx, dy] of layer.tiles)
          covered.add((p.y + dy) * width + p.x + dx);

      for (const i of covered) for (const layer of tiledLayers) layer.data[i] = 0;

      for (const layer of p.setpiece.layers) {
        let target = tiledLayers.find((l) => l.name === layer.name);

        if (!target) {
          target = handlers.generation.createLayer(
            layerId++,
            layer.name,
            width,
            height,
            new Array(width * height).fill(0),
            layer.properties,
          );

          const at = layer.before
            ? tiledLayers.findIndex((l) => l.name === layer.before)
            : -1;

          if (at >= 0) tiledLayers.splice(at, 0, target);
          else tiledLayers.push(target);
        }

        const gid = firstgids.get(layer.tileset)!;

        for (const [dx, dy, id] of layer.tiles)
          target.data[(p.y + dy) * width + p.x + dx] = gid + id;
      }

      const skirt = this.config.rooms?.altars?.skirt;
      const walls = tiledLayers.find((l) => l.name === "walls");
      const trim = skirt && tiledLayers.find((l) => l.name === skirt.layer);

      if (!skirt || !walls || !trim) continue;

      const gid = firstgids.get(skirt.tileset)!;
      const row = p.y + p.setpiece.anchor.y;

      for (let x = p.span.x; x < p.span.x + p.span.width; x++) {
        if (x >= p.x && x < p.x + p.setpiece.width) continue;
        if (walls.data[(row - 1) * width + x] !== gid + skirt.wall) continue;

        skirt.tiles.forEach((id, r) => {
          trim.data[(row - 1 + r) * width + x] = gid + id;
        });
      }
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
      const first = firstgids.get(name)!;

      if (
        skinned.has(name) &&
        !tiledLayers.some((l) =>
          l.data.some(
            (gid: number) => gid >= first && gid < first + ts.tilecount,
          ),
        )
      )
        continue;

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
      layers: tiledLayers.filter((l) => l.data.some((gid: number) => gid !== 0)),
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

  private site(
    band: BiomeBand,
    site: SiteConfig,
    grid: TerrainName[],
    elevation: Uint8Array,
    blocked: Uint8Array,
  ): { x: number; y: number } | null {
    const { width } = this;
    const top = band.y;
    const bottom = band.y + band.config.height;
    const seed = handlers.generation.hash(
      `${band.config.noise.seed ?? this.seed}-${site.entity}`,
    );
    const rise = site.height - (site.base ?? site.height);

    let highest = 0;
    for (let i = top * width; i < bottom * width; i++)
      highest = Math.max(highest, elevation[i]);

    for (const terrain of site.terrain)
      for (let margin = 1; margin >= 0; margin--) {
        const levels = new Map<number, { x: number; y: number }[]>();

        for (let y = top + margin; y < bottom - site.height - margin; y++)
          for (let x = margin; x < width - site.width - margin; x++) {
            const level = elevation[(y + site.height - 1) * width + x];
            let open = true;

            for (let dy = rise; dy < site.height + margin && open; dy++)
              for (let dx = -margin; dx < site.width + margin && open; dx++) {
                const i = (y + dy) * width + x + dx;
                open =
                  grid[i] === terrain && elevation[i] === level && !blocked[i];
              }

            if (!open) continue;

            const list = levels.get(level) ?? [];
            list.push({ x, y });
            levels.set(level, list);
          }

        const ranked = [...levels.keys()].sort((a, b) => b - a);
        const level = ranked.find((l) => l < highest) ?? ranked[0];
        const candidates = level === undefined ? undefined : levels.get(level);

        if (level === undefined || !candidates?.length) continue;

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
      if (config.stair) names.add(config.stair.tileset);
      if (config.arches) names.add(config.arches.tileset);
      for (const skin of config.skins ?? []) names.add(skin.tileset);
      for (const layer of config.rooms?.altars?.setpiece.layers ?? [])
        names.add(layer.tileset);
      for (const name of config.tilesets ?? []) names.add(name);
      for (const variant of config.variants ?? []) names.add(variant.tileset);
    }

    return Array.from(names);
  }
}
