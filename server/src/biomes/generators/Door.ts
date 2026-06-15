import { DoorAnchor, GridDimensions } from "../../types/generation";

const NORTH = [
  [301, 309, 431, 432, 309, 299],
  [318, 326, 448, 449, 326, 316],
  [335, 341, 465, 466, 343, 333],
];

const SOUTH = [
  [372, 309, 431, 432, 309, 371],
  [389, 326, 448, 449, 326, 388],
  [406, 343, 465, 466, 343, 405],
];

export class DoorGenerator {
  private width: number;
  private height: number;

  constructor(dimensions: GridDimensions) {
    this.width = dimensions.width;
    this.height = dimensions.height;
  }

  generate(
    doors: DoorAnchor[],
    firstgid: number,
  ): { below: number[]; above: number[] } {
    const below = new Array(this.width * this.height).fill(0);
    const above = new Array(this.width * this.height).fill(0);

    for (const door of doors) this._stamp(below, above, firstgid, door);

    return { below, above };
  }

  private _stamp(
    below: number[],
    above: number[],
    firstgid: number,
    door: DoorAnchor,
  ) {
    const grid = door.dir === "north" ? NORTH : SOUTH;

    const left = door.x - 2;

    const top = door.dir === "north" ? door.y - 3 : door.y + 1;

    for (let dy = 0; dy < grid.length; dy++)
      for (let dx = 0; dx < grid[dy].length; dx++) {
        const px = left + dx;
        const py = top + dy;

        if (px < 0 || px >= this.width || py < 0 || py >= this.height) continue;

        const target = dy === 0 ? above : below;

        target[py * this.width + px] = firstgid + grid[dy][dx];
      }
  }
}
