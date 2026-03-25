import { CHUNK_PIXEL_SIZE, CHUNK_ACTIVATION_RADIUS } from "@server/globals";
import { MapName } from "@server/types";

export class ChunkManager {
  private active = new Set<string>();
  private lastKey = "";

  updateFromPlayer(map: MapName, x: number, y: number): void {
    const cx = Math.floor(x / CHUNK_PIXEL_SIZE);
    const cy = Math.floor(y / CHUNK_PIXEL_SIZE);
    const key = `${map}:${cx}:${cy}`;
    
    if (key === this.lastKey) return;
    this.lastKey = key;

    this.active.clear();
    const r = CHUNK_ACTIVATION_RADIUS;

    for (let dy = -r; dy <= r; dy++)
      for (let dx = -r; dx <= r; dx++)
        this.active.add(`${map}:${cx + dx}:${cy + dy}`);
  }

  isActive(map: MapName, x: number, y: number): boolean {
    const cx = Math.floor(x / CHUNK_PIXEL_SIZE);
    const cy = Math.floor(y / CHUNK_PIXEL_SIZE);
    
    return this.active.has(`${map}:${cx}:${cy}`);
  }
}