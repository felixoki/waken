import { useEffect, useRef, useState } from "react";
import EventBus from "../game/EventBus";
import { Event, MapName } from "@server/types";

const FADE_MS = 300;
const TIP_MS = 10_000;

const backdrops: Partial<Record<MapName, string>> = {
  [MapName.FOREST]: "forest_glade.png",
  [MapName.DUNGEON]: "dungeon_corridor.png",
};

const tips = [
  "Shadow wanderers will only strike if you attack first.",
  "If you die or leave your party in the realm, you lose your inventory.",
  "Look for nearby caves if you come across trolls. They often stash treasure there.",
  "The herbalist can help you reach deeper dream levels with potions.",
  "You get vials from the glassblower. They can be used to store potions.",
  "If villagers aren't happy, they are less likely to give you quests or tell you important information.",
];

function randomTip(exclude?: string) {
  const pool = tips.filter((t) => t !== exclude);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function Loading() {
  const [visible, setVisible] = useState(true);
  const [showTips, setShowTips] = useState(false);
  const [tip, setTip] = useState(randomTip);
  const [map, setMap] = useState<MapName>(MapName.FOREST);
  const interval = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    const show = (opts?: { tips?: boolean; map?: MapName }) => {
      const hasTips = opts?.tips === true;
      setShowTips(hasTips);
      if (hasTips) setTip(randomTip());
      if (opts?.map) setMap(opts.map);
      setVisible(true);
    };

    const hide = () => setVisible(false);

    EventBus.on(Event.LOADING_SHOW, show);
    EventBus.on(Event.LOADING_HIDE, hide);

    return () => {
      EventBus.off(Event.LOADING_SHOW, show);
      EventBus.off(Event.LOADING_HIDE, hide);
    };
  }, []);

  useEffect(() => {
    clearInterval(interval.current);

    if (showTips && visible)
      interval.current = setInterval(() => setTip(randomTip), TIP_MS);

    return () => clearInterval(interval.current);
  }, [showTips, visible]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-cover bg-center"
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity ${FADE_MS}ms ease-in-out`,
        pointerEvents: visible ? "auto" : "none",
        backgroundImage: showTips
          ? `url('./assets/images/${backdrops[map] ?? "forest_glade.png"}')`
          : undefined,
      }}
    >
      {showTips && visible && (
        <p
          className="px-8 py-4 text-white text-2xl text-center animate-pulse"
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}
        >
          {tip}
        </p>
      )}
    </div>
  );
}
