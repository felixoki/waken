import { useEffect, useState } from "react";
import { Item } from "@server/types";
import EventBus from "../game/EventBus";

export function Inventory() {
  const [items, setItems] = useState<(Item | null)[]>(
    Array(20).fill(null),
  );

  useEffect(() => {
    const add = (items: (Item | null)[]) => {
      setItems(items);
    };

    EventBus.on("inventory:update", add);

    return () => {
      EventBus.off("inventory:update", add);
    };
  }, []);

  return (
    <>
      <h3 className="text-white mb-3">Inventory</h3>
      <ul className="flex flex-wrap gap-1">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-center justify-center border border-slate-500 rounded-lg text-xs text-white w-16 aspect-square"
          >
            {item?.quantity} {item?.name}
          </li>
        ))}
      </ul>
    </>
  );
}
