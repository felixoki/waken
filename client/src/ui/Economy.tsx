import { useEffect, useState } from "react";
import EventBus from "../game/EventBus";
import {
  ComponentName,
  EconomySnapshot,
  EntityName,
  Event,
  GroupName,
  Mood,
  NeedName,
} from "@server/types";
import { MAX_STACK } from "@server/globals";
import { TierUpgrade } from "@server/configs/tiers";
import { configs } from "@server/configs";
import { Item } from "./Item";

type Entry =
  EconomySnapshot["needs"][number]["groups"][number]["items"][number];

const moods: Record<Mood, string> = {
  [Mood.HAPPY]: "Content",
  [Mood.HUNGRY]: "Hungry",
  [Mood.THIRSTY]: "Thirsty",
  [Mood.COLD]: "Cold",
  [Mood.SLEEPLESS]: "Sleepless",
};

const groups: Record<GroupName, string> = {
  [GroupName.FRUIT]: "Fruit",
  [GroupName.PROTEIN]: "Protein",
  [GroupName.VEGETABLES]: "Vegetables",
  [GroupName.BAKED]: "Baked goods",
  [GroupName.MILK]: "Milk",
  [GroupName.ALCOHOL]: "Alcohol",
  [GroupName.CLOTHING]: "Clothing",
  [GroupName.LIGHT]: "Light",
  [GroupName.BEDDING]: "Bedding",
  [GroupName.MATERIALS]: "Materials",
  [GroupName.ANIMAL_PARTS]: "Animal parts",
  [GroupName.RARE]: "Rare",
  [GroupName.FLOWERS]: "Flowers",
  [GroupName.HERBS]: "Herbs",
  [GroupName.CROPS]: "Crops",
  [GroupName.FUNGI]: "Fungi",
};

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
  const need = snapshot.needs.find((need) => need.name === active);
  const isContent = snapshot.mood === Mood.HAPPY;
  const nextTier = snapshot.tier + 1;
  const upgradeConfig: TierUpgrade | undefined = configs.tiers.find(
    (tier) => tier.tier === nextTier,
  );
  const canAffordUpgrade =
    !!upgradeConfig &&
    snapshot.canUpgrade &&
    upgradeConfig.requirements.every(
      (req) => (store[req.item] ?? 0) >= req.quantity,
    );

  const upgradeEconomy = () => {
    EventBus.emit(Event.ECONOMY_UPGRADE);
  };

  const renderItem = (entry: Entry, i: number) => {
    const locked = entry.tier > snapshot.tier;
    const hidden = locked && !!need?.consumed;
    const definition = configs.entities[entry.item];
    const soul = definition?.components.some(
      (component) => component.name === ComponentName.CAPTURABLE,
    );

    return (
      <Item
        key={i}
        name={soul ? EntityName.SOULSTONE : entry.item}
        title={
          soul
            ? `${definition?.metadata?.displayName ?? entry.item} soul`
            : undefined
        }
        bar={hidden ? undefined : entry.quantity}
        barMax={MAX_STACK}
        barLabel={hidden ? undefined : `${entry.quantity}/${MAX_STACK}`}
        disabled={locked}
        hint={locked ? `Unlock with tier ${entry.tier}` : undefined}
        hideWeight
      />
    );
  };

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-black/10 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white">Economy</h3>
        <span className="flex items-center gap-1.5 text-sm text-white/70">
          <span
            className={`w-2 h-2 rounded-full ${isContent ? "bg-green-400" : "bg-amber-400"}`}
          />
          {moods[snapshot.mood]}
        </span>
      </div>

      <div className="flex mb-3 bg-black/20 rounded-lg p-0.5 gap-0.5">
        {snapshot.needs.map(({ name, met }) => (
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
            {!met && <span className="ml-1 text-amber-400">•</span>}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {need?.groups
          .filter((group) => group.items.length)
          .map((group) => (
            <div key={group.name}>
              <p className="flex justify-between text-xs mb-1 text-white/70">
                <span>{groups[group.name]}</span>
                {need.consumed && (
                  <span
                    className={
                      !group.required
                        ? "text-white/30"
                        : group.met
                          ? "text-green-400"
                          : "text-amber-400"
                    }
                  >
                    {!group.required
                      ? "Not needed yet"
                      : `${group.stocked} of ${group.needed}`}
                  </span>
                )}
              </p>
              <ul className="grid grid-cols-[repeat(6,4rem)] gap-1">
                {group.items.map((entry, i) => renderItem(entry, i))}
              </ul>
            </div>
          ))}
      </div>

      {need?.consumed && (
        <p className="text-white/50 text-xs mt-2">
          These items are consumed by your villagers
        </p>
      )}

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
                hideWeight
              />
            ))}
          </ul>
          {!snapshot.canUpgrade && (
            <p className="text-white/50 text-xs mb-2">
              Every villager need must be stocked first
            </p>
          )}
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
