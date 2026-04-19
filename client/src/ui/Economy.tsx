import { useEffect, useState } from "react";
import EventBus from "../game/EventBus";
import { EconomySnapshot, EntityName, Event } from "@server/types";
import { configs } from "@server/configs";
import { Icon } from "./Icon";

export function Economy() {
  const [needs, setNeeds] = useState<EconomySnapshot>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = (data: EconomySnapshot) => setNeeds(data);
    const toggle = () => setIsOpen((prev) => !prev);

    EventBus.on(Event.ECONOMY_UPDATE, handler);
    EventBus.on(Event.UI_TOGGLE, toggle);

    return () => {
      EventBus.off(Event.ECONOMY_UPDATE, handler);
      EventBus.off(Event.UI_TOGGLE, toggle);
    };
  }, []);

  if (!isOpen || !needs.length) return null;

  return (
    <div className="fixed bottom-4 right-4 p-4 flex flex-col gap-2 max-w-135 bg-black/10 rounded-lg">
      <h3 className="text-white">Economy</h3>
      {needs.map((need, i) => (
        <ul key={i} className="flex flex-wrap gap-1">
          {need.items.map((entry, j) => (
            <Item key={j} name={entry.item} quantity={entry.quantity} />
          ))}
        </ul>
      ))}
    </div>
  );
}

function Item({ name, quantity }: { name: EntityName; quantity: number }) {
  const config = name ? configs.entities[name] : null;

  return (
    <li>
      <button
        title={config?.metadata?.description || name || ""}
        className="relative flex items-center justify-center rounded-lg text-xs w-16 aspect-square bg-gray-200"
      >
        {config?.metadata?.icon ? (
          <Icon icon={config.metadata.icon} />
        ) : (
          config?.metadata?.displayName || name || ""
        )}
        <span className="absolute bottom-1 right-1">{quantity}</span>
      </button>
    </li>
  );
}
