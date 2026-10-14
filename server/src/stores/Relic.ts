import { EntityName, Item } from "../types";

type Relic = { playerId?: string; durable: boolean; spent?: boolean };

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
    if (relic && !relic.playerId && !relic.spent) this.relics.delete(name);
  }

  spend(name: EntityName): void {
    this.relics.set(name, { durable: true, spent: true });
  }

  claim(name: EntityName, playerId: string): void {
    this.relics.set(name, { playerId, durable: false });
  }

  forfeit(inventory: (Item | null)[]): void {
    for (const slot of inventory)
      if (slot && this.relics.get(slot.name)?.playerId)
        this.relics.delete(slot.name);
  }

  snapshot(
    isHome: (playerId: string) => boolean,
  ): [EntityName, string | null][] {
    const entries: [EntityName, string | null][] = [];

    for (const [name, relic] of this.relics) {
      if (relic.spent) {
        entries.push([name, null]);
        continue;
      }
      if (!relic.playerId) continue;
      relic.durable ||= isHome(relic.playerId);
      if (relic.durable) entries.push([name, relic.playerId]);
    }

    return entries;
  }

  hydrate(entries: [EntityName, string | null][]): void {
    for (const [name, playerId] of entries)
      this.relics.set(
        name,
        playerId
          ? { playerId, durable: true }
          : { durable: true, spent: true },
      );
  }
}
