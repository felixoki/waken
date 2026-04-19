import { useEffect, useState } from "react";
import { Event, HotbarSlotType, SpellName } from "@server/types";
import EventBus from "../game/EventBus";
import { configs } from "@server/configs";
import { Icon } from "./Icon";

export function Spells() {
  const [spells, setSpells] = useState<SpellName[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const sync = (learned: SpellName[]) => setSpells(learned);

    const confirm = (spell: SpellName) =>
      setSpells((prev) => (prev.includes(spell) ? prev : [...prev, spell]));

    const toggle = () => setIsOpen((prev) => !prev);

    EventBus.on(Event.SPELLS_SYNC, sync);
    EventBus.on(Event.SPELL_LEARN_CONFIRM, confirm);
    EventBus.on(Event.UI_TOGGLE, toggle);

    return () => {
      EventBus.off(Event.SPELLS_SYNC, sync);
      EventBus.off(Event.SPELL_LEARN_CONFIRM, confirm);
      EventBus.off(Event.UI_TOGGLE, toggle);
    };
  }, []);

  if (!isOpen) return null;

  const equip = (spell: SpellName) => {
    EventBus.emit(Event.SPELL_EQUIP, {
      type: HotbarSlotType.SPELL,
      name: spell,
    });
  };

  return (
    <div className="bg-black/25 rounded-lg p-4">
      <h3 className="text-white mb-2">Spells</h3>
      <ul className="flex flex-wrap gap-1">
        {spells.map((spell) => (
          <Spell key={spell} name={spell} onClick={() => equip(spell)} />
        ))}
        {!spells.length && <li className="text-white text-sm">No spells available</li>}
      </ul>
    </div>
  );
}

function Spell({ name, onClick }: { name: SpellName; onClick: () => void }) {
  const config = configs.spells[name];

  return (
    <li>
      <button
        title={config?.metadata?.description || name}
        className="relative flex items-center justify-center rounded-lg text-xs w-16 aspect-square bg-gray-200"
        onClick={onClick}
      >
        {config?.metadata?.icon ? (
          <Icon icon={config.metadata.icon} />
        ) : (
          config?.metadata?.displayName || name
        )}
      </button>
    </li>
  );
}
