import { handlers } from "../../handlers";
import { TilesetLoader } from "../../loaders/Tileset";
import { EntityName } from "../../types";
import {
  BiomeConfig,
  GeneratedMap,
  TerrainName,
  TileRole,
} from "../../types/generation";
import { BorderGenerator } from "../generators/Border";
import { TerrainGenerator } from "../generators/Terrain";
import { TerrainSmoother } from "../smoothers/Terrain";
import { DetailSpawner } from "../spawners/Detail";
import { EntitySpawner } from "../spawners/Entity";

export class MapBuilder {
  private config: BiomeConfig;
  private loader: TilesetLoader;

  constructor(config: BiomeConfig, loader: TilesetLoader) {
    this.config = config;
    this.loader = loader;
  }

  build(): GeneratedMap {
    const { width, height, tileWidth, tileHeight, layers, borders } =
      this.config;

    const terrainGenerator = new TerrainGenerator(this.config);
    const rawTerrain = terrainGenerator.generate();

    const smoother = new TerrainSmoother(this.config);
    const terrain = smoother.smooth(rawTerrain, 2, 4, "all");

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
    const tiledLayers: any[] = [];
    let layerId = 1;
    const detailSpawner = new DetailSpawner();

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

      for (let y = 0; y < height; y++) {
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
            const tile = fills[hash % fills.length];
            data[idx] = gid + tile.id;
          }
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
     * Build border layers
     */
    const borderGenerator = new BorderGenerator(this.config, this.loader);

    const elevate = (t: TerrainName): number =>
      this.config.terrain.indexOf(t);

    const sorted = [...borders].sort(
      (a, b) => elevate(b.from) - elevate(a.from),
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
    const seed = this.config.noise.seed ?? "default";
    const spawner = new EntitySpawner(this.config, seed);
    const spawn = this._findSpawn(terrain);
    const entities = spawner.spawn(terrain, spawn);

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

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = gen.toIndex(x, y, width);
        if (!this.config.terrain.includes(terrain[index])) continue;

        const distance = Math.abs(x - tile.x) + Math.abs(y - tile.y);
        if (distance < min) continue;

        candidates.push({ x, y });
      }
    }

    const seed = this.config.noise.seed ?? "default";
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
