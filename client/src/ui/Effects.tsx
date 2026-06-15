import { useEffect, useState } from "react";
import EventBus from "../game/EventBus";
import { Effect, EffectName, Event } from "@server/types";

function useNow(active: boolean, interval = 100) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(id);
  }, [active, interval]);
  return now;
}

interface TrackedEffect extends Effect {
  appliedAt: number;
}

export function Effects() {
  const [effects, setEffects] = useState<Map<EffectName, TrackedEffect>>(new Map());
  const now = useNow(effects.size > 0);

  useEffect(() => {
    const onApply = (effect: Effect) => {
      setEffects((prev) => {
        const existing = prev.get(effect.name);
        const appliedAt = existing && existing.expiresAt === effect.expiresAt ? existing.appliedAt : Date.now();
        return new Map(prev).set(effect.name, { ...effect, appliedAt });
      });
    };

    const onRemove = (name: EffectName) => {
      setEffects((prev) => {
        const next = new Map(prev);
        next.delete(name);
        return next;
      });
    };

    EventBus.on(Event.EFFECT_APPLY, onApply);
    EventBus.on(Event.EFFECT_REMOVE, onRemove);

    return () => {
      EventBus.off(Event.EFFECT_APPLY, onApply);
      EventBus.off(Event.EFFECT_REMOVE, onRemove);
    };
  }, []);

  const active = [...effects.values()].filter((e) => e.expiresAt > now);
  if (!active.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {active.map((effect) => {
        const remaining = Math.ceil((effect.expiresAt - now) / 1000);
        return (
          <div
            key={effect.name}
            className="flex items-center gap-3 bg-black/60 backdrop-blur-sm rounded-md px-3 py-2 text-base text-white font-mono border border-white/10"
          >
            <span className="capitalize font-semibold">{effect.name}</span>
            <span className="text-white/60">{remaining}s</span>
          </div>
        );
      })}
    </div>
  );
}
