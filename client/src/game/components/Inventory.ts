import { ComponentName, EntityName, InventoryItem } from "@server/types";
import { Component } from "./Component";
import { configs } from "@server/configs";
import EventBus from "../EventBus";

export class InventoryComponent extends Component {
  private items: (InventoryItem | null)[] = new Array(20).fill(null);

  public name = ComponentName.INVENTORY;

  attach(): void {}
  update(): void {}
  detach(): void {}

  add(name: EntityName, quantity: number = 1): boolean {
    const def = configs.definitions[name];

    if (!def || !def.metadata) return false;

    if (def.metadata.stackable) {
      const existing = this.items.findIndex(
        (item) => item?.name === name && item.stackable && item.quantity < 50
      );

      if (existing !== -1) {
        this.items[existing]!.quantity += quantity;

        this.emit();
        return true;
      }
    }

    const empty = this.items.findIndex((item) => item === null);

    if (empty !== -1) {
      this.items[empty] = {
        name,
        quantity,
        stackable: def.metadata.stackable || false,
      };

      this.emit();
      return true;
    }

    return false;
  }

  get(): (InventoryItem | null)[] {
    return this.items;
  }

  set(items: (InventoryItem | null)[]): void {
    this.items = items;
    this.emit();
  }

  emit(): void {
    EventBus.emit("inventory:update", [...this.items]);
  }
}
