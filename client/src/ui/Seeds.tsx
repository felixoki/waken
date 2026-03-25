import { useState } from "react";
import { EntityName, seeds } from "@server/types";
import EventBus from "../game/EventBus";

const available = Object.keys(seeds) as EntityName[];

export function Seeds() {
  const [active, setActive] = useState<EntityName | null>(null);

  const pick = (seed: EntityName) => {
    const next = seed === active ? null : seed;

    setActive(next);
    EventBus.emit("seeds:select", next);
  };

  return (
    <ul className="flex gap-1">
      {available.map((seed) => (
        <li
          key={seed}
          onClick={() => pick(seed)}
          className={`flex items-center justify-center rounded-lg text-xs w-16 aspect-square bg-gray-200 hover:bg-gray-300 ${
            seed === active ? "text-blue-600" : ""
          }`}
        >
          {seed}
        </li>
      ))}
    </ul>
  );
}
