import { useEffect, useState } from "react";
import EventBus from "../game/EventBus";
import { Event } from "@server/types";

interface Entity {
  id: string;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
}

export function Entities() {
  const [entities, setEntities] = useState<Entity[]>([]);

  useEffect(() => {
    const handler = (data: Entity[]) => {
      setEntities(data);
    };

    EventBus.on(Event.ENTITIES_UPDATE, handler);

    return () => {
      EventBus.off(Event.ENTITIES_UPDATE, handler);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none">
      {entities.map((e) => {
        const pct = (e.health / e.maxHealth) * 100;
        return (
          <div
            key={e.id}
            className="w-12 h-2 bg-gray-800 rounded-xs overflow-hidden absolute"
            style={{ left: e.x - 20, top: e.y - 40 }}
          >
            <div
              className={`h-full rounded-xs ${pct < 30 ? "bg-red-600" : pct < 70 ? "bg-yellow-600" : "bg-green-600"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}
