import { useEffect, useRef, useState } from "react";
import EventBus from "../game/EventBus";
import { Event } from "@server/types";

const FADE_MS = 300;
const TIP_MS = 10_000;

const tips = [
  "Shadow wanderers will only strike if you attack first.",
  "If you die or leave your party in the realm, you lose your inventory.",
  "Look for nearby caves if you come across trolls. They often stash treasure there.",
  "The herbalist can help you reach deeper dream levels with potions."
];

function randomTip(exclude?: string) {
  const pool = tips.filter((t) => t !== exclude);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function Loading() {
  const [visible, setVisible] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [tip, setTip] = useState(randomTip);
  const interval = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    const show = (opts?: { tips?: boolean }) => {
      const withTips = opts?.tips === true;
      setShowTips(withTips);
      if (withTips) setTip(randomTip());
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900"
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity ${FADE_MS}ms ease-in-out`,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {showTips && visible && <p className="text-white text-2xl animate-pulse">{tip}</p>}
    </div>
  );
}
