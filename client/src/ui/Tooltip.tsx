import { useEffect, useState } from "react";
import EventBus from "../game/EventBus";
import { Event } from "@server/types";

interface TooltipData {
  text: string;
  x: number;
  y: number;
}

export function Tooltip() {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  useEffect(() => {
    const toggle = (data: TooltipData | null) => setTooltip(data);

    EventBus.on(Event.TOOLTIP_TOGGLE, toggle);

    return () => {
      EventBus.off(Event.TOOLTIP_TOGGLE, toggle);
    };
  }, []);

  if (!tooltip) return null;

  return (
    <div
      className="fixed pointer-events-none select-none -translate-x-1/2 -translate-y-full"
      style={{ left: tooltip.x, top: tooltip.y - 24 }}
    >
      <div className="px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap bg-black/70 text-white">
        {tooltip.text}
      </div>
    </div>
  );
}
