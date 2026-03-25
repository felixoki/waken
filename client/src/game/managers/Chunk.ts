import { CHUNK_PIXEL_SIZE, CHUNK_ACTIVATION_RADIUS } from "@server/globals";
import { MapName } from "@server/types";

export class ChunkManager {
  private active = new Set<string>();
  private lastKeys = "";

  updateFromPlayer(map: MapName, x: number, y: number): boolean {
    return this.updateFromPositions([{ map, x, y }]);
  }

  updateFromPositions(
    positions: { map: MapName; x: number; y: number }[],
  ): boolean {
    const keys = positions
      .map((p) => {
        const cx = Math.floor(p.x / CHUNK_PIXEL_SIZE);
        const cy = Math.floor(p.y / CHUNK_PIXEL_SIZE);
        return `${p.map}:${cx}:${cy}`;
      })
      .sort()
      .join("|");

    if (keys === this.lastKeys) return false;
    this.lastKeys = keys;

    this.active.clear();
    const r = CHUNK_ACTIVATION_RADIUS;

    for (const p of positions) {
      const cx = Math.floor(p.x / CHUNK_PIXEL_SIZE);
      const cy = Math.floor(p.y / CHUNK_PIXEL_SIZE);

      for (let dy = -r; dy <= r; dy++)
        for (let dx = -r; dx <= r; dx++)
          this.active.add(`${p.map}:${cx + dx}:${cy + dy}`);
    }

    return true;
  }

  isActive(map: MapName, x: number, y: number): boolean {
    const cx = Math.floor(x / CHUNK_PIXEL_SIZE);
    const cy = Math.floor(y / CHUNK_PIXEL_SIZE);

    return this.active.has(`${map}:${cx}:${cy}`);
  }
}
