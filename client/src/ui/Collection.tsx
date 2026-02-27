import { Item } from "@server/types";
import { useEffect, useState } from "react";
import EventBus from "../game/EventBus";
import { definitions } from "@server/definitions";

export const Collection = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const give = (item: Item) => {
    const updated = items.filter((i) => i.name !== item.name);

    setItems(updated);
    EventBus.emit("item:collect", item);
  };

  const close = () => {
    setItems([]);
    setIsOpen(false);
  };

  useEffect(() => {
    const handler = (data: { items: Item[] }) => {
      setItems(data.items);
      setIsOpen(true);
    };

    EventBus.on("entity:collection:open", handler);

    return () => {
      EventBus.off("entity:collection:open", handler);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="flex flex-col gap-3 max-w-135 relative">
      <ul className="flex gap-2 text-white">
        {items.length &&
          items.map((item) => (
            <li
              key={item.name}
              className="flex flex-col items-center justify-center text-center rounded-lg text-xs w-16 aspect-square text-slate-900 bg-gray-200"
            >
              {definitions[item.name]?.metadata?.displayName}{" "}
              <button
                onClick={() => give(item)}
                className="rounded bg-gray-300 px-2 py-1 hover:bg-gray-400"
              >
                Give
              </button>
            </li>
          ))}
      </ul>
      <button
        onClick={close}
        className="rounded bg-gray-300 px-2 py-1 hover:bg-gray-400 self-start"
      >
        Close
      </button>
    </div>
  );
};
