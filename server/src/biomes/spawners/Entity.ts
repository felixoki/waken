import { configs } from "../../configs";
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

      if (rule.count) {
        this._spawnCount(r, rule, terrain, entities, occupied);
        continue;
      }

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
          const offset = configs.entities[name]?.offset;

          entities.push({
            name,
            x: pos.x + (offset?.x ?? 0),
            y: pos.y + (offset?.y ?? 0),
          });

          if (rule.group)
            this._spawnGroup(x, y, r, hash, rule, terrain, entities, occupied);

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
    const { min, max, radius } = rule.group!;
    const gen = handlers.generation;
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
      const offset = configs.entities[name]?.offset;

      entities.push({
        name,
        x: pos.x + (offset?.x ?? 0),
        y: pos.y + (offset?.y ?? 0),
      });
      occupied.add(gen.toIndex(spot.x, spot.y, width));
    }
  }

  private _spawnCount(
    r: number,
    rule: SpawnRule,
    terrain: TerrainName[],
    entities: Entity[],
    occupied: Set<number>,
  ) {
    const { width, height, tileWidth, tileHeight } = this.config;
    const gen = handlers.generation;
    const rng = gen.seededRandom(gen.hash(`${this.seed}-${r}`));

    const candidates: { x: number; y: number }[] = [];
    
    for (let y = 0; y < height; y++)
      for (let x = 0; x < width; x++) {
        const index = gen.toIndex(x, y, width);
        if (occupied.has(index)) continue;
        if (!rule.terrain.includes(terrain[index])) continue;
        candidates.push({ x, y });
      }

    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }

    const { min, max } = rule.count!;
    const target = min + Math.floor(rng() * (max - min + 1));

    let placed = 0;
    for (const { x, y } of candidates) {
      if (placed >= target) break;
      if (occupied.has(gen.toIndex(x, y, width))) continue;

      const hash = gen.spatialHash(x, y, r);
      const name = rule.entities[hash % rule.entities.length];
      const pos = gen.tileToWorld(x, y, tileWidth, tileHeight);
      const offset = configs.entities[name]?.offset;

      entities.push({
        name,
        x: pos.x + (offset?.x ?? 0),
        y: pos.y + (offset?.y ?? 0),
      });
      placed++;

      if (rule.group)
        this._spawnGroup(x, y, r, hash, rule, terrain, entities, occupied);

      this._reserve(occupied, x, y, rule.spacing);
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
      return value * (rule.density ?? 0) >= 0.25;
    }

    const hash = handlers.generation.spatialHash(x, y, r + 1000);
    return handlers.generation.hashToUnit(hash) < (rule.density ?? 0);
  }
}
