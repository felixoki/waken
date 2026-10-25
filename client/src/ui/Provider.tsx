import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
  type CollisionDetection,
} from "@dnd-kit/core";
import {
  Event,
  SlotType,
  SlotZone,
  type Slot,
  type Item as ItemType,
  type SlotReference,
} from "@server/types";
import EventBus from "../game/EventBus";
import { Item } from "./Item";
import { EntityName, SpellName } from "@server/types";

export interface DragData {
  zone: SlotZone;
  index: number;
  name: EntityName | SpellName;
  entityId?: string;
  hotbarSlot?: Slot | null;
  item?: ItemType | null;
}

export const ECONOMY_DROP_ID = "economy-zone";

const IsDraggingContext = createContext(false);

export function useIsDragging() {
  return useContext(IsDraggingContext);
}

const collision: CollisionDetection = (args) => {
  const within = pointerWithin(args);
  if (within.length > 0) return within;
  return closestCenter(args);
};

export function Provider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<DragData | null>(null);
  const [storageEntityId, setStorageEntityId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  useEffect(() => {
    const onOpen = (data: { entityId: string }) =>
      setStorageEntityId(data.entityId);
    const onClose = () => setStorageEntityId(null);

    EventBus.on(Event.STORAGE_OPEN, onOpen);
    EventBus.on(Event.STORAGE_CLOSE, onClose);

    return () => {
      EventBus.off(Event.STORAGE_OPEN, onOpen);
      EventBus.off(Event.STORAGE_CLOSE, onClose);
    };
  }, []);

  const onDragStart = (event: DragStartEvent) => {
    setActive((event.active.data.current as DragData) ?? null);
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActive(null);

    const source = event.active.data.current as DragData | undefined;
    if (!source) return;

    const overId = event.over?.id as string | undefined;
    if (!overId) return;

    if (overId === ECONOMY_DROP_ID) {
      if (source.zone === SlotZone.INVENTORY)
        EventBus.emit(Event.ITEM_COURIER, { index: source.index });
      return;
    }

    const target = parseDropId(overId, storageEntityId);
    if (!target) return;

    if (
      source.zone === target.zone &&
      source.index === target.index &&
      source.entityId === target.entityId
    )
      return;

    const type =
      source.zone === SlotZone.SPELLBOOK ||
      source.hotbarSlot?.type === SlotType.SPELL
        ? SlotType.SPELL
        : SlotType.ENTITY;

    if (type === SlotType.SPELL)
      if (target.zone !== SlotZone.HOTBAR && target.zone !== SlotZone.SPELLBOOK)
        return;

    if (type === SlotType.ENTITY && target.zone === SlotZone.SPELLBOOK) return;

    EventBus.emit(Event.SLOT_MOVE, {
      source: {
        zone: source.zone,
        index: source.index,
        entityId: source.entityId,
      } as SlotReference,
      target,
      type,
    });
  };

  return (
    <IsDraggingContext.Provider value={active !== null}>
      <DndContext
        sensors={sensors}
        collisionDetection={collision}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        {children}
        <DragOverlay dropAnimation={null}>
          {active ? (
            <ul>
              <Item name={active.name} />
            </ul>
          ) : null}
        </DragOverlay>
      </DndContext>
    </IsDraggingContext.Provider>
  );
}

function parseDropId(
  id: string,
  storageEntityId: string | null,
): SlotReference | null {
  if (id === `${SlotZone.SPELLBOOK}-zone`)
    return { zone: SlotZone.SPELLBOOK, index: -1 };
  
  const parts = id.split("-");
  if (parts.length < 2) return null;

  const zone = parts[0] as string;
  const index = parseInt(parts[1], 10);

  if (isNaN(index)) return null;

  switch (zone) {
    case SlotZone.INVENTORY:
      return { zone: SlotZone.INVENTORY, index };
    case SlotZone.HOTBAR:
      return { zone: SlotZone.HOTBAR, index };
    case SlotZone.ROBE:
      return { zone: SlotZone.ROBE, index: 0 };
    case SlotZone.STORAGE:
      return storageEntityId
        ? { zone: SlotZone.STORAGE, index, entityId: storageEntityId }
        : null;
    default:
      return null;
  }
}
