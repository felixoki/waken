import {
  ComponentName,
  Event,
  HotbarDirection,
  Slot,
  SlotType,
} from "@server/types";
import { Component } from "./Component";
import { Player } from "../Player";
import EventBus from "../EventBus";

export class HotbarComponent extends Component {
  private slots: (Slot | null)[] = new Array(8).fill(null);
  private active: number = 0;
  private entity: Player;

  public name = ComponentName.HOTBAR;

  constructor(entity: Player, slots: (Slot | null)[]) {
    super();

    this.entity = entity;
    this.slots = slots;
  }

  attach(): void {
    EventBus.on(Event.HOTBAR_SELECT, this.select, this);
    this.emit();
  }

  update(): void {
    if (!this.entity.inputManager) return;

    const nav = this.entity.inputManager.getNavigation();
    if (nav) this.navigate(nav);
  }

  detach(): void {
    EventBus.off(Event.HOTBAR_SELECT, this.select, this);
  }

  emit(): void {
    if (!this.entity.isControllable) return;

    EventBus.emit(Event.HOTBAR_UPDATE, {
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

  select(index: number): void {
    if (!this.entity.isControllable) return;
    this.active = index;
    this.emit();
  }

  get(): Slot | null {
    return this.slots[this.active];
  }

  getActive(): number {
    return this.active;
  }

  setActive(index: number): void {
    this.active = index;
    this.emit();
  }

  getSlots(): (Slot | null)[] {
    return [...this.slots];
  }

  setSlots(slots: (Slot | null)[]): void {
    this.slots = slots;
    this.emit();
  }

  set(slot: Slot | null | undefined): void {
    if (!slot) return;

    const name = (s: Slot) =>
      s.type === SlotType.SPELL ? s.name : s.item.name;

    const i = this.slots.findIndex(
      (s) => s?.type === slot.type && name(s) === name(slot),
    );

    if (i !== -1) this.active = i;
    else this.slots[this.active] = slot;

    this.emit();
  }
}
