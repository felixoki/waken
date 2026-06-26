import { useEffect, useRef, useState } from "react";
import {
  Action,
  ComponentName,
  EntityName,
  Event,
  Item as ItemInterface,
  SlotZone,
  SpellName,
} from "@server/types";
import EventBus from "../game/EventBus";
import { configs } from "@server/configs";
import { ContextMenu, ContextMenuAction } from "./ContextMenu";
import { Item } from "./Item";
import type { DragData } from "./Provider";

export function Inventory() {
  const [items, setItems] = useState<(ItemInterface | null)[]>(
    Array(24).fill(null),
  );
  const [isOpen, setIsOpen] = useState(false);
  const [storageEntityId, setStorageEntityId] = useState<string | null>(null);
  const isOpenRef = useRef(false);
  const transformedRef = useRef(false);
  const [menu, setMenu] = useState<{
    index: number;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    const add = (items: (ItemInterface | null)[]) => setItems(items);

    const toggle = () => {
      if (transformedRef.current) return;
      isOpenRef.current = !isOpenRef.current;
      setIsOpen(isOpenRef.current);
      setMenu(null);
    };

    const transform = (active: boolean) => {
      transformedRef.current = active;

      if (active && isOpenRef.current) {
        isOpenRef.current = false;
        setIsOpen(false);
        setMenu(null);
      }
    };

    const onStorageOpen = (data: { entityId: string }) => {
      setStorageEntityId(data.entityId);
      if (!isOpenRef.current) EventBus.emit(Event.UI_TOGGLE);
    };

    const onStorageClose = () => setStorageEntityId(null);

    const onCollectorOpen = () => {
      if (!isOpenRef.current) EventBus.emit(Event.UI_TOGGLE);
    };

    EventBus.on(Event.INVENTORY_UPDATE, add);
    EventBus.on(Event.UI_TOGGLE, toggle);
    EventBus.on(Event.STORAGE_OPEN, onStorageOpen);
    EventBus.on(Event.STORAGE_CLOSE, onStorageClose);
    EventBus.on(Event.COLLECTOR_OPEN, onCollectorOpen);
    EventBus.on(Event.TRANSFORM_TOGGLE, transform);

    return () => {
      EventBus.off(Event.INVENTORY_UPDATE, add);
      EventBus.off(Event.UI_TOGGLE, toggle);
      EventBus.off(Event.STORAGE_OPEN, onStorageOpen);
      EventBus.off(Event.STORAGE_CLOSE, onStorageClose);
      EventBus.off(Event.COLLECTOR_OPEN, onCollectorOpen);
      EventBus.off(Event.TRANSFORM_TOGGLE, transform);
    };
  }, []);

  if (!isOpen) return null;

  const item = menu !== null ? items[menu.index] : null;

  const actions: ContextMenuAction[] = item
    ? getActions(item.name, !!storageEntityId).map((action) => ({
        label: action,
        onClick: () => {
          if (action === Action.CONSUME)
            EventBus.emit(Event.ITEM_CONSUME, { name: item.name });

          if (action === Action.LEARN) {
            const spell = getSpell(item.name);

            if (spell)
              EventBus.emit(Event.SPELL_LEARN, {
                entityName: item.name,
                spell,
              });
          }

          if (action === Action.DEPOSIT && storageEntityId)
            EventBus.emit(Event.SLOT_MOVE, {
              source: { zone: SlotZone.INVENTORY, index: menu!.index },
              target: {
                zone: SlotZone.STORAGE,
                index: -1,
                entityId: storageEntityId,
              },
            });

          setMenu(null);
        },
      }))
    : [];

  return (
    <>
      <ul className="flex flex-wrap gap-1 mt-2 max-w-135">
        {items.map((item, i) => {
          const data: DragData | undefined = item
            ? { zone: SlotZone.INVENTORY, index: i, name: item.name, item }
            : undefined;
          return (
            <Item
              key={i}
              name={item?.name ?? null}
              quantity={item?.quantity}
              interactive
              dragId={item ? `inventory-${i}` : undefined}
              dropId={`inventory-${i}`}
              dragData={data}
              onContextMenu={(e) => {
                e.preventDefault();
                if (!item) return;
                const actions = getActions(item.name, !!storageEntityId);
                if (actions.length === 0) return;
                setMenu({ index: i, x: e.clientX, y: e.clientY });
              }}
            />
          );
        })}
      </ul>

      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          actions={actions}
          onClose={() => setMenu(null)}
        />
      )}
    </>
  );
}

function getActions(name: EntityName, storageOpen = false): Action[] {
  const def = configs.entities[name];
  if (!def) return [];

  const actions: Action[] = [];

  if (def.components.some((c) => c.name === ComponentName.CONSUMABLE))
    actions.push(Action.CONSUME);

  if (def.components.some((c) => c.name === ComponentName.LEARNABLE))
    actions.push(Action.LEARN);

  if (storageOpen) actions.push(Action.DEPOSIT);

  return actions;
}

function getSpell(name: EntityName): SpellName | null {
  const def = configs.entities[name];
  const learnable = def?.components.find(
    (c) => c.name === ComponentName.LEARNABLE,
  );

  if (learnable && learnable.name === ComponentName.LEARNABLE)
    return learnable.config.spell;

  return null;
}
