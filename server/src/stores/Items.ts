import { EntityName } from "../types";

export class ItemsStore {
  private items: Map<EntityName, number> = new Map();

  get(name: EntityName): number {
    return this.items.get(name) || 0;
  }

  getAll(): Map<EntityName, number> {
    return this.items;
  }

  add(name: EntityName, quantity: number): void {
    const current = this.items.get(name) || 0;
    this.items.set(name, current + quantity);
  }

  remove(name: EntityName, quantity: number): boolean {
    const current = this.items.get(name) || 0;
    if (current <= quantity) return false;

    const remaining = current - quantity;
    if (current === 0) {
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
}
