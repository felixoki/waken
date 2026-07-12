import { useEffect, useState } from "react";
import { EntityName, Event, Item as ItemInterface, seeds } from "@server/types";
import EventBus from "../game/EventBus";
import { Item } from "./Item";

export function Seeds() {
  const [items, setItems] = useState<(ItemInterface | null)[]>([]);
  const [active, setActive] = useState<EntityName | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const sync = (next: (ItemInterface | null)[]) => setItems(next);
    const toggle = () => setIsOpen((prev) => !prev);

    EventBus.on(Event.INVENTORY_UPDATE, sync);
    EventBus.on(Event.UI_TOGGLE, toggle);

    return () => {
      EventBus.off(Event.INVENTORY_UPDATE, sync);
      EventBus.off(Event.UI_TOGGLE, toggle);
    };
  }, []);

  const counts = new Map<EntityName, number>();

  for (const item of items)
    if (item && seeds[item.name])
      counts.set(item.name, (counts.get(item.name) ?? 0) + item.quantity);
  
  const available = [...counts.entries()];

  useEffect(() => {
    if (active && !counts.has(active)) {
      setActive(null);
      EventBus.emit(Event.SEEDS_SELECT, null);
    }
  });

  if (!isOpen) return null;

  const pick = (seed: EntityName) => {
    const next = seed === active ? null : seed;

    setActive(next);
    EventBus.emit(Event.SEEDS_SELECT, next);
  };

  return (
    <div className="flex flex-col gap-2 bg-black/25 rounded-lg p-4">
      <h3 className="text-white">Seeds</h3>
      <ul className="flex gap-1">
        {available.map(([seed, quantity]) => (
          <Item
            key={seed}
            name={seed}
            quantity={quantity}
            onClick={() => pick(seed)}
            active={seed === active}
          />
        ))}
        {!available.length && (
          <li className="text-white text-sm">No seeds available</li>
        )}
      </ul>
    </div>
  );
}
