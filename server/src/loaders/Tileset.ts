import { join } from "path";
import { TileEntry, TileQuery, Tileset } from "../types/generation";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import { handlers } from "../handlers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, "..");
const TILESETS_PATH = "../../../client/public/assets/tilesets";

export class TilesetLoader {
  private cache: Map<string, Tileset> = new Map();

  load(name: string): Tileset {
    const cached = this.cache.get(name);
    if (cached) return cached;

    const path = join(__dirname, TILESETS_PATH, `${name}.json`);
    const content = readFileSync(path, "utf-8");
    const data = JSON.parse(content) as Tileset;

    this.cache.set(name, data);
    return data;
  }

  query(name: string, query: TileQuery): TileEntry[] {
    const tileset = this.load(name);
    if (!tileset.tiles) return [];

    return tileset.tiles.filter((tile) => {
      const props = handlers.generation.parseProperties(tile.properties);

      if (!props.role || props.role !== query.role) return false;
      if (query.position && props.position !== query.position) return false;
      if (query.terrain && props.terrain !== query.terrain) return false;

      return true;
    });
  }

  queryOne(name: string, query: TileQuery, seed?: number): TileEntry | null {
    const results = this.query(name, query);

    if (results.length === 0) return null;
    if (results.length === 1) return results[0];

    const index =
      seed !== undefined
        ? Math.abs(seed) % results.length
        : Math.floor(Math.random() * results.length);

    return results[index];
  }
}
