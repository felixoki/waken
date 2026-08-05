import { useEffect, useState } from "react";
import { EntityName, Event } from "@server/types";
import { BuildableConfig } from "@server/types/build";
import { configs } from "@server/configs";
import EventBus from "../game/EventBus";
import { Item } from "./Item";

export function Build() {
  const [active, setActive] = useState<EntityName | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const toggle = () => setIsOpen((prev) => !prev);
    const transform = (active: boolean) => {
      if (active) setIsOpen(false);
    };

    EventBus.on(Event.UI_TOGGLE, toggle);
    EventBus.on(Event.TRANSFORM_TOGGLE, transform);

    return () => {
      EventBus.off(Event.UI_TOGGLE, toggle);
      EventBus.off(Event.TRANSFORM_TOGGLE, transform);
    };
  }, []);

  if (!isOpen) return null;

  const entries = Object.entries(configs.buildable) as [
    EntityName,
    BuildableConfig,
  ][];

  const pick = (name: EntityName) => {
    const next = name === active ? null : name;

    setActive(next);
    EventBus.emit(Event.BUILD_SELECT, next);
  };

  return (
    <div className="flex flex-col gap-2 bg-black/25 rounded-lg p-4">
      <h3 className="text-white">Build</h3>
      <ul className="flex gap-1">
        {entries.map(([name, config]) => (
          <Item
            key={name}
            name={name}
            recipe={config.cost}
            onClick={() => pick(name)}
            active={name === active}
          />
        ))}
        {!entries.length && (
          <li className="text-white text-sm">No pieces available</li>
        )}
      </ul>
    </div>
  );
}
