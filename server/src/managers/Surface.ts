import { MapName, SurfaceName, TiledMap } from "../types/index.js";
import { configs } from "../configs/index.js";
import { MapLoader } from "../loaders/Map.js";

interface SurfaceGrid {
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  cells: Uint8Array;
}

const SURFACES = Object.values(SurfaceName);
const GRASS = SURFACES.indexOf(SurfaceName.GRASS) + 1;

export class SurfaceManager {
  private grids = new Map<string, SurfaceGrid | null>();

  register(map: MapName, tiled: TiledMap, instance?: string): void {
    this.grids.set(instance ? `${map}:${instance}` : map, this._parse(tiled));
  }

  release(instance: string, map?: MapName): void {
    if (map) {
      this.grids.delete(`${map}:${instance}`);
      return;
    }

    for (const key of this.grids.keys())
      if (key.endsWith(`:${instance}`)) this.grids.delete(key);
  }

  at(
    map: MapName,
    x: number,
    y: number,
    instance?: string,
  ): SurfaceName | undefined {
    const grid = instance
      ? this.grids.get(`${map}:${instance}`)
      : this._grid(map);
    if (!grid) return undefined;

    const tx = Math.floor(x / grid.tilewidth);
    const ty = Math.floor(y / grid.tileheight);

    if (tx < 0 || ty < 0 || tx >= grid.width || ty >= grid.height)
      return undefined;

    const code = grid.cells[ty * grid.width + tx];
    return code ? SURFACES[code - 1] : undefined;
  }

  private _grid(map: MapName): SurfaceGrid | null {
    const cached = this.grids.get(map);
    if (cached !== undefined) return cached;

    const json = configs.maps[map]?.json;
    const grid = json ? this._parse(new MapLoader().load(json)) : null;

    this.grids.set(map, grid);
    return grid;
  }

  private _parse(tiled: TiledMap): SurfaceGrid | null {
    let cells: Uint8Array | null = null;

    for (const layer of tiled.layers) {
      const value = layer.properties?.find((p) => p.name === "surface")?.value;
      const code = SURFACES.indexOf(value) + 1;

      if (!code || !layer.data) continue;

      cells ??= new Uint8Array(tiled.width * tiled.height);

      for (let i = 0; i < layer.data.length; i++) {
        if (!layer.data[i]) continue;
        if (code === GRASS && cells[i]) continue;

        cells[i] = code;
      }
    }

    if (!cells) return null;

    return {
      width: tiled.width,
      height: tiled.height,
      tilewidth: tiled.tilewidth,
      tileheight: tiled.tileheight,
      cells,
    };
  }
}
