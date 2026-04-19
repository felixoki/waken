import { useEffect, useState } from "react";
import { EntityName, Event, seeds } from "@server/types";
import EventBus from "../game/EventBus";
import { configs } from "@server/configs";
import { Icon } from "./Icon";

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
          <Seed
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

function Seed({
  name,
  onClick,
  active,
}: {
  name: EntityName;
  onClick: () => void;
  active: boolean;
}) {
  const config = name ? configs.entities[name] : null;

  return (
    <li>
      <button
        title={config?.metadata?.description || name || ""}
        className={`relative flex items-center justify-center rounded-lg text-xs w-16 aspect-square ${
          active ? "text-blue-600 bg-blue-100" : "bg-gray-200"
        }`}
        onClick={onClick}
      >
        {config?.metadata?.icon ? (
          <Icon icon={config.metadata.icon} />
        ) : (
          config?.metadata?.displayName || name || ""
        )}
      </button>
    </li>
  );
}
