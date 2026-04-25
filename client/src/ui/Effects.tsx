import { useEffect, useState } from "react";
import EventBus from "../game/EventBus";
import { Effect, EffectName, Event } from "@server/types";

function useNow(interval = 100) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(id);
  }, [interval]);
  return now;
}

export function Effects() {
  const [effects, setEffects] = useState<Map<EffectName, Effect>>(new Map());
  const now = useNow();

  useEffect(() => {
    const onApply = (effect: Effect) => {
      setEffects((prev) => new Map(prev).set(effect.name, effect));
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
    <div className="fixed bottom-20 right-4 flex flex-col gap-1">
      {active.map((effect) => {
        const remaining = Math.ceil((effect.expiresAt - now) / 1000);
        return (
          <div
            key={effect.name}
            className="flex items-center gap-2 bg-black/50 rounded px-2 py-1 text-xs text-white font-mono"
          >
            <span className="capitalize">{effect.name}</span>
            <span className="text-white/50">{remaining}s</span>
          </div>
        );
      })}
    </div>
  );
}
