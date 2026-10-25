import { useEffect, useState } from "react";
import { Check, Lock } from "lucide-react";
import { EconomySnapshot, Event, ImprovementName } from "@server/types";
import { configs } from "@server/configs";
import EventBus from "../game/EventBus";
import { Item } from "./Item";

export function Improvements() {
  const [isOpen, setIsOpen] = useState(false);
  const [store, setStore] = useState<Record<string, number>>({});
  const [tier, setTier] = useState(1);
  const [owned, setOwned] = useState<ImprovementName[]>([]);

  useEffect(() => {
    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);
    const sync = (snapshot: Record<string, number>) => setStore(snapshot);
    const update = (snapshot: EconomySnapshot) => {
      setTier(snapshot.tier);
      setOwned(snapshot.improvements);
    };

    EventBus.on(Event.IMPROVEMENTS_OPEN, open);
    EventBus.on(Event.UI_TOGGLE, close);
    EventBus.on(Event.STORE_SYNC, sync);
    EventBus.on(Event.ECONOMY_UPDATE, update);

    return () => {
      EventBus.off(Event.IMPROVEMENTS_OPEN, open);
      EventBus.off(Event.UI_TOGGLE, close);
      EventBus.off(Event.STORE_SYNC, sync);
      EventBus.off(Event.ECONOMY_UPDATE, update);
    };
  }, []);

  if (!isOpen) return null;

  const entries = Object.entries(configs.improvements) as [
    ImprovementName,
    (typeof configs.improvements)[ImprovementName],
  ][];

  return (
    <div className="bg-black/25 rounded-lg p-4 self-start w-80">
      <h3 className="text-white mb-3">Improvements</h3>

      <ul className="flex flex-col gap-3">
        {entries.map(([name, improvement]) => {
          const isOwned = owned.includes(name);
          const locked = improvement.tier > tier;
          const affordable = improvement.cost.every(
            (req) => (store[req.item] ?? 0) >= req.quantity,
          );

          return (
            <li key={name} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-white text-sm">
                  {improvement.displayName}
                </span>
                {isOwned ? (
                  <span className="flex items-center gap-1 text-xs text-green-400">
                    <Check size={12} /> Built
                  </span>
                ) : locked ? (
                  <span className="flex items-center gap-1 text-xs text-white/40">
                    <Lock size={12} /> Tier {improvement.tier}
                  </span>
                ) : (
                  <button
                    disabled={!affordable}
                    onClick={() =>
                      EventBus.emit(Event.ECONOMY_IMPROVE, { name })
                    }
                    className="px-3 py-1 rounded bg-blue-600 text-white text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-500"
                  >
                    Build
                  </button>
                )}
              </div>
              <p className="text-white/50 text-xs">{improvement.description}</p>
              {!isOwned && (
                <ul className="flex flex-wrap gap-1">
                  {improvement.cost.map((req, i) => (
                    <Item
                      key={i}
                      name={req.item}
                      quantity={req.quantity}
                      disabled={locked || (store[req.item] ?? 0) < req.quantity}
                      hideWeight
                    />
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
