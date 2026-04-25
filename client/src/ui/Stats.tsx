import { useEffect, useState } from "react";
import EventBus from "../game/EventBus";
import { Event } from "@server/types";

export function Stats() {
  const [health, setHealth] = useState(100);
  const [mana, setMana] = useState(100);

  useEffect(() => {
    EventBus.on(Event.PLAYER_HEALTH, setHealth);
    EventBus.on(Event.PLAYER_MANA, setMana);

    return () => {
      EventBus.off(Event.PLAYER_HEALTH, setHealth);
      EventBus.off(Event.PLAYER_MANA, setMana);
    };
  }, []);

  return (
    <div className="fixed bottom-0 left-0 p-4 flex flex-col gap-3">
      <div className="w-75 h-6 bg-gray-800 rounded-md overflow-hidden">
        <div
          className="h-full bg-green-600 rounded"
          style={{ width: `${health}%`, transition: "width 0.4s ease" }}
        />
      </div>
      <div className="w-75 h-6 bg-gray-800 rounded-md overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded"
          style={{ width: `${mana}%`, transition: "width 0.4s ease" }}
        />
      </div>
    </div>
  );
}
