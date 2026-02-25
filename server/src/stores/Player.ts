import { MapName, PlayerConfig } from "../types/index.js";

export class PlayerStore {
  private players: Map<string, PlayerConfig> = new Map();

  add(id: string, config: PlayerConfig): void {
    this.players.set(id, config);
  }

  get(id: string): PlayerConfig | undefined {
    return this.players.get(id);
  }

  remove(id: string): void {
    this.players.delete(id);
  }

  update(id: string, updates: Partial<PlayerConfig>): void {
    const player = this.players.get(id);
    if (player) Object.assign(player, updates);
  }

  get all(): PlayerConfig[] {
    return [...this.players.values()];
  }

  getByMap(map: MapName): PlayerConfig[] {
    return [...this.players.values()].filter((player) => player.map === map);
  }

  getBySocketId(id: string): PlayerConfig | undefined {
    return [...this.players.values()].find((player) => player.socketId === id);
  }
}
