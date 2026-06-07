import { handlers } from "../../handlers";
import { TilesetLoader } from "../../loaders/Tileset";
import { EntityName } from "../../types";
import {
  BiomeConfig,
  Entity,
  GeneratedMap,
  TERRAIN_ORDER,
  TerrainName,
  TileRole,
} from "../../types/generation";
import { BorderGenerator } from "../generators/Border";
import { LedgeGenerator } from "../generators/Ledge";
import { RoomGenerator } from "../generators/Room";
import { TerrainGenerator } from "../generators/Terrain";
import { WallGenerator } from "../generators/Wall";
import { TerrainSmoother } from "../smoothers/Terrain";
import { DetailSpawner } from "../spawners/Detail";
import { EntitySpawner } from "../spawners/Entity";

export class MapBuilder {
  private config: BiomeConfig;
  private loader: TilesetLoader;
  private seed: string;

  constructor(config: BiomeConfig, loader: TilesetLoader, seed: string) {
    this.config = config;
    this.loader = loader;
    this.seed = seed;
  }

  build(): GeneratedMap {
    const { width, height, tileWidth, tileHeight, layers, borders } =
      this.config;

    const generators = { terrain: TerrainGenerator, room: RoomGenerator };
    const generator = new generators[this.config.generator](
      this.config,
      this.seed,
    );
    const {
      terrain: genTerrain,
      entities: roomEntities,
      spawn: roomSpawn,
    } = generator.generate() as {
      terrain: TerrainName[];
      entities: Entity[];
      spawn?: { x: number; y: number };
    };
    let terrain = genTerrain;

    if (this.config.smoothing) {
      const smoother = new TerrainSmoother(this.config);
      terrain = smoother.smooth(
        terrain,
        this.config.smoothing.iterations,
        this.config.smoothing.threshold,
        "all",
      );
      terrain = handlers.generation.enforceMinimumWater(terrain, width, height);
      terrain = handlers.generation.unifyShores(terrain, width, height);
      terrain = handlers.generation.enforceMinimumBlock(
        terrain,
        width,
        height,
        TerrainName.GROUND,
        TerrainName.GRASS,
      );
    }

    const tilesetOrder = this.collectTilesets();
    const firstgids = new Map<string, number>();

    let nextGid = 1;

    for (const name of tilesetOrder) {
      firstgids.set(name, nextGid);
      const tileset = this.loader.load(name);
      nextGid += tileset.tilecount;
    }

    /**
     * Build fill layers, interleaving per-terrain detail layers immediately after
     * each fill so ground details render beneath the grass fill layer.
     */
    let layerId = 1;
    const tiledLayers: any[] = [];
    const detailSeed = this.seed;
    const detailSpawner = new DetailSpawner(detailSeed);

    for (let i = 0; i < layers.length; i++) {
      const layerConfig = layers[i];

      const fills = this.loader.query(layerConfig.tileset, {
        role: TileRole.FILL,
        terrain: layerConfig.terrain,
      });

      if (!fills.length) continue;

      const gid = firstgids.get(layerConfig.tileset)!;
      const data = new Array(width * height).fill(0);
      const isBaseLayer = i === 0;

      for (let y = 0; y < height; y++)
        for (let x = 0; x < width; x++) {
          const idx = handlers.generation.toIndex(x, y, width);

          if (
            isBaseLayer ||
            handlers.generation.isTerrainAtOrAbove(
              terrain[idx],
              layerConfig.terrain,
            )
          ) {
            const hash = handlers.generation.spatialHash(x, y, 0);
            const tile =
              fills.length > 1 && hash % 16 < 2
                ? fills[1 + (hash % (fills.length - 1))]
                : fills[0];
            data[idx] = gid + tile.id;
          }
        }

      tiledLayers.push(
        handlers.generation.createLayer(
          layerId++,
          layerConfig.terrain,
          width,
          height,
          data,
        ),
      );

      for (const detailConfig of this.config.details ?? []) {
        if (!detailConfig.terrains.includes(layerConfig.terrain)) continue;

        const highestTerrain = detailConfig.terrains.reduce((best, t) => {
          const bestIdx = layers.findIndex((l) => l.terrain === best);
          const tIdx = layers.findIndex((l) => l.terrain === t);
          return tIdx > bestIdx ? t : best;
        });

        if (highestTerrain !== layerConfig.terrain) continue;

        const detailGid = firstgids.get(detailConfig.tileset);
        if (detailGid === undefined) continue;

        const detailData = detailSpawner.spawn(
          terrain,
          width,
          height,
          detailConfig,
          detailGid,
        );

        tiledLayers.push(
          handlers.generation.createLayer(
            layerId++,
            `${detailConfig.terrains.join("_")}_details`,
            width,
            height,
            detailData,
          ),
        );
      }
    }

    /**
     * Build wall layer
     */
    if (this.config.walls) {
      const gid = firstgids.get(this.config.walls)!;
      const generator = new WallGenerator(
        { width: this.config.width, height: this.config.height },
        this.loader,
      );
      const walls = generator.generate(terrain, this.config.walls, gid);

      for (let i = 0; i < walls.length; i++)
        if (walls[i] !== 0) for (const layer of tiledLayers) layer.data[i] = 0;

      tiledLayers.push(
        handlers.generation.createLayer(
          layerId++,
          "walls",
          width,
          height,
          walls,
          [{ name: "collides", type: "bool", value: true }],
        ),
      );
    }

    /**
     * Build ledge layer
     */
    if (this.config.ledge) {
      const gid = firstgids.get(this.config.ledge)!;
      const gen = new LedgeGenerator(
        { width: this.config.width, height: this.config.height },
        this.loader,
      );
      const ledges = gen.generate(terrain, this.config.ledge, gid);

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
    }

    /**
     * Build border layers
     */
    const borderGenerator = new BorderGenerator(this.config, this.loader);

    const elevate = (t: TerrainName): number => TERRAIN_ORDER.indexOf(t);

    const sorted = [...borders].sort(
      (a, b) => elevate(a.from) - elevate(b.from),
    );

    for (const border of sorted) {
      const gid = firstgids.get(border.tileset)!;
      const data = borderGenerator.generate(terrain, border, gid);
      const properties = border.collides
        ? [{ name: "collides", type: "bool", value: true }]
        : undefined;

      tiledLayers.push(
        handlers.generation.createLayer(
          layerId++,
          `${border.from}_${border.to}_border`,
          width,
          height,
          data,
          properties,
        ),
      );
    }

    /**
     * Spawn entities
     */
    const spawner = new EntitySpawner(this.config, this.seed);
    const spawn = roomSpawn ?? this._findSpawn(terrain);
    const entities = [...spawner.spawn(terrain, spawn), ...roomEntities];

    /**
     * Wells
     */
    const wells = this._findWellPositions(terrain, spawn, 15);

    for (const pos of wells)
      entities.push({ name: EntityName.WELL, x: pos.x, y: pos.y });

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

  private collectTilesets(): string[] {
    const names = new Set<string>();

    for (const layer of this.config.layers) names.add(layer.tileset);
    for (const border of this.config.borders) names.add(border.tileset);
    for (const detail of this.config.details ?? []) names.add(detail.tileset);
    if (this.config.walls) names.add(this.config.walls);
    if (this.config.ledge) names.add(this.config.ledge);

    return Array.from(names);
  }

  private _findSpawn(terrain: TerrainName[]): { x: number; y: number } {
    const { width, height, tileWidth, tileHeight } = this.config;

    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);

    const found = handlers.generation.spiralSearch(
      centerX,
      centerY,
      width,
      height,
      (x, y) =>
        this.config.terrain.includes(
          terrain[handlers.generation.toIndex(x, y, width)],
        ),
    );

    const tile = found ?? { x: centerX, y: centerY };
    return handlers.generation.tileToWorld(
      tile.x,
      tile.y,
      tileWidth,
      tileHeight,
    );
  }

  private _findWellPositions(
    terrain: TerrainName[],
    spawn: { x: number; y: number },
    count: number,
  ): { x: number; y: number }[] {
    const { width, height, tileWidth, tileHeight } = this.config;
    const gen = handlers.generation;

    const tile = {
      x: Math.floor(spawn.x / tileWidth),
      y: Math.floor(spawn.y / tileHeight),
    };
    const min = 40;
    const candidates: { x: number; y: number }[] = [];

    for (let y = 0; y < height; y++)
      for (let x = 0; x < width; x++) {
        const index = gen.toIndex(x, y, width);
        if (!this.config.terrain.includes(terrain[index])) continue;

        const distance = Math.abs(x - tile.x) + Math.abs(y - tile.y);
        if (distance < min) continue;

        candidates.push({ x, y });
      }

    const seed = this.seed;
    const fallback = { x: tile.x + min, y: tile.y + min };
    const positions: { x: number; y: number }[] = [];

    for (let i = 0; i < count; i++) {
      const start = Math.floor((i * candidates.length) / count);
      const end = Math.floor(((i + 1) * candidates.length) / count);

      const slice = candidates.slice(start, end);
      const hash = gen.spatialHash(slice.length, i, seed.length);
      const pick = slice.length ? slice[hash % slice.length] : fallback;

      positions.push(gen.tileToWorld(pick.x, pick.y, tileWidth, tileHeight));
    }

    return positions;
  }
}
