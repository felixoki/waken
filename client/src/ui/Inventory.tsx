import { useEffect, useRef, useState } from "react";
import {
  Action,
  ComponentConfig,
  ComponentName,
  ConsumableConfig,
  EntityName,
  Event,
  Item as ItemInterface,
  PartyStatus,
  SlotZone,
  SpellName,
} from "@server/types";
import EventBus from "../game/EventBus";
import { configs } from "@server/configs";
import { INVENTORY_MAX_SIZE } from "@server/globals";
import { ContextMenu, ContextMenuAction } from "./ContextMenu";
import { useParty } from "./useParty";
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
  const [known, setKnown] = useState<SpellName[]>([]);
  const { party, inRealm } = useParty();

  useEffect(() => {
    const add = (items: (ItemInterface | null)[]) => setItems(items);

    const sync = (spells: SpellName[]) => setKnown(spells);

    const learn = (spell: SpellName) =>
      setKnown((prev) => (prev.includes(spell) ? prev : [...prev, spell]));

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

    const onCrafterOpen = () => {
      if (!isOpenRef.current) EventBus.emit(Event.UI_TOGGLE);
    };

    EventBus.on(Event.INVENTORY_UPDATE, add);
    EventBus.on(Event.UI_TOGGLE, toggle);
    EventBus.on(Event.STORAGE_OPEN, onStorageOpen);
    EventBus.on(Event.STORAGE_CLOSE, onStorageClose);
    EventBus.on(Event.CRAFTER_OPEN, onCrafterOpen);
    EventBus.on(Event.IMPROVEMENTS_OPEN, onCrafterOpen);
    EventBus.on(Event.TRANSFORM_TOGGLE, transform);
    EventBus.on(Event.SPELLS_SYNC, sync);
    EventBus.on(Event.SPELLBOOK_SYNC, sync);
    EventBus.on(Event.SPELL_LEARN_CONFIRM, learn);

    return () => {
      EventBus.off(Event.INVENTORY_UPDATE, add);
      EventBus.off(Event.UI_TOGGLE, toggle);
      EventBus.off(Event.STORAGE_OPEN, onStorageOpen);
      EventBus.off(Event.STORAGE_CLOSE, onStorageClose);
      EventBus.off(Event.CRAFTER_OPEN, onCrafterOpen);
      EventBus.off(Event.IMPROVEMENTS_OPEN, onCrafterOpen);
      EventBus.off(Event.TRANSFORM_TOGGLE, transform);
      EventBus.off(Event.SPELLS_SYNC, sync);
      EventBus.off(Event.SPELLBOOK_SYNC, sync);
      EventBus.off(Event.SPELL_LEARN_CONFIRM, learn);
    };
  }, []);

  if (!isOpen) return null;

  const item = menu !== null ? items[menu.index] : null;

  const canUnlock =
    !!party && party.status === PartyStatus.LOBBY && !inRealm;

  const actions: ContextMenuAction[] = item
    ? getActions(item.name, !!storageEntityId, item.soul, inRealm).map((action) => {
        const consumable = getConsumable(item.name);
        const reason =
          action !== Action.CONSUME
            ? undefined
            : consumable?.unlock !== undefined && !canUnlock
              ? "Only in the village, with a party"
              : consumable?.wake && !inRealm
                ? "Only in a dream"
                : consumable?.slots && items.length >= INVENTORY_MAX_SIZE
                  ? "Your pack can't get any bigger"
                  : undefined;
        const gated = reason !== undefined;

        const spell = action === Action.LEARN ? getSpell(item.name) : null;
        const learned = spell !== null && known.includes(spell);

        return {
          label: action,
          disabled: gated || learned,
          title: gated
            ? reason
            : learned
              ? "Already known"
              : undefined,
          onClick: () => {
            if (gated || learned) return;

            if (action === Action.CONSUME)
              EventBus.emit(Event.ITEM_CONSUME, { name: item.name });

            if (spell)
              EventBus.emit(Event.SPELL_LEARN, {
                entityName: item.name,
                spell,
              });

            if (action === Action.DEPOSIT && storageEntityId)
              EventBus.emit(Event.SLOT_MOVE, {
                source: { zone: SlotZone.INVENTORY, index: menu!.index },
                target: {
                  zone: SlotZone.STORAGE,
                  index: -1,
                  entityId: storageEntityId,
                },
              });

            if (action === Action.SOLIDIFY)
              EventBus.emit(Event.ITEM_SOLIDIFY, { index: menu!.index });

            if (action === Action.DROP)
              EventBus.emit(Event.ITEM_DROP, { index: menu!.index });

            setMenu(null);
          },
        };
      })
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
              soul={item?.soul}
              weight={item?.weight}
              interactive
              dragId={item ? `inventory-${i}` : undefined}
              dropId={`inventory-${i}`}
              dragData={data}
              onContextMenu={(e) => {
                e.preventDefault();
                if (!item) return;
                const actions = getActions(
                  item.name,
                  !!storageEntityId,
                  item.soul,
                  inRealm,
                );
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

function getActions(
  name: EntityName,
  storageOpen = false,
  soul?: EntityName | null,
  inRealm = false,
): Action[] {
  const def = configs.entities[name];
  if (!def) return [];

  const actions: Action[] = [];

  if (def.components.some((c) => c.name === ComponentName.CONSUMABLE))
    actions.push(Action.CONSUME);

  if (def.components.some((c) => c.name === ComponentName.LEARNABLE))
    actions.push(Action.LEARN);

  if (name === EntityName.SOULSTONE && soul && isSolidifiable(soul))
    actions.push(Action.SOLIDIFY);

  if (storageOpen) actions.push(Action.DEPOSIT);

  if (isDroppable(name) && !(inRealm && configs.relics.has(name)))
    actions.push(Action.DROP);

  return actions;
}

function isDroppable(name: EntityName): boolean {
  const pickable = configs.entities[name]?.components.find(
    (c): c is Extract<ComponentConfig, { name: ComponentName.PICKABLE }> =>
      c.name === ComponentName.PICKABLE,
  );
  if (!pickable) return false;

  return !pickable.config || pickable.config.item === name;
}

function isSolidifiable(soul: EntityName): boolean {
  const capturable = configs.entities[soul]?.components.find(
    (c): c is Extract<ComponentConfig, { name: ComponentName.CAPTURABLE }> =>
      c.name === ComponentName.CAPTURABLE,
  );
  return capturable?.config.solidifiable !== false;
}

function getConsumable(name: EntityName): ConsumableConfig | undefined {
  const comp = configs.entities[name]?.components.find(
    (c) => c.name === ComponentName.CONSUMABLE,
  );

  return comp?.name === ComponentName.CONSUMABLE ? comp.config : undefined;
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
