import { ComponentName, EntityName, Event, Item } from "@server/types";
import { Component } from "./Component";
import EventBus from "../EventBus";
import { configs } from "@server/configs";
import { MAX_STACK } from "@server/globals";

export class InventoryComponent extends Component {
  private items: (Item | null)[] = new Array(20).fill(null);

  public name = ComponentName.INVENTORY;

  attach(): void {}
  update(): void {}
  detach(): void {}

  add(name: EntityName, quantity: number = 1, soul?: EntityName): boolean {
    const def = configs.entities[name];

    if (!def || !def.metadata) return false;

    const stackable = def.metadata.stackable || false;
    let room = 0;

    for (const item of this.items) {
      if (!item) room += stackable ? MAX_STACK : 1;
      else if (stackable && this.stacks(item, name, soul))
        room += MAX_STACK - item.quantity;
    }

    if (room < quantity) return false;

    let remaining = quantity;

    if (stackable)
      for (const item of this.items) {
        if (!item || !this.stacks(item, name, soul)) continue;
        const added = Math.min(MAX_STACK - item.quantity, remaining);

        item.quantity += added;
        remaining -= added;
        if (remaining === 0) break;
      }

    if (remaining > 0) {
      const empty = this.items.findIndex((item) => item === null);
      this.items[empty] = { name, quantity: remaining, stackable, soul };
    }

    this.emit();
    return true;
  }

  private stacks(item: Item, name: EntityName, soul?: EntityName): boolean {
    return item.name === name && item.stackable && item.soul === soul;
  }

  remove(name: EntityName, quantity: number = 1): boolean {
    const index = this.items.findIndex((item) => item?.name === name);

    if (index !== -1 && this.items[index]) {
      if (this.items[index]!.quantity > quantity)
        this.items[index]!.quantity -= quantity;
      else this.items[index] = null;

      this.emit();
      return true;
    }

    return false;
  }

  get(): (Item | null)[] {
    return this.items;
  }

  set(items: (Item | null)[]): void {
    this.items = items;
    this.emit();
  }

  emit(): void {
    EventBus.emit(Event.INVENTORY_UPDATE, [...this.items]);
  }
}
