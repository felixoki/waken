import { useRef, useState } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { ComponentName, EntityName, SpellName } from "@server/types";
import { SpellConfig } from "@server/types/spells";
import { Ingredient } from "@server/types/collectors";
import { configs } from "@server/configs";
import { Icon } from "./Icon";
import { useIsDragging, type DragData } from "./Provider";

interface Props {
  name: EntityName | SpellName | null;
  quantity?: number;
  bar?: number;
  barLabel?: string;
  soul?: EntityName | null;
  interactive?: boolean;
  disabled?: boolean;
  active?: boolean;
  recipe?: Ingredient[];
  dragId?: string;
  dropId?: string;
  dragData?: DragData;
  onClick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export function Item({
  name,
  quantity,
  bar,
  barLabel,
  soul,
  interactive = false,
  disabled = false,
  active = false,
  recipe,
  dragId,
  dropId,
  dragData,
  onClick,
  onContextMenu,
}: Props) {
  const [hovered, setHovered] = useState(false);
  const [above, setAbove] = useState(true);
  const [alignRight, setAlignRight] = useState(false);
  const ref = useRef<HTMLLIElement>(null);
  const globalDragging = useIsDragging();

  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    isDragging,
  } = useDraggable({
    id: dragId ?? "",
    data: dragData,
    disabled: !dragId || !name,
  });

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: dropId ?? "",
    disabled: !dropId,
  });

  const config =
    configs.entities[name as EntityName] ||
    configs.spells[name as SpellName] ||
    null;

  const displayName = config?.metadata?.displayName || name || "";
  const description = config?.metadata?.description;

  const baseClass =
    "relative flex items-center justify-center rounded-lg text-xs w-16 aspect-square overflow-hidden transition-colors";

  const stateClass = disabled
    ? "bg-gray-200 opacity-50 cursor-not-allowed"
    : active
      ? "bg-gray-200 border-2 border-blue-600"
      : isOver
        ? "bg-gray-200 ring-2 ring-blue-400"
        : "bg-gray-200";

  const handleMouseEnter = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setAbove(rect.top > 150);
      setAlignRight(rect.left + 240 > window.innerWidth);
    }
    setHovered(true);
  };

  const mergeRefs = (el: HTMLLIElement | null) => {
    (ref as React.MutableRefObject<HTMLLIElement | null>).current = el;
    setDragRef(el);
    setDropRef(el);
  };

  return (
    <li
      ref={mergeRefs}
      className={`relative ${isDragging ? "opacity-30" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setHovered(false)}
      {...attributes}
      {...listeners}
    >
      <button
        className={`${baseClass} ${stateClass}`}
        disabled={disabled && !interactive}
        onClick={disabled ? undefined : onClick}
        onContextMenu={interactive ? onContextMenu : undefined}
      >
        {config?.metadata?.icon ? (
          <Icon icon={config.metadata.icon} />
        ) : (
          displayName
        )}
        {quantity !== undefined &&
          quantity > 0 &&
          bar === undefined &&
          !isDragging && (
            <span className="absolute bottom-1 right-1">{quantity}</span>
          )}
        {bar !== undefined &&
          (() => {
            const MAX = 100;
            const fill = Math.min(Math.max(bar, 0), MAX) / MAX;
            const barColor =
              bar > 50
                ? "bg-green-500"
                : bar > 20
                  ? "bg-yellow-400"
                  : "bg-red-500";
            return (
              <div className="absolute right-1.5 top-1.5 bottom-1.5 w-1.5 rounded-full bg-black/30 overflow-hidden">
                <div
                  className={`${barColor} absolute bottom-0 left-0 right-0 rounded-full transition-all`}
                  style={{ height: `${fill * 100}%` }}
                />
              </div>
            );
          })()}
      </button>

      {hovered && name && !globalDragging && (
        <div
          className={`absolute ${above ? "bottom-full mb-1" : "top-full mt-1"} ${alignRight ? "right-0" : "left-0"} z-50 w-60 bg-black/80 text-white text-sm rounded-lg p-3 pointer-events-none`}
        >
          <div className="flex items-center gap-2 mb-1">
            {config?.metadata?.icon && (
              <div className="rounded overflow-hidden">
                <Icon icon={config.metadata.icon} zoom={2} />
              </div>
            )}
            <p className="font-semibold leading-tight">{displayName}</p>
          </div>
          {description && <p className="text-gray-300 mt-1">{description}</p>}
          {(() => {
            const entity = configs.entities[name as EntityName];
            const comp = entity?.components.find(
              (c) => c.name === ComponentName.CONSUMABLE,
            );
            if (!comp || comp.name !== ComponentName.CONSUMABLE) return null;
            const { effect, restore } = comp.config;
            return (
              <div className="mt-2 flex flex-col gap-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/50">Effect</span>
                  <span className="text-white capitalize">{effect}</span>
                </div>
                {restore.health && (
                  <div className="flex justify-between">
                    <span className="text-white/50">Restore health</span>
                    <span className="text-white">+{restore.health}</span>
                  </div>
                )}
                {restore.mana && (
                  <div className="flex justify-between">
                    <span className="text-white/50">Restore mana</span>
                    <span className="text-white">+{restore.mana}</span>
                  </div>
                )}
              </div>
            );
          })()}
          {barLabel && (
            <div className="mt-1 flex justify-between text-xs">
              <span className="text-white/50">Stock</span>
              <span className="text-white">{barLabel}</span>
            </div>
          )}
          {soul && (
            <div className="mt-1 flex justify-between text-xs">
              <span className="text-white/50">Soul</span>
              <span className="text-white capitalize">
                {configs.entities[soul]?.metadata?.displayName ?? soul}
              </span>
            </div>
          )}
          {configs.spells[name as SpellName] &&
            (() => {
              const spell = configs.spells[name as SpellName] as SpellConfig;
              return (
                <div className="mt-2 flex flex-col gap-1 text-xs">
                  {spell.damage.amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-white/50">Damage</span>
                      <span className="text-white">{spell.damage.amount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-white/50">Mana</span>
                    <span className="text-white">{spell.mana}</span>
                  </div>
                  {spell.knockback > 0 && (
                    <div className="flex justify-between">
                      <span className="text-white/50">Knockback</span>
                      <span className="text-white">{spell.knockback}</span>
                    </div>
                  )}
                  {spell.range !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-white/50">Range</span>
                      <span className="text-white">{spell.range}</span>
                    </div>
                  )}
                </div>
              );
            })()}
          {recipe && recipe.length > 0 && (
            <div className="mt-2 flex flex-col gap-1.5">
              <span className="text-white font-medium text-sm">Recipe</span>
              {recipe.map((ing, i) => {
                const ingConfig = configs.entities[ing.item];
                const ingName = ingConfig?.metadata?.displayName || ing.item;
                return (
                  <div key={i} className="flex items-center gap-1.5">
                    {ingConfig?.metadata?.icon && (
                      <div className="relative shrink-0">
                        <Icon icon={ingConfig.metadata.icon} zoom={1.5} />
                        <span className="absolute -bottom-1 -right-1 bg-black/80 text-white leading-none rounded px-0.5 text-[10px]">
                          {ing.quantity}
                        </span>
                      </div>
                    )}
                    <span className="text-gray-300">{ingName}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </li>
  );
}
