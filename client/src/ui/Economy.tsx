import { useEffect, useState } from "react";
import EventBus from "../game/EventBus";
import { EconomySnapshot, Event } from "@server/types";
import { MAX_STACK } from "@server/globals";
import { Item } from "./Item";

export function Economy() {
  const [snapshot, setSnapshot] = useState<EconomySnapshot | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = (data: EconomySnapshot) => setSnapshot(data);
    const toggle = () => setIsOpen((prev) => !prev);

    EventBus.on(Event.ECONOMY_UPDATE, handler);
    EventBus.on(Event.UI_TOGGLE, toggle);

    return () => {
      EventBus.off(Event.ECONOMY_UPDATE, handler);
      EventBus.off(Event.UI_TOGGLE, toggle);
    };
  }, []);

  if (!isOpen || !snapshot?.needs.length) return null;

  return (
    <div className="fixed bottom-4 right-4 p-4 flex flex-col gap-2 max-w-135 bg-black/10 rounded-lg">
      <h3 className="text-white">Economy</h3>
      {snapshot.needs.map((need, i) => (
        <ul key={i} className="grid grid-cols-4 gap-1">
          {need.items.map((entry, j) => (
            <Item key={j} name={entry.item} bar={entry.quantity} barLabel={`${entry.quantity}/${MAX_STACK}`} />
          ))}
        </ul>
      ))}
    </div>
  );
}
