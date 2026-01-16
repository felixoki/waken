import { ComponentName, HotbarDirection, HotbarSlot } from "@server/types";
import { Component } from "./Component";
import { Player } from "../Player";
import EventBus from "../EventBus";

export class HotbarComponent extends Component {
  private slots: (HotbarSlot | null)[] = new Array(8).fill(null);
  private active: number = 0;
  private entity: Player;

  public name = ComponentName.HOTBAR;

  constructor(entity: Player, slots: (HotbarSlot | null)[]) {
    super();

    this.entity = entity;
    this.slots = slots;
  }

  attach(): void {
    this.emit();
  }

  update(): void {
    if (!this.entity.inputManager) return;

    const nav = this.entity.inputManager.getNavigation();
    if (nav) this.navigate(nav);
  }

  detach(): void {}

  emit(): void {
    EventBus.emit("hotbar:update", {
      slots: [...this.slots],
      active: this.active,
    });
  }

  navigate(direction: HotbarDirection): void {
    if (direction === HotbarDirection.PREV)
      this.active = (this.active - 1 + this.slots.length) % this.slots.length;

    if (direction === HotbarDirection.NEXT)
      this.active = (this.active + 1) % this.slots.length;

    this.emit();
  }

  get(): HotbarSlot | null {
    return this.slots[this.active];
  }

  set(slot: HotbarSlot | null | undefined): void {
    const i = this.slots.findIndex(
      (s) => s && s.type === slot?.type && s.name === slot?.name
    );

    if (i !== -1) this.active = i;

    this.emit();
  }
}
