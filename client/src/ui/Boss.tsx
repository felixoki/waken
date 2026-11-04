import { useEffect, useState } from "react";
import EventBus from "../game/EventBus";
import { Event } from "@server/types";

interface BossData {
  name: string;
  health: number;
  maxHealth: number;
}

export function Boss() {
  const [boss, setBoss] = useState<BossData | null>(null);

  useEffect(() => {
    const handler = (data: BossData | null) => setBoss(data);

    EventBus.on(Event.BOSS_UPDATE, handler);

    return () => {
      EventBus.off(Event.BOSS_UPDATE, handler);
    };
  }, []);

  if (!boss) return null;

  const pct = Math.max(0, (boss.health / boss.maxHealth) * 100);

  return (
    <div className="fixed top-6 inset-x-0 z-30 flex justify-center pointer-events-none">
      <div className="w-[min(40rem,50vw)] flex flex-col items-center gap-1.5">
        <p
          className="text-white text-xl tracking-widest"
          style={{ textShadow: "0 2px 6px rgba(0,0,0,0.8)" }}
        >
          {boss.name}
        </p>
        <div className="relative w-full h-4 bg-gray-900/85 border border-black/70 rounded-xs overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-amber-100/70"
            style={{
              width: `${pct}%`,
              transition: "width 600ms ease-out 350ms",
            }}
          />
          <div
            className="absolute inset-y-0 left-0 bg-red-700"
            style={{ width: `${pct}%`, transition: "width 120ms ease-out" }}
          />
        </div>
      </div>
    </div>
  );
}
