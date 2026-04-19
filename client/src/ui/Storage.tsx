import { useEffect, useRef, useState } from "react";
import { Event, Item } from "@server/types";
import EventBus from "../game/EventBus";
import { configs } from "@server/configs";
import { Icon } from "./Icon";

export function Storage() {
  const [isOpen, setIsOpen] = useState(false);
  const [id, setId] = useState<string | null>(null);
  const [slots, setSlots] = useState<(Item | null)[]>([]);
  const ref = useRef<string | null>(null);

  useEffect(() => {
    const open = (data: { entityId: string; slots: number }) => {
      ref.current = data.entityId;

      setId(data.entityId);
      setSlots(new Array(data.slots).fill(null));
      setIsOpen(true);
    };

    const sync = (data: { entityId: string; slots: (Item | null)[] }) => {
      if (data.entityId === ref.current) setSlots(data.slots);
    };

    const toggle = () => {
      if (!ref.current) return;

      EventBus.emit(Event.STORAGE_CLOSE, ref.current);
      ref.current = null;

      setId(null);
      setIsOpen(false);
    };

    EventBus.on(Event.STORAGE_OPEN, open);
    EventBus.on(Event.STORAGE_SYNC, sync);
    EventBus.on(Event.UI_TOGGLE, toggle);

    return () => {
      EventBus.off(Event.STORAGE_OPEN, open);
      EventBus.off(Event.STORAGE_SYNC, sync);
      EventBus.off(Event.UI_TOGGLE, toggle);
    };
  }, []);

  const withdraw = (item: Item) => {
    if (!id) return;
    EventBus.emit(Event.STORAGE_WITHDRAW, { entityId: id, item });
  };

  if (!isOpen) return null;

  return (
    <div className="bg-black/25 rounded-lg p-4 self-start">
      <h3 className="text-white mb-2">Chest</h3>
      <ul className="flex flex-wrap gap-1 max-w-135">
        {slots.map((item, i) => (
          <li key={i}>
            <button
              title={
                configs.entities[item?.name!]?.metadata?.description ||
                item?.name ||
                ""
              }
              className="relative flex items-center justify-center rounded-lg text-xs w-16 aspect-square bg-gray-200"
              onClick={() => item && withdraw(item)}
            >
              {item
                ? configs.entities[item.name]?.metadata?.icon
                  ? <Icon icon={configs.entities[item.name]!.metadata!.icon!} />
                  : configs.entities[item.name]?.metadata?.displayName || item.name
                : ""}
              {item && (
                <span className="absolute bottom-1 right-1">
                  {item.quantity}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
