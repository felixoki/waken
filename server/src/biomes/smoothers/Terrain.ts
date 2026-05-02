import { DIRECTIONS, DIRECTIONS_CARDINAL } from "../../globals";
import { handlers } from "../../handlers";
import { GridDimensions, TerrainName } from "../../types/generation";

export class TerrainSmoother {
  private width: number;
  private height: number;

  constructor(dimensions: GridDimensions) {
    this.width = dimensions.width;
    this.height = dimensions.height;
  }

  smooth(
    terrain: TerrainName[],
    iterations: number = 2,
    threshold: number = 4,
    mode: "all" | "cardinal" = "all",
  ): TerrainName[] {
    const directions = mode === "cardinal" ? DIRECTIONS_CARDINAL : DIRECTIONS;
    let result = [...terrain];

    for (let pass = 0; pass < iterations; pass++) {
      const updated = [...result];

      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const index = handlers.generation.toIndex(x, y, this.width);
          const current = result[index];

          const neighbors = new Map<TerrainName, number>();

          handlers.generation.forEachNeighbor(
            x,
            y,
            this.width,
            this.height,
            directions,
            (_nx, _ny, neighborIndex) => {
              const neighbor = result[neighborIndex];
              neighbors.set(neighbor, (neighbors.get(neighbor) ?? 0) + 1);
            },
          );

          let max = { terrain: current, count: 0 };

          for (const [terrain, count] of neighbors)
            if (count > max.count) {
              max.count = count;
              max.terrain = terrain;
            }

          const sameCount = neighbors.get(current) ?? 0;

          if (sameCount < threshold && max.count > sameCount)
            updated[index] = max.terrain;
        }
      }

      result = updated;
    }

    return handlers.generation.removeProtrusions(
      result,
      this.width,
      this.height,
    );
  }
}
