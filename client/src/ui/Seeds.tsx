import { useEffect, useState } from "react";
import { EntityName, Event, seeds } from "@server/types";
import EventBus from "../game/EventBus";
import { Item } from "./Item";

const available = Object.keys(seeds) as EntityName[];

export function Seeds() {
  const [active, setActive] = useState<EntityName | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const toggle = () => setIsOpen((prev) => !prev);

    EventBus.on(Event.UI_TOGGLE, toggle);

    return () => {
      EventBus.off(Event.UI_TOGGLE, toggle);
    };
  }, []);

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
        {available.map((seed) => (
          <Item
            key={seed}
            name={seed}
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
