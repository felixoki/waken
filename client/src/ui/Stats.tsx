import { useEffect, useState } from "react";
import EventBus from "../game/EventBus";
import { Event } from "@server/types";
import { MAX_HEALTH, MAX_MANA } from "@server/globals";

export function Stats() {
  const [health, setHealth] = useState(MAX_HEALTH);
  const [maxHealth, setMaxHealth] = useState(MAX_HEALTH);
  const [mana, setMana] = useState(MAX_MANA);
  const [maxMana, setMaxMana] = useState(MAX_MANA);

  useEffect(() => {
    EventBus.on(Event.PLAYER_HEALTH, setHealth);
    EventBus.on(Event.PLAYER_MAX_HEALTH, setMaxHealth);
    EventBus.on(Event.PLAYER_MANA, setMana);
    EventBus.on(Event.PLAYER_MAX_MANA, setMaxMana);

    return () => {
      EventBus.off(Event.PLAYER_HEALTH, setHealth);
      EventBus.off(Event.PLAYER_MAX_HEALTH, setMaxHealth);
      EventBus.off(Event.PLAYER_MANA, setMana);
      EventBus.off(Event.PLAYER_MAX_MANA, setMaxMana);
    };
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <div
        className="h-7 bg-gray-800 rounded-md overflow-hidden"
        style={{ width: `${(maxHealth / MAX_HEALTH) * 22.5}rem`, transition: "width 0.4s ease" }}
      >
        <div
          className="h-full bg-green-600 rounded"
          style={{ width: `${(health / maxHealth) * 100}%`, transition: "width 0.4s ease" }}
        />
      </div>
      <div
        className="h-7 bg-gray-800 rounded-md overflow-hidden"
        style={{ width: `${(maxMana / MAX_MANA) * 22.5}rem`, transition: "width 0.4s ease" }}
      >
        <div
          className="h-full bg-blue-600 rounded"
          style={{ width: `${(mana / maxMana) * 100}%`, transition: "width 0.4s ease" }}
        />
      </div>
    </div>
  );
}
