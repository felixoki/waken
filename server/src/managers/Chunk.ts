import { CHUNK_ACTIVATION_RADIUS, CHUNK_PIXEL_SIZE } from "../globals";
import { ChunkKey, MapName } from "../types";

export class ChunkManager {
  private entitiesInChunk = new Map<ChunkKey, Set<string>>();
  private playersInChunk = new Map<string, Set<ChunkKey>>();
  private chunkByEntity = new Map<string, ChunkKey>();

  static toChunkKey(
    map: MapName,
    x: number,
    y: number,
    partyId?: string,
  ): ChunkKey {
    const cx = Math.floor(x / CHUNK_PIXEL_SIZE);
    const cy = Math.floor(y / CHUNK_PIXEL_SIZE);
    const prefix = map === MapName.REALM && partyId ? `realm:${partyId}` : map;
    return `${prefix}:${cx}:${cy}`;
  }

  registerEntity(
    id: string,
    map: MapName,
    x: number,
    y: number,
    partyId?: string,
  ): void {
    const key = ChunkManager.toChunkKey(map, x, y, partyId);
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
    const next = ChunkManager.toChunkKey(map, x, y, partyId);
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
    const prefix = map === MapName.REALM && partyId ? `realm:${partyId}` : map;

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

    return { activated, deactivated };
  }

  clearPlayer(id: string): ChunkKey[] {
    const chunks = this.playersInChunk.get(id);
    this.playersInChunk.delete(id);

    return chunks ? [...chunks] : [];
  }

  isChunkActive(key: ChunkKey): boolean {
    for (const chunks of this.playersInChunk.values())
      if (chunks.has(key)) return true;

    return false;
  }

  getActiveChunks(): Set<ChunkKey> {
    const all = new Set<ChunkKey>();

    for (const chunks of this.playersInChunk.values())
      for (const key of chunks) all.add(key);

    return all;
  }
}
