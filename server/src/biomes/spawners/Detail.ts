import { handlers } from "../../handlers";
import { TerrainName, DetailConfig } from "../../types/generation";
import { NoiseGenerator } from "../generators/Noise";

export class DetailSpawner {
  private seed: string;
  private width: number;
  private height: number;
  private occupied: Uint8Array;

  constructor(seed: string, width: number, height: number, blocked?: Uint8Array) {
    this.seed = seed;
    this.width = width;
    this.height = height;
    this.occupied = blocked ? blocked.slice() : new Uint8Array(width * height);
  }

  spawn(
    terrain: TerrainName[],
    config: DetailConfig,
    firstgid: number,
    data: number[],
  ): number {
    const { width, height, occupied } = this;
    const gen = handlers.generation;

    if (!config.stamps.length) return 0;

    const key = `${this.seed}-detail-${config.tileset}-${config.terrains.join(",")}`;
    const rng = gen.seededRandom(gen.hash(key));
    const noise = config.cluster
      ? new NoiseGenerator({ seed: key, scale: 0.08, octaves: 2 })
      : null;
    const gap = config.gap ?? 0;

    const indices: number[] = [];
    for (let i = 0; i < width * height; i++)
      if (config.terrains.includes(terrain[i]) && !occupied[i]) indices.push(i);
    this._shuffle(indices, rng);

    let placed = 0;

    for (const idx of indices) {
      const x = idx % width;
      const y = (idx / width) | 0;

      const density = noise
        ? config.density * (noise.generate(x, y) + 1)
        : config.density;
      if (rng() >= density) continue;

      const stamp = config.stamps[Math.floor(rng() * config.stamps.length)];

      let fits = true;
      for (const cell of stamp.tiles) {
        const cx = x + cell.dx;
        const cy = y + cell.dy;

        if (cx < 0 || cx >= width || cy < 0 || cy >= height) {
          fits = false;
          break;
        }

        const cellIdx = gen.toIndex(cx, cy, width);

        if (!config.terrains.includes(terrain[cellIdx]) || occupied[cellIdx]) {
          fits = false;
          break;
        }
      }

      if (!fits) continue;

      for (const cell of stamp.tiles) {
        const cx = x + cell.dx;
        const cy = y + cell.dy;
        data[gen.toIndex(cx, cy, width)] = firstgid + cell.tileId;

        for (let dy = -gap; dy <= gap; dy++)
          for (let dx = -gap; dx <= gap; dx++) {
            const nx = cx + dx;
            const ny = cy + dy;
            if (nx >= 0 && ny >= 0 && nx < width && ny < height)
              occupied[ny * width + nx] = 1;
          }
      }

      placed++;
    }

    return placed;
  }

  private _shuffle(arr: number[], rng: () => number): void {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
}
