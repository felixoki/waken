import { EntityName, Event, HotbarSlot, SpellName } from "@server/types";
import { useEffect, useState } from "react";
import EventBus from "../game/EventBus";
import { configs } from "@server/configs";
import { Icon } from "./Icon";

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

    EventBus.on(Event.HOTBAR_UPDATE, handler);

    return () => {
      EventBus.off(Event.HOTBAR_UPDATE, handler);
    };
  }, []);

  return (
    <ul className="flex flex-wrap gap-1">
      {slots.map((slot, i) => (
        <Slot key={i} name={slot?.name || null} active={i === active} />
      ))}
    </ul>
  );
}

function Slot({
  name,
  active,
}: {
  name: EntityName | SpellName | null;
  active: boolean;
}) {
  const config =
    configs.entities[name as EntityName] ||
    configs.spells[name as SpellName] ||
    null;

  return (
    <button
      title={config?.metadata?.description || name || ""}
      className={`relative flex items-center justify-center rounded-lg text-xs w-16 aspect-square overflow-hidden ${
        active ? "text-blue-600 bg-blue-100" : " bg-gray-200"
      }`}
    >
      {config?.metadata?.icon ? (
        <Icon icon={config.metadata.icon} />
      ) : (
        config?.metadata?.displayName || name || ""
      )}
    </button>
  );
}
