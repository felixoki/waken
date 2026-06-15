import { configs } from "../configs";
import { CHUNK_ACTIVATION_RADIUS, CHUNK_PIXEL_SIZE } from "../globals";
import { ChunkKey, MapName } from "../types";

export class ChunkManager {
  private entitiesInChunk = new Map<ChunkKey, Set<string>>();
  private playersInChunk = new Map<string, Set<ChunkKey>>();
  private chunkByEntity = new Map<string, ChunkKey>();
  private chunkRefCount = new Map<ChunkKey, number>();

  toChunkKey(map: MapName, x: number, y: number, partyId?: string): ChunkKey {
    const cx = Math.floor(x / CHUNK_PIXEL_SIZE);
    const cy = Math.floor(y / CHUNK_PIXEL_SIZE);
    const prefix =
      configs.maps[map].isInstanced && partyId ? `${map}:${partyId}` : map;
    return `${prefix}:${cx}:${cy}`;
  }

  registerEntity(
    id: string,
    map: MapName,
    x: number,
    y: number,
    partyId?: string,
  ): void {
    const key = this.toChunkKey(map, x, y, partyId);
    this.chunkByEntity.set(id, key);

    if (!this.entitiesInChunk.has(key))
      this.entitiesInChunk.set(key, new Set());

    this.entitiesInChunk.get(key)!.add(id);
  }

  removeEntity(id: string): void {
    const key = this.chunkByEntity.get(id);
    if (!key) return;

    this.entitiesInChunk.get(key)?.delete(id);
    this.chunkByEntity.delete(id);
  }

  moveEntity(
    id: string,
    map: MapName,
    x: number,
    y: number,
    partyId?: string,
  ): boolean {
    const prev = this.chunkByEntity.get(id);

    if (!partyId && prev) {
      const parts = prev.split(":");
      
      if (parts.length === 4 && configs.maps[parts[0] as MapName]?.isInstanced)
        partyId = parts[1];
    }

    const next = this.toChunkKey(map, x, y, partyId);
    if (prev === next) return false;

    this.entitiesInChunk.get(prev!)?.delete(id);

    if (!this.entitiesInChunk.has(next))
      this.entitiesInChunk.set(next, new Set());

    this.entitiesInChunk.get(next)!.add(id);
    this.chunkByEntity.set(id, next);

    return true;
  }

  getChunkByEntity(id: string): ChunkKey | undefined {
    return this.chunkByEntity.get(id);
  }

  getEntitiesInChunk(keys: ChunkKey[]): string[] {
    return keys.flatMap((key) => [...(this.entitiesInChunk.get(key) ?? [])]);
  }

  updatePlayerChunks(
    playerId: string,
    map: MapName,
    x: number,
    y: number,
    partyId?: string,
  ): { activated: ChunkKey[]; deactivated: ChunkKey[] } {
    const cx = Math.floor(x / CHUNK_PIXEL_SIZE);
    const cy = Math.floor(y / CHUNK_PIXEL_SIZE);
    const prefix =
      configs.maps[map].isInstanced && partyId ? `${map}:${partyId}` : map;

    const next = new Set<ChunkKey>();

    for (let dx = -CHUNK_ACTIVATION_RADIUS; dx <= CHUNK_ACTIVATION_RADIUS; dx++)
      for (
        let dy = -CHUNK_ACTIVATION_RADIUS;
        dy <= CHUNK_ACTIVATION_RADIUS;
        dy++
      )
        next.add(`${prefix}:${cx + dx}:${cy + dy}`);

    const prev = this.playersInChunk.get(playerId) ?? new Set();
    this.playersInChunk.set(playerId, next);

    const activated = [...next].filter((key) => !prev.has(key));
    const deactivated = [...prev].filter((key) => !next.has(key));

    for (const key of activated)
      this.chunkRefCount.set(key, (this.chunkRefCount.get(key) ?? 0) + 1);

    for (const key of deactivated) {
      const count = (this.chunkRefCount.get(key) ?? 1) - 1;

      if (count <= 0) this.chunkRefCount.delete(key);
      else this.chunkRefCount.set(key, count);
    }

    return { activated, deactivated };
  }

  clearPlayer(id: string): ChunkKey[] {
    const chunks = this.playersInChunk.get(id);
    this.playersInChunk.delete(id);

    if (chunks)
      for (const key of chunks) {
        const count = (this.chunkRefCount.get(key) ?? 1) - 1;

        if (count <= 0) this.chunkRefCount.delete(key);
        else this.chunkRefCount.set(key, count);
      }

    return chunks ? [...chunks] : [];
  }

  isChunkActive(key: ChunkKey): boolean {
    return (this.chunkRefCount.get(key) ?? 0) > 0;
  }

  getEntitiesByPrefix(prefix: string): string[] {
    const result: string[] = [];

    for (const [key, ids] of this.entitiesInChunk)
      if (key.startsWith(prefix)) result.push(...ids);

    return result;
  }
}
