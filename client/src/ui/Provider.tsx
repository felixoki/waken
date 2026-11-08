import {
  createContext,
  useContext,
  useEffect,
  useRef,
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
import { Icon } from "./Icon";
import { Split } from "./Split";
import { configs } from "@server/configs";
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

interface Held {
  source: DragData;
  quantity: number;
  x: number;
  y: number;
}

interface Pending {
  source: DragData;
  total: number;
  x: number;
  y: number;
}

interface SlotActions {
  holding: boolean;
  split: (source: DragData, total: number, rect: DOMRect) => void;
  place: (dropId: string) => void;
  cancel: () => void;
}

const SlotActionsContext = createContext<SlotActions>({
  holding: false,
  split: () => {},
  place: () => {},
  cancel: () => {},
});

export function useSlotActions() {
  return useContext(SlotActionsContext);
}

const collision: CollisionDetection = (args) => {
  const within = pointerWithin(args);
  if (within.length > 0) return within;
  return closestCenter(args);
};

export function Provider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<DragData | null>(null);
  const [storageEntityId, setStorageEntityId] = useState<string | null>(null);
  const [held, setHeld] = useState<Held | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const follower = useRef<HTMLDivElement>(null);
  const muted = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  useEffect(() => {
    const onOpen = (data: { entityId: string }) =>
      setStorageEntityId(data.entityId);
    const onClose = () => {
      setStorageEntityId(null);
      setHeld(null);
      setPending(null);
    };

    EventBus.on(Event.STORAGE_OPEN, onOpen);
    EventBus.on(Event.STORAGE_CLOSE, onClose);

    return () => {
      EventBus.off(Event.STORAGE_OPEN, onOpen);
      EventBus.off(Event.STORAGE_CLOSE, onClose);
    };
  }, []);

  const holding = !!held || !!pending;

  useEffect(() => {
    if (muted.current === holding) return;

    muted.current = holding;
    EventBus.emit(Event.INPUT_MUTE, holding);
  }, [holding]);

  useEffect(() => {
    if (!held) return;

    const move = (e: MouseEvent) => {
      if (follower.current)
        follower.current.style.transform = `translate(${e.clientX - 32}px, ${e.clientY - 32}px)`;
    };

    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setHeld(null);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("keydown", key);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("keydown", key);
    };
  }, [held]);

  const cancel = () => {
    setHeld(null);
    setPending(null);
  };

  const actions: SlotActions = {
    holding: !!held,

    split: (source, total, rect) => {
      setHeld(null);
      setPending({ source, total, x: rect.left, y: rect.bottom + 6 });
    },

    place: (dropId) => {
      setHeld(null);
      if (!held) return;

      const target = parseDropId(dropId, storageEntityId);
      const { source } = held;

      if (
        !target ||
        (source.zone === target.zone &&
          source.index === target.index &&
          source.entityId === target.entityId)
      )
        return;

      EventBus.emit(Event.SLOT_MOVE, {
        source: {
          zone: source.zone,
          index: source.index,
          entityId: source.entityId,
        } as SlotReference,
        target,
        type: SlotType.ENTITY,
        quantity: held.quantity,
      });
    },

    cancel,
  };

  const confirm = (quantity: number) => {
    if (!pending) return;

    setPending(null);
    setHeld({
      source: pending.source,
      quantity,
      x: pending.x,
      y: pending.y - 70,
    });
  };

  const onDragStart = (event: DragStartEvent) => {
    cancel();
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

  const heldIcon = held
    ? configs.entities[held.source.name as EntityName]?.metadata?.icon
    : undefined;

  return (
    <IsDraggingContext.Provider value={active !== null}>
      <SlotActionsContext.Provider value={actions}>
        <DndContext
          sensors={sensors}
          collisionDetection={collision}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          {held && (
            <div
              className="fixed inset-0 -z-10"
              onClick={cancel}
              onContextMenu={(e) => {
                e.preventDefault();
                cancel();
              }}
            />
          )}
          {children}
          {pending && (
            <Split
              name={pending.source.name}
              total={pending.total}
              x={pending.x}
              y={pending.y}
              onConfirm={confirm}
              onCancel={cancel}
            />
          )}
          {held && (
            <div
              ref={follower}
              className="fixed left-0 top-0 z-50 flex size-16 items-center justify-center pointer-events-none opacity-90 text-white"
              style={{ transform: `translate(${held.x}px, ${held.y}px)` }}
            >
              {heldIcon && <Icon icon={heldIcon} />}
              <span className="absolute bottom-0.5 right-0.5 text-sm [text-shadow:0_1px_2px_#000]">
                {held.quantity}
              </span>
            </div>
          )}
          <DragOverlay dropAnimation={null}>
            {active ? (
              <ul>
                <Item name={active.name} />
              </ul>
            ) : null}
          </DragOverlay>
        </DndContext>
      </SlotActionsContext.Provider>
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
