import { MapName, PlayerConfig } from "../types/index.js";

export class PlayerStore {
  private players: Map<string, PlayerConfig> = new Map();
  private bySocketId: Map<string, string> = new Map();

  add(id: string, config: PlayerConfig): void {
    this.players.set(id, config);
    if (config.socketId) this.bySocketId.set(config.socketId, id);
  }

  get(id: string): PlayerConfig | undefined {
    return this.players.get(id);
  }

  remove(id: string): void {
    const player = this.players.get(id);
    if (player?.socketId) this.bySocketId.delete(player.socketId);
    this.players.delete(id);
  }

  update(id: string, updates: Partial<PlayerConfig>): void {
    const player = this.players.get(id);
    if (!player) return;

    if (updates.socketId && updates.socketId !== player.socketId) {
      if (player.socketId) this.bySocketId.delete(player.socketId);
      
      this.bySocketId.set(updates.socketId, id);
    }

    Object.assign(player, updates);
  }

  get all(): PlayerConfig[] {
    return [...this.players.values()];
  }

  getByMap(map: MapName): PlayerConfig[] {
    return [...this.players.values()].filter((player) => player.map === map);
  }

  getOthersOnMap(id: string, map: MapName): PlayerConfig[] {
    return this.getByMap(map).filter((p) => p.id !== id);
  }

  getBySocketId(id: string): PlayerConfig | undefined {
    const playerId = this.bySocketId.get(id);
    return playerId ? this.players.get(playerId) : undefined;
  }
}
