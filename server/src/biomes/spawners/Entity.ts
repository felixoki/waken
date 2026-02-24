import { handlers } from "../../handlers";
import {
  BiomeConfig,
  Entity,
  SpawnRule,
  TerrainName,
} from "../../types/generation";
import { NoiseGenerator } from "../generators/Noise";

export class EntitySpawner {
  private config: BiomeConfig;
  private seed: string;

  constructor(config: BiomeConfig, seed: string) {
    this.config = config;
    this.seed = seed;
  }

  spawn(terrain: TerrainName[], spawn: { x: number; y: number }): Entity[] {
    const { width, height, tileHeight, tileWidth } = this.config;
    const gen = handlers.generation;
    const entities: Entity[] = [];
    const occupied = new Set<number>();

    this._reserve(
      occupied,
      Math.floor(spawn.x / tileWidth),
      Math.floor(spawn.y / tileHeight),
      this.config.exclusion,
    );

    for (let r = 0; r < this.config.objects.length; r++) {
      const rule = this.config.objects[r];

      let noise: NoiseGenerator | null = null;
      if (rule.cluster)
        noise = new NoiseGenerator({
          seed: `${this.seed}-${r}`,
          scale: 0.08,
          octaves: 2,
        });

      for (let y = 0; y < height; y++)
        for (let x = 0; x < width; x++) {
          const index = gen.toIndex(x, y, width);

          if (occupied.has(index)) continue;
          if (!rule.terrain.includes(terrain[index])) continue;
          if (!this._shouldSpawn(x, y, r, rule, noise)) continue;

          const hash = gen.spatialHash(x, y, r);
          const name = rule.entities[hash % rule.entities.length];
          const pos = gen.tileToWorld(x, y, tileWidth, tileHeight);

          entities.push({ name, ...pos });

          if (rule.group) {
            this._spawnGroup(x, y, r, hash, rule, terrain, entities, occupied);
          }

          this._reserve(occupied, x, y, rule.spacing);
        }
    }

    return entities;
  }

  private _spawnGroup(
    x: number,
    y: number,
    r: number,
    hash: number,
    rule: SpawnRule,
    terrain: TerrainName[],
    entities: Entity[],
    occupied: Set<number>,
  ) {
    const { width, height, tileWidth, tileHeight } = this.config;
    const gen = handlers.generation;
    const { min, max, radius } = rule.group!;
    const count = min + (hash % (max - min + 1));

    for (let i = 0; i < count; i++) {
      const spot = gen.spiralSearch(x, y, width, height, (sx, sy) => {
        if (Math.abs(sx - x) + Math.abs(sy - y) > radius) return false;
        const index = gen.toIndex(sx, sy, width);
        if (occupied.has(index)) return false;
        return rule.terrain.includes(terrain[index]);
      });

      if (!spot) break;

      const hash = gen.spatialHash(spot.x, spot.y, r + i);
      const name = rule.entities[hash % rule.entities.length];
      const pos = gen.tileToWorld(spot.x, spot.y, tileWidth, tileHeight);

      entities.push({ name, ...pos });
      occupied.add(gen.toIndex(spot.x, spot.y, width));
    }
  }

  private _reserve(
    occupied: Set<number>,
    cx: number,
    cy: number,
    radius: number,
  ) {
    const { width, height } = this.config;

    for (let dy = -radius; dy <= radius; dy++)
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = cx + dx,
          ny = cy + dy;

        if (handlers.generation.inBounds(nx, ny, width, height))
          occupied.add(handlers.generation.toIndex(nx, ny, width));
      }
  }

  private _shouldSpawn(
    x: number,
    y: number,
    r: number,
    rule: SpawnRule,
    noise: NoiseGenerator | null,
  ): boolean {
    if (noise) {
      const value = (noise.generate(x, y) + 1) / 2;
      return value * rule.density >= 0.25;
    }

    const hash = handlers.generation.spatialHash(x, y, r + 1000);
    return handlers.generation.hashToUnit(hash) < rule.density;
  }
}
