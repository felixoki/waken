import { useEffect, useRef, useState } from "react";
import { Event, Item as ItemType, SlotZone } from "@server/types";
import EventBus from "../game/EventBus";
import { Item } from "./Item";
import type { DragData } from "./Provider";

export function Storage() {
  const [isOpen, setIsOpen] = useState(false);
  const [id, setId] = useState<string | null>(null);
  const [slots, setSlots] = useState<(ItemType | null)[]>([]);
  const ref = useRef<string | null>(null);

  useEffect(() => {
    const open = (data: { entityId: string; slots: number }) => {
      ref.current = data.entityId;

      setId(data.entityId);
      setSlots(new Array(data.slots).fill(null));
      setIsOpen(true);
    };

    const sync = (data: { entityId: string; slots: (ItemType | null)[] }) => {
      if (data.entityId === ref.current) setSlots(data.slots);
    };

    const close = (entityId: string) => {
      if (entityId !== ref.current) return;

      ref.current = null;

      setId(null);
      setIsOpen(false);
    };

    const toggle = () => {
      if (ref.current) EventBus.emit(Event.STORAGE_CLOSE, ref.current);
    };

    EventBus.on(Event.STORAGE_OPEN, open);
    EventBus.on(Event.STORAGE_SYNC, sync);
    EventBus.on(Event.STORAGE_CLOSE, close);
    EventBus.on(Event.UI_TOGGLE, toggle);

    return () => {
      EventBus.off(Event.STORAGE_OPEN, open);
      EventBus.off(Event.STORAGE_SYNC, sync);
      EventBus.off(Event.STORAGE_CLOSE, close);
      EventBus.off(Event.UI_TOGGLE, toggle);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="bg-black/25 rounded-lg p-4 self-start">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-white">Chest</h3>
        <button
          className="rounded-md bg-black/25 px-2.5 py-1 text-sm text-white/80 hover:bg-white/10 hover:text-white disabled:opacity-40 disabled:hover:bg-black/25"
          disabled={!slots.some(Boolean)}
          onClick={() =>
            id && EventBus.emit(Event.STORAGE_TAKE_ALL, { entityId: id })
          }
        >
          Take all
        </button>
      </div>
      <ul className="flex flex-wrap gap-1 max-w-135">
        {slots.map((item, i) => {
          const data: DragData | undefined =
            item && id
              ? {
                  zone: SlotZone.STORAGE,
                  index: i,
                  name: item.name,
                  item,
                  entityId: id,
                }
              : undefined;
          return (
            <Item
              key={i}
              name={item?.name ?? null}
              quantity={item?.quantity}
              dragId={item && id ? `storage-${i}` : undefined}
              dropId={id ? `storage-${i}` : undefined}
              dragData={data}
            />
          );
        })}
      </ul>
    </div>
  );
}
