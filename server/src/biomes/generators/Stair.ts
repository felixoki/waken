import { handlers } from "../../handlers";
import { GridDimensions, TerrainName } from "../../types/generation";

const FLOOR_L = 180;
const FLOOR_R = 181;
const STAIR_L = 197;
const STAIR_R = 198;
const SHADOW_L = 214;
const SHADOW_R = 215;

export class StairGenerator {
  private width: number;
  private height: number;

  constructor(dimensions: GridDimensions) {
    this.width = dimensions.width;
    this.height = dimensions.height;
  }

  generate(
    terrain: TerrainName[],
    firstgid: number,
    seed: string,
    ledges: number[],
  ): number[] {
    const data = new Array(this.width * this.height).fill(0);

    const hash = handlers.generation.hash(`${seed}-stairs`);
    const rng = handlers.generation.seededRandom(hash);

    for (const blob of this._blobs(terrain)) {
      const anchors: number[][] = [];

      for (const idx of blob) {
        const x = idx % this.width;
        const y = Math.floor(idx / this.width);

        if (this._valid(terrain, x, y)) anchors.push([x, y]);
      }

      if (anchors.length === 0) continue;

      const [lx, ly] = anchors[Math.floor(rng() * anchors.length)];

      this._stamp(data, ledges, firstgid, lx, ly);
    }

    return data;
  }

  private _blobs(terrain: TerrainName[]): number[][] {
    const seen = new Uint8Array(this.width * this.height);
    const blobs: number[][] = [];

    for (let y = 0; y < this.height; y++)
      for (let x = 0; x < this.width; x++) {
        const start = handlers.generation.toIndex(x, y, this.width);

        if (seen[start] || terrain[start] !== TerrainName.RECESSED) continue;

        const cells: number[] = [];
        const queue = [start];
        seen[start] = 1;

        for (let i = 0; i < queue.length; i++) {
          const idx = queue[i];
          cells.push(idx);

          const cx = idx % this.width;
          const cy = Math.floor(idx / this.width);

          const neighbors = [
            [cx, cy - 1],
            [cx, cy + 1],
            [cx - 1, cy],
            [cx + 1, cy],
          ];

          for (const [nx, ny] of neighbors) {
            if (nx < 0 || nx >= this.width || ny < 0 || ny >= this.height)
              continue;

            const ni = handlers.generation.toIndex(nx, ny, this.width);

            if (seen[ni] || terrain[ni] !== TerrainName.RECESSED) continue;

            seen[ni] = 1;
            queue.push(ni);
          }
        }

        blobs.push(cells);
      }

    return blobs;
  }

  private _valid(terrain: TerrainName[], lx: number, ly: number): boolean {
    if (lx - 1 < 0 || lx + 2 >= this.width || ly - 1 < 0 || ly + 2 >= this.height)
      return false;

    const at = (x: number, y: number) =>
      terrain[handlers.generation.toIndex(x, y, this.width)];

    return (
      at(lx - 1, ly - 1) === TerrainName.FLOOR &&
      at(lx - 1, ly) === TerrainName.RECESSED &&
      at(lx + 2, ly - 1) === TerrainName.FLOOR &&
      at(lx + 2, ly) === TerrainName.RECESSED &&
      at(lx, ly - 1) === TerrainName.FLOOR &&
      at(lx + 1, ly - 1) === TerrainName.FLOOR &&
      at(lx, ly) === TerrainName.RECESSED &&
      at(lx + 1, ly) === TerrainName.RECESSED &&
      at(lx, ly + 1) === TerrainName.RECESSED &&
      at(lx + 1, ly + 1) === TerrainName.RECESSED &&
      at(lx, ly + 2) === TerrainName.RECESSED &&
      at(lx + 1, ly + 2) === TerrainName.RECESSED
    );
  }

  private _stamp(
    data: number[],
    ledges: number[],
    firstgid: number,
    lx: number,
    ly: number,
  ): void {
    const set = (x: number, y: number, tile: number) => {
      data[handlers.generation.toIndex(x, y, this.width)] = firstgid + tile;
    };

    set(lx, ly, FLOOR_L);
    set(lx + 1, ly, FLOOR_R);
    set(lx, ly + 1, STAIR_L);
    set(lx + 1, ly + 1, STAIR_R);
    set(lx, ly + 2, SHADOW_L);
    set(lx + 1, ly + 2, SHADOW_R);

    for (let dy = 0; dy <= 2; dy++) {
      ledges[handlers.generation.toIndex(lx, ly + dy, this.width)] = 0;
      ledges[handlers.generation.toIndex(lx + 1, ly + dy, this.width)] = 0;
    }
  }
}
