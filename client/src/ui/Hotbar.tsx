import { HotbarSlot } from "@server/types";
import { useEffect, useState } from "react";
import EventBus from "../game/EventBus";

export function Hotbar() {
  const [slots, setSlots] = useState<(HotbarSlot | null)[]>(() =>
    Array(8).fill(null),
  );
  const [active, setActive] = useState(0);

  useEffect(() => {
    const handler = (state: {
      slots: (HotbarSlot | null)[];
      active: number;
    }) => {
      setSlots(state.slots);
      setActive(state.active);
    };

    EventBus.on("hotbar:update", handler);

    return () => {
      EventBus.off("hotbar:update", handler);
    };
  }, []);

  return (
    <>
      <h3 className="text-white mb-3">Hotbar</h3>
      <ul className="flex flex-wrap gap-1">
        {slots.map((slot, i) => (
          <li
            key={i}
            className={`flex items-center justify-center border rounded-lg aspect-square w-16 text-white text-xs ${
              i === active ? "border-blue-600" : "border-slate-500"
            }`}
          >
            {slot?.name}
          </li>
        ))}
      </ul>
    </>
  );
}
