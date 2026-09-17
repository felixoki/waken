import { EntityName, Item } from "../types";

type Relic = { playerId?: string; durable: boolean };

export class RelicStore {
  private relics: Map<EntityName, Relic> = new Map();

  has(name: EntityName): boolean {
    return this.relics.has(name);
  }

  reserve(name: EntityName): void {
    this.relics.set(name, { durable: false });
  }

  release(name: EntityName): void {
    const relic = this.relics.get(name);
    if (relic && !relic.playerId) this.relics.delete(name);
  }

  claim(name: EntityName, playerId: string): void {
    this.relics.set(name, { playerId, durable: false });
  }

  forfeit(inventory: (Item | null)[]): void {
    for (const slot of inventory)
      if (slot && this.relics.get(slot.name)?.playerId)
        this.relics.delete(slot.name);
  }

  snapshot(isHome: (playerId: string) => boolean): [EntityName, string][] {
    const entries: [EntityName, string][] = [];

    for (const [name, relic] of this.relics) {
      if (!relic.playerId) continue;
      relic.durable ||= isHome(relic.playerId);
      if (relic.durable) entries.push([name, relic.playerId]);
    }

    return entries;
  }

  hydrate(entries: [EntityName, string][]): void {
    for (const [name, playerId] of entries)
      this.relics.set(name, { playerId, durable: true });
  }
}
