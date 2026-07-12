import {
  EntityName,
  Event,
  Slot,
  SlotType,
  SlotZone,
  SpellName,
} from "@server/types";
import { useEffect, useState } from "react";
import EventBus from "../game/EventBus";
import { Item } from "./Item";
import type { DragData } from "./Provider";

function slotName(slot: Slot | null): EntityName | SpellName | null {
  if (!slot) return null;
  return slot.type === SlotType.SPELL ? slot.name : slot.item.name;
}

function slotQuantity(slot: Slot | null): number | undefined {
  if (!slot || slot.type === SlotType.SPELL) return undefined;
  return slot.item.quantity;
}

export function Hotbar() {
  const [slots, setSlots] = useState<(Slot | null)[]>(() =>
    Array(8).fill(null),
  );
  const [active, setActive] = useState(0);

  useEffect(() => {
    const handler = (state: { slots: (Slot | null)[]; active: number }) => {
      setSlots(state.slots);
      setActive(state.active);
    };

    EventBus.on(Event.HOTBAR_UPDATE, handler);

    return () => {
      EventBus.off(Event.HOTBAR_UPDATE, handler);
    };
  }, []);

  return (
    <ul className="flex flex-wrap gap-1">
      {slots.map((slot, i) => {
        const name = slotName(slot);
        const data: DragData = {
          zone: SlotZone.HOTBAR,
          index: i,
          name: name!,
          hotbarSlot: slot,
        };
        return (
          <Item
            key={i}
            name={name}
            quantity={slotQuantity(slot)}
            active={i === active}
            dragId={name ? `hotbar-${i}` : undefined}
            dropId={`hotbar-${i}`}
            dragData={name ? data : undefined}
            onClick={() => EventBus.emit(Event.HOTBAR_SELECT, i)}
          />
        );
      })}
    </ul>
  );
}
