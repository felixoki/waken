import { handlers } from "../../handlers";
import { TilesetLoader } from "../../loaders/Tileset";
import {
  BiomeConfig,
  GeneratedMap,
  TerrainName,
  TileRole,
} from "../../types/generation";
import { BorderGenerator } from "../generators/Border";
import { TerrainGenerator } from "../generators/Terrain";
import { TerrainSmoother } from "../smoothers/Terrain";
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
     * Build fill layers
     */
    const tiledLayers: any[] = [];
    let layerId = 1;

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
    }

    /**
     * Build border layers
     */
    const borderGenerator = new BorderGenerator(this.config, this.loader);

    for (const border of borders) {
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
}
