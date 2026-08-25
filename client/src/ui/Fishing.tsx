import { useEffect, useRef, useState } from "react";
import { Event } from "@server/types";
import { REEL_METER_START } from "@server/globals";
import EventBus from "../game/EventBus";

interface Start {
  bar: number;
}

interface Update {
  bar: number;
  fish: number;
  meter: number;
  on: boolean;
}

export const Fishing = () => {
  const [start, setStart] = useState<Start | null>(null);
  const [meter, setMeter] = useState(REEL_METER_START);
  const [on, setOn] = useState(false);

  const barRef = useRef<HTMLDivElement>(null);
  const fishRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const onStart = (data: Start) => {
      setStart(data);
      setMeter(REEL_METER_START);
      setOn(false);
    };

    const onUpdate = (data: Update) => {
      if (barRef.current)
        barRef.current.style.left = `${data.bar * 100}%`;
      if (fishRef.current)
        fishRef.current.style.left = `${data.fish * 100}%`;

      setMeter(data.meter);
      setOn(data.on);
    };

    const onEnd = () => setStart(null);

    EventBus.on(Event.FISHING_MINIGAME_START, onStart);
    EventBus.on(Event.FISHING_MINIGAME_UPDATE, onUpdate);
    EventBus.on(Event.FISHING_MINIGAME_END, onEnd);

    return () => {
      EventBus.off(Event.FISHING_MINIGAME_START, onStart);
      EventBus.off(Event.FISHING_MINIGAME_UPDATE, onUpdate);
      EventBus.off(Event.FISHING_MINIGAME_END, onEnd);
    };
  }, []);

  if (!start) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-200 max-w-[90vw] bg-black/25 rounded-lg p-8 flex flex-col gap-4 select-none pointer-events-none">
      <div className="relative h-14 bg-gray-800 rounded-md overflow-hidden">
        <div
          ref={barRef}
          className={`absolute top-0 bottom-0 -translate-x-1/2 rounded ${
            on ? "bg-green-600/70" : "bg-red-600/50"
          }`}
          style={{ left: "50%", width: `${start.bar * 200}%` }}
        />
        <img
          ref={fishRef}
          src="./assets/sprites/fish_placeholder.png"
          alt=""
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-none"
          style={{ left: "50%", width: 96, height: 96, imageRendering: "pixelated" }}
        />
      </div>

      <div className="h-6 bg-gray-800 rounded-md overflow-hidden">
        <div
          className={`h-full rounded ${on ? "bg-green-500" : "bg-amber-500"}`}
          style={{ width: `${meter}%` }}
        />
      </div>
    </div>
  );
};
