import { useEffect, useState } from "react";
import EventBus from "../game/EventBus";
import { EconomySnapshot, Event, NeedName } from "@server/types";
import { MAX_STACK } from "@server/globals";
import { TierUpgrade } from "@server/configs/tiers";
import { configs } from "@server/configs";
import { Item } from "./Item";

export function Economy() {
  const [snapshot, setSnapshot] = useState<EconomySnapshot | null>(null);
  const [store, setStore] = useState<Record<string, number>>({});
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<NeedName | null>(null);

  useEffect(() => {
    const handler = (data: EconomySnapshot) => setSnapshot(data);
    const sync = (data: Record<string, number>) => setStore(data);
    const toggle = () => setIsOpen((prev) => !prev);

    EventBus.on(Event.ECONOMY_UPDATE, handler);
    EventBus.on(Event.STORE_SYNC, sync);
    EventBus.on(Event.UI_TOGGLE, toggle);

    return () => {
      EventBus.off(Event.ECONOMY_UPDATE, handler);
      EventBus.off(Event.STORE_SYNC, sync);
      EventBus.off(Event.UI_TOGGLE, toggle);
    };
  }, []);

  if (!isOpen || !snapshot?.needs.length) return null;

  const categories = snapshot.needs.map((need) => need.name);
  const active =
    activeTab && categories.includes(activeTab) ? activeTab : categories[0];
  const items =
    snapshot.needs.find((need) => need.name === active)?.items ?? [];
  const nextTier = snapshot.tier + 1;
  const upgradeConfig: TierUpgrade | undefined = configs.tiers.find(
    (tier) => tier.tier === nextTier,
  );
  const canAffordUpgrade =
    !!upgradeConfig &&
    upgradeConfig.requirements.every(
      (req) => (store[req.item] ?? 0) >= req.quantity,
    );

  const upgradeEconomy = () => {
    EventBus.emit(Event.COLLECTOR_TIER_UPGRADE);
  };

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-black/10 rounded-lg">
      <h3 className="text-white mb-2">Economy</h3>

      <div className="flex mb-3 bg-black/20 rounded-lg p-0.5 gap-0.5">
        {categories.map((name) => (
          <button
            key={name}
            onClick={() => setActiveTab(name)}
            className={`flex-1 px-3 py-1.5 rounded-md text-sm capitalize transition-colors ${
              name === active
                ? "bg-white/20 text-white"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <ul className="grid grid-cols-[repeat(6,4rem)] gap-1 justify-center">
        {items.map((entry, i) => (
          <Item
            key={i}
            name={entry.item}
            bar={entry.quantity}
            barMax={MAX_STACK}
            barLabel={`${entry.quantity}/${MAX_STACK}`}
          />
        ))}
      </ul>

      {upgradeConfig && (
        <div className="mt-4 pt-3">
          <p className="text-white/70 text-sm mb-2">Unlock tier {nextTier}:</p>
          <ul className="flex flex-wrap gap-1 mb-3">
            {upgradeConfig.requirements.map((req, i) => (
              <Item
                key={i}
                name={req.item}
                quantity={req.quantity}
                disabled={(store[req.item] ?? 0) < req.quantity}
              />
            ))}
          </ul>
          <button
            disabled={!canAffordUpgrade}
            onClick={upgradeEconomy}
            className="px-4 py-2 rounded bg-blue-600 text-white text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-500"
          >
            Upgrade to Tier {nextTier}
          </button>
        </div>
      )}
    </div>
  );
}
