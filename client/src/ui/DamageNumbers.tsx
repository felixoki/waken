import { useEffect, useRef, useState } from "react";
import EventBus from "../game/EventBus";
import { Event } from "@server/types";

interface DamageNumber {
  id: number;
  x: number;
  y: number;
  damage: number;
  isCritical?: boolean;
}

let nextId = 0;

export function DamageNumbers() {
  const [numbers, setNumbers] = useState<DamageNumber[]>([]);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const handler = (data: Omit<DamageNumber, "id">) => {
      const id = nextId++;
      setNumbers((prev) => [...prev, { id, ...data }]);

      const timer = setTimeout(() => {
        setNumbers((prev) => prev.filter((n) => n.id !== id));
        timers.current.delete(id);
      }, 800);

      timers.current.set(id, timer);
    };

    EventBus.on(Event.DAMAGE_NUMBER, handler);

    return () => {
      EventBus.off(Event.DAMAGE_NUMBER, handler);
      timers.current.forEach(clearTimeout);
      timers.current.clear();
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {numbers.map((n) => (
        <span
          key={n.id}
          className={`absolute font-bold animate-damage-float ${
            n.isCritical
              ? "text-yellow-400 text-xl"
              : "text-white text-base"
          }`}
          style={{ left: n.x, top: n.y }}
        >
          {n.damage}
        </span>
      ))}
    </div>
  );
}
