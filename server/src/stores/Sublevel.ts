import { GeneratedMap } from "../types/generation";
import { MapName } from "../types";

type Return = { entranceId: string; map: MapName; x: number; y: number };

export class SublevelStore {
  private instances: Map<string, Promise<GeneratedMap | null>> = new Map();
  private members: Map<string, Set<string>> = new Map();
  private returns: Map<string, Return> = new Map();

  getInstance(entranceId: string): Promise<GeneratedMap | null> | undefined {
    return this.instances.get(entranceId);
  }

  setInstance(entranceId: string, gen: Promise<GeneratedMap | null>): void {
    this.instances.set(entranceId, gen);
    this.members.set(entranceId, new Set());
  }

  removeInstance(entranceId: string): void {
    this.instances.delete(entranceId);
    this.members.delete(entranceId);
  }

  join(entranceId: string, playerId: string): number {
    const set = this.members.get(entranceId);
    if (!set) return 0;
    set.add(playerId);
    return set.size;
  }

  leave(entranceId: string, playerId: string): number {
    const set = this.members.get(entranceId);
    if (!set) return 0;
    set.delete(playerId);
    return set.size;
  }

  occupants(entranceId: string): string[] {
    return [...(this.members.get(entranceId) ?? [])];
  }

  setReturn(playerId: string, coords: Return): void {
    this.returns.set(playerId, coords);
  }

  entranceOf(playerId: string): string | undefined {
    return this.returns.get(playerId)?.entranceId;
  }

  takeReturn(playerId: string): Return | undefined {
    const coords = this.returns.get(playerId);
    this.returns.delete(playerId);
    return coords;
  }
}