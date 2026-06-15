import { MapName, PlayerConfig } from "../types";

export class AuthorityManager {
  private authorities = new Map<string, string>();

  private _key(map: MapName, partyId?: string): string {
    return partyId ? `${map}:${partyId}` : map;
  }

  get(map: MapName, partyId?: string): string | undefined {
    return this.authorities.get(this._key(map, partyId));
  }

  set(map: MapName, playerId: string, partyId?: string): void {
    this.authorities.set(this._key(map, partyId), playerId);
  }

  clear(map: MapName, partyId?: string): void {
    this.authorities.delete(this._key(map, partyId));
  }

  transfer(
    map: MapName,
    from: string,
    candidates: PlayerConfig[],
    partyId?: string,
  ): string | undefined {
    const k = this._key(map, partyId);
    if (this.authorities.get(k) !== from) return undefined;

    const next = candidates.find((p) => p.id !== from);

    if (next) {
      this.authorities.set(k, next.id);
      return next.id;
    }

    this.authorities.delete(k);
    return undefined;
  }
}
