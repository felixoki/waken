import { handlers } from "../../handlers";
import { GridDimensions, TerrainName } from "../../types/generation";

const TILES = [
  [180, 181],
  [197, 198],
  [214, 215],
];

export class StairGenerator {
  private width: number;
  private height: number;
  private tiles: number[][];

  constructor(dimensions: GridDimensions, tiles: number[][] = TILES) {
    this.width = dimensions.width;
    this.height = dimensions.height;
    this.tiles = tiles;
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
    const rows = this.tiles.length;
    const columns = this.tiles[0].length;

    if (
      lx - 1 < 0 ||
      lx + columns >= this.width ||
      ly - 1 < 0 ||
      ly + rows - 1 >= this.height
    )
      return false;

    const at = (x: number, y: number) =>
      terrain[handlers.generation.toIndex(x, y, this.width)];

    for (let x = lx - 1; x <= lx + columns; x++) {
      if (at(x, ly - 1) !== TerrainName.FLOOR) return false;
      if (at(x, ly) !== TerrainName.RECESSED) return false;
    }

    for (let dy = 1; dy < rows; dy++)
      for (let dx = 0; dx < columns; dx++)
        if (at(lx + dx, ly + dy) !== TerrainName.RECESSED) return false;

    return true;
  }

  private _stamp(
    data: number[],
    ledges: number[],
    firstgid: number,
    lx: number,
    ly: number,
  ): void {
    for (let dy = 0; dy < this.tiles.length; dy++)
      for (let dx = 0; dx < this.tiles[dy].length; dx++) {
        const i = handlers.generation.toIndex(lx + dx, ly + dy, this.width);

        data[i] = firstgid + this.tiles[dy][dx];
        ledges[i] = 0;
      }
  }
}
