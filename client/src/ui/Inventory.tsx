import { useEffect, useState } from "react";
import { InventoryItem } from "@server/types";
import EventBus from "../game/EventBus";

export function Inventory() {
  const [items, setItems] = useState<(InventoryItem | null)[]>(
    Array(20).fill(null)
  );

  useEffect(() => {
    const add = (items: (InventoryItem | null)[]) => {
      setItems(items);
    };

    EventBus.on("inventory:update", add);

    return () => {
      EventBus.off("inventory:update", add);
    };
  }, []);

  return (
    <ul className="fixed top-0 right-0 flex">
      {items.map((item, i) => (
        <li key={i} className="rounded border p-2 m-1 bg-white">
          {item?.name} {item?.quantity}
        </li>
      ))}
    </ul>
  );
}
