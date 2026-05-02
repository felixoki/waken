import { handlers } from "../../handlers";
import { TilesetLoader } from "../../loaders/Tileset";
import {
  BorderConfig,
  BorderPosition,
  GridDimensions,
  Neighbors,
  TerrainName,
  TileQuery,
  TileRole,
} from "../../types/generation";

export class BorderGenerator {
  private width: number;
  private height: number;
  private loader: TilesetLoader;

  constructor(dimensions: GridDimensions, loader: TilesetLoader) {
    this.width = dimensions.width;
    this.height = dimensions.height;
    this.loader = loader;
  }

  generate(
    terrain: TerrainName[],
    border: BorderConfig,
    firstgid: number,
  ): number[] {
    const data = new Array(this.width * this.height).fill(0);

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const index = handlers.generation.toIndex(x, y, this.width);
        const current = terrain[index];

        if (current !== border.to) continue;

        const neighbors = handlers.generation.getNeighbors(
          terrain,
          x,
          y,
          this.width,
          this.height,
          TerrainName.WATER,
        );

        const position = this.matchPosition(neighbors, border.from);
        if (!position) continue;

        const query: TileQuery = {
          role: position.role,
          position: position.position,
        };

        if (border.queryProperty === "terrain") query.terrain = border.from;
        else query.from = border.from;

        const tile = this.loader.queryOne(border.tileset, query);
        if (tile) data[index] = firstgid + tile.id;
      }
    }

    return data;
  }

  private matchPosition(
    neighbors: Neighbors<TerrainName>,
    to: TerrainName,
  ): { role: TileRole; position: BorderPosition } | null {
    const has = {
      north: neighbors.north === to,
      south: neighbors.south === to,
      east: neighbors.east === to,
      west: neighbors.west === to,
      northwest: neighbors.northwest === to,
      northeast: neighbors.northeast === to,
      southwest: neighbors.southwest === to,
      southeast: neighbors.southeast === to,
    };

    /** Inner corners */
    if (has.north && has.west && !has.east && !has.south)
      return {
        role: TileRole.BORDER_INNER,
        position: BorderPosition.TOP_LEFT,
      };

    if (has.north && has.east && !has.west && !has.south)
      return {
        role: TileRole.BORDER_INNER,
        position: BorderPosition.TOP_RIGHT,
      };

    if (has.south && has.west && !has.east && !has.north)
      return {
        role: TileRole.BORDER_INNER,
        position: BorderPosition.BOTTOM_LEFT,
      };

    if (has.south && has.east && !has.west && !has.north)
      return {
        role: TileRole.BORDER_INNER,
        position: BorderPosition.BOTTOM_RIGHT,
      };

    /** Outer edges */
    if (has.north && !has.south)
      return { role: TileRole.BORDER_OUTER, position: BorderPosition.BOTTOM };

    if (has.south && !has.north)
      return { role: TileRole.BORDER_OUTER, position: BorderPosition.TOP };

    if (has.west && !has.east)
      return { role: TileRole.BORDER_OUTER, position: BorderPosition.RIGHT };

    if (has.east && !has.west)
      return { role: TileRole.BORDER_OUTER, position: BorderPosition.LEFT };

    /** Paired diagonals → straight edge */
    if (has.northwest && has.northeast && !has.north)
      return { role: TileRole.BORDER_OUTER, position: BorderPosition.BOTTOM };

    if (has.southwest && has.southeast && !has.south)
      return { role: TileRole.BORDER_OUTER, position: BorderPosition.TOP };

    if (has.northwest && has.southwest && !has.west)
      return { role: TileRole.BORDER_OUTER, position: BorderPosition.RIGHT };

    if (has.northeast && has.southeast && !has.east)
      return { role: TileRole.BORDER_OUTER, position: BorderPosition.LEFT };

    /** Outer corners */
    if (has.northwest && !has.north && !has.west)
      return {
        role: TileRole.BORDER_OUTER,
        position: BorderPosition.BOTTOM_RIGHT,
      };

    if (has.northeast && !has.north && !has.east)
      return {
        role: TileRole.BORDER_OUTER,
        position: BorderPosition.BOTTOM_LEFT,
      };

    if (has.southwest && !has.south && !has.west)
      return {
        role: TileRole.BORDER_OUTER,
        position: BorderPosition.TOP_RIGHT,
      };

    if (has.southeast && !has.south && !has.east)
      return {
        role: TileRole.BORDER_OUTER,
        position: BorderPosition.TOP_LEFT,
      };

    return null;
  }
}
