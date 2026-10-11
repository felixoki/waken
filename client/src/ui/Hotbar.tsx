import {
  EntityName,
  Event,
  type Item as ItemType,
  Slot,
  SlotType,
  SlotZone,
  SpellName,
} from "@server/types";
import { useEffect, useState } from "react";
import EventBus from "../game/EventBus";
import { Item } from "./Item";
import type { DragData } from "./Provider";
import { HOTBAR_SIZE } from "@server/globals";

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
    Array(HOTBAR_SIZE).fill(null),
  );
  const [active, setActive] = useState(0);
  const [robe, setRobe] = useState<ItemType | null>(null);

  useEffect(() => {
    const handler = (state: { slots: (Slot | null)[]; active: number }) => {
      setSlots(state.slots);
      setActive(state.active);
    };

    EventBus.on(Event.HOTBAR_UPDATE, handler);
    EventBus.on(Event.ROBE_SYNC, setRobe);

    return () => {
      EventBus.off(Event.HOTBAR_UPDATE, handler);
      EventBus.off(Event.ROBE_SYNC, setRobe);
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
      <Item
        name={robe?.name ?? null}
        dragId={robe ? `${SlotZone.ROBE}-0` : undefined}
        dropId={`${SlotZone.ROBE}-0`}
        dragData={
          robe
            ? { zone: SlotZone.ROBE, index: 0, name: robe.name, item: robe }
            : undefined
        }
      />
    </ul>
  );
}
