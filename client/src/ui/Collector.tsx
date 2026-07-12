import { useEffect, useRef, useState } from "react";
import { Lock } from "lucide-react";
import { EntityName, EconomySnapshot, Event } from "@server/types";
import { Recipe } from "@server/types/collectors";
import { configs } from "@server/configs";
import EventBus from "../game/EventBus";
import { Item } from "./Item";

interface CollectorData {
  entityId: string;
  entityName: EntityName;
}

export function Collector() {
  const [data, setData] = useState<CollectorData | null>(null);
  const [store, setStore] = useState<Record<string, number>>({});
  const [tier, setTier] = useState(1);
  const [activeTab, setActiveTab] = useState(1);
  const dataRef = useRef<CollectorData | null>(null);

  useEffect(() => {
    const open = (payload: CollectorData) => {
      dataRef.current = payload;
      setData(payload);
      setActiveTab(1);
    };

    const sync = (snapshot: Record<string, number>) => {
      setStore(snapshot);
    };

    const update = (snapshot: EconomySnapshot) => {
      setTier(snapshot.tier);
    };

    const end = (entityId: string) => {
      if (dataRef.current?.entityId === entityId) {
        dataRef.current = null;
        setData(null);
      }
    };

    const toggle = () => {
      dataRef.current = null;
      setData(null);
    };

    EventBus.on(Event.COLLECTOR_OPEN, open);
    EventBus.on(Event.STORE_SYNC, sync);
    EventBus.on(Event.ECONOMY_UPDATE, update);
    EventBus.on(Event.ENTITY_DIALOGUE_END, end);
    EventBus.on(Event.UI_TOGGLE, toggle);

    return () => {
      EventBus.off(Event.COLLECTOR_OPEN, open);
      EventBus.off(Event.STORE_SYNC, sync);
      EventBus.off(Event.ECONOMY_UPDATE, update);
      EventBus.off(Event.ENTITY_DIALOGUE_END, end);
      EventBus.off(Event.UI_TOGGLE, toggle);
    };
  }, []);

  if (!data) return null;

  const entityDef = configs.entities[data.entityName];
  const collectorComp = entityDef?.components.find(
    (c) => c.name === "collector",
  ) as { name: string; config: { recipes: Recipe[] } } | undefined;

  const recipes: Recipe[] = collectorComp?.config?.recipes ?? [];

  const maxTier = Math.max(
    1,
    tier,
    ...recipes.map((r) => r.tier),
  );

  const canAffordIngredients = (ingredients: Recipe["ingredients"]): boolean =>
    ingredients.every(
      (ing) => (store[ing.item] ?? 0) >= ing.quantity,
    );

  const craft = (recipe: Recipe) => {
    if (!data) return;

    EventBus.emit(Event.COLLECTOR_CRAFT, {
      entityId: data.entityId,
      output: recipe.output,
    });
  };

  const tabs = Array.from({ length: maxTier }, (_, i) => i + 1);

  const displayName =
    entityDef?.metadata?.displayName ?? data.entityName;

  return (
    <div className="bg-black/25 rounded-lg p-4 self-start min-w-72">
      <h3 className="text-white mb-3">{displayName}</h3>

      <div className="flex mb-3 bg-black/20 rounded-lg p-0.5 gap-0.5">
        {tabs.map((t) => {
          const locked = t > tier;
          const active = activeTab === t;
          return (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-sm transition-colors ${
                active
                  ? "bg-white/20 text-white"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              {locked && <Lock size={12} className="opacity-60" />}
              <span>Tier {t}</span>
            </button>
          );
        })}
      </div>

      <ul className="flex flex-wrap gap-1">
        {recipes
          .filter((r) => r.tier === activeTab)
          .map((recipe, i) => {
            const locked = recipe.tier > tier;
            const affordable = !locked && canAffordIngredients(recipe.ingredients);
            return (
              <Item
                key={i}
                name={recipe.output}
                quantity={recipe.quantity}
                recipe={recipe.ingredients}
                disabled={locked || !affordable}
                onClick={!locked && affordable ? () => craft(recipe) : undefined}
              />
            );
          })}
        {recipes.filter((r) => r.tier === activeTab).length === 0 && (
          <p className="text-white/50 text-sm">No recipes at this tier</p>
        )}
      </ul>
    </div>
  );
}
