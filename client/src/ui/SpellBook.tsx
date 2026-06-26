import { useEffect, useRef, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Event, SlotZone, SpellName } from "@server/types";
import EventBus from "../game/EventBus";
import { Item } from "./Item";
import type { DragData } from "./Provider";

export function SpellBook() {
  const [spells, setSpells] = useState<SpellName[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const transformed = useRef(false);

  const { setNodeRef, isOver } = useDroppable({
    id: `${SlotZone.SPELLBOOK}-zone`,
  });

  useEffect(() => {
    const sync = (learned: SpellName[]) => setSpells(learned);

    const confirm = (spell: SpellName) =>
      setSpells((prev) => (prev.includes(spell) ? prev : [...prev, spell]));

    const toggle = () => {
      if (transformed.current) return;
      setIsOpen((prev) => !prev);
    };

    const transform = (active: boolean) => {
      transformed.current = active;
      if (active) setIsOpen(false);
    };

    EventBus.on(Event.SPELLS_SYNC, sync);
    EventBus.on(Event.SPELLBOOK_SYNC, sync);
    EventBus.on(Event.SPELL_LEARN_CONFIRM, confirm);
    EventBus.on(Event.UI_TOGGLE, toggle);
    EventBus.on(Event.TRANSFORM_TOGGLE, transform);

    return () => {
      EventBus.off(Event.SPELLS_SYNC, sync);
      EventBus.off(Event.SPELLBOOK_SYNC, sync);
      EventBus.off(Event.SPELL_LEARN_CONFIRM, confirm);
      EventBus.off(Event.UI_TOGGLE, toggle);
      EventBus.off(Event.TRANSFORM_TOGGLE, transform);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div
      ref={setNodeRef}
      className={`bg-black/25 rounded-lg p-4 ${isOver ? "ring-2 ring-blue-400" : ""}`}
    >
      <h3 className="text-white mb-2">Spells</h3>
      <ul className="flex flex-wrap gap-1">
        {spells.map((spell, i) => {
          const data: DragData = {
            zone: SlotZone.SPELLBOOK,
            index: i,
            name: spell,
          };
          return (
            <Item
              key={spell}
              name={spell}
              dragId={`spellbook-${i}`}
              dragData={data}
            />
          );
        })}
        {!spells.length && (
          <li className="text-white text-sm">No spells available</li>
        )}
      </ul>
    </div>
  );
}
