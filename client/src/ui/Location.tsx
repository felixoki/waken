import { useEffect, useRef, useState } from "react";
import EventBus from "../game/EventBus";
import { Event } from "@server/types";
import { LOCATION_HOLD } from "@server/globals";

const FADE_MS = 600;

export function Location() {
  const [label, setLabel] = useState<string>();
  const [visible, setVisible] = useState(false);
  const pending = useRef<string>();
  const covered = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const show = (next: string) => {
      clearTimeout(timer.current);
      setLabel(next);
      setVisible(true);
      timer.current = setTimeout(() => setVisible(false), LOCATION_HOLD);
    };

    const locate = (next: string) => {
      if (covered.current) pending.current = next;
      else show(next);
    };

    const cover = () => {
      covered.current = true;
      clearTimeout(timer.current);
      setVisible(false);
    };

    const reveal = () => {
      covered.current = false;
      if (!pending.current) return;

      show(pending.current);
      pending.current = undefined;
    };

    EventBus.on(Event.LOCATION, locate);
    EventBus.on(Event.FADE_OUT, cover);
    EventBus.on(Event.FADE_IN, reveal);

    return () => {
      clearTimeout(timer.current);
      EventBus.off(Event.LOCATION, locate);
      EventBus.off(Event.FADE_OUT, cover);
      EventBus.off(Event.FADE_IN, reveal);
    };
  }, []);

  return (
    <div className="fixed top-16 inset-x-0 z-40 flex justify-center pointer-events-none">
      <p
        className="text-white text-4xl tracking-wide"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(-6px)",
          transition: `opacity ${FADE_MS}ms ease-in-out, transform ${FADE_MS}ms ease-out`,
          textShadow: "0 2px 8px rgba(0,0,0,0.7)",
        }}
      >
        {label}
      </p>
    </div>
  );
}
