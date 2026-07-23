import { MapName, PlayerConfig } from "../types";

export class AuthorityManager {
  private authorities = new Map<string, string>();

  key(map: MapName, partyId?: string): string {
    return partyId ? `${map}:${partyId}` : map;
  }

  room(map: MapName, partyId?: string): string {
    return `authority:${this.key(map, partyId)}`;
  }

  get(map: MapName, partyId?: string): string | undefined {
    return this.authorities.get(this.key(map, partyId));
  }

  set(map: MapName, playerId: string, partyId?: string): void {
    this.authorities.set(this.key(map, partyId), playerId);
  }

  clear(map: MapName, partyId?: string): void {
    this.authorities.delete(this.key(map, partyId));
  }

  successor(
    map: MapName,
    from: string,
    candidates: PlayerConfig[],
    partyId?: string,
  ): string | undefined {
    if (this.get(map, partyId) !== from) return undefined;

    return candidates.find((p) => p.id !== from)?.id;
  }
}
