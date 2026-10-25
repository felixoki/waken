import { EntityName } from "../types";

export class ItemsStore {
  private items: Map<EntityName, number> = new Map();

  get(name: EntityName): number {
    return this.items.get(name) || 0;
  }

  add(name: EntityName, quantity: number): void {
    const current = this.items.get(name) || 0;
    this.items.set(name, current + quantity);
  }

  remove(name: EntityName, quantity: number): boolean {
    const current = this.items.get(name) || 0;
    if (current < quantity) return false;

    const remaining = current - quantity;
    
    if (remaining === 0) {
      this.items.delete(name);
      return true;
    }

    this.items.set(name, remaining);
    return true;
  }

  has(name: EntityName, quantity: number): boolean {
    const current = this.items.get(name) || 0;
    return current >= quantity;
  }

  snapshot(): Record<string, number> {
    return Object.fromEntries(this.items);
  }

  hydrate(items: Partial<Record<EntityName, number>>): void {
    this.items = new Map(
      Object.entries(items).filter(
        (entry): entry is [EntityName, number] =>
          typeof entry[1] === "number" && entry[1] > 0,
      ),
    );
  }
}
