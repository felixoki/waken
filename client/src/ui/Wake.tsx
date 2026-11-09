import { useEffect, useRef, useState } from "react";
import EventBus from "../game/EventBus";
import { Event, type Death, type EntityName, type Wipe } from "@server/types";
import { configs } from "@server/configs";
import { TOAST_HOLD, WAKE_FADE, WAKE_FADE_IN } from "@server/globals";
import { Icon } from "./Icon";

type Shown = Wipe & { duration: number };

const stacks = (lost: Wipe["lost"]): [EntityName, number][] => {
  const totals = new Map<EntityName, number>();
  for (const item of lost)
    totals.set(item.name, (totals.get(item.name) ?? 0) + item.quantity);
  return [...totals];
};

const Lost = ({ lost }: { lost: Wipe["lost"] }) => (
  <div className="flex flex-wrap justify-center gap-2 max-w-3xl">
    {stacks(lost).map(([name, quantity]) => {
      const icon = configs.entities[name]?.metadata?.icon;
      return (
        <div key={name} className="relative rounded-md bg-black/40 p-1 opacity-70">
          {icon && <Icon icon={icon} zoom={4} />}
          {quantity > 1 && (
            <span className="absolute bottom-0 right-1 text-lg text-white tabular-nums">
              {quantity}
            </span>
          )}
        </div>
      );
    })}
  </div>
);

export function Wake() {
  const [downed, setDowned] = useState(false);
  const [wipe, setWipe] = useState<Shown | null>(null);
  const [leaving, setLeaving] = useState(false);
  const playerId = useRef<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const clear = () => {
      for (const timer of timers.current) clearTimeout(timer);
      timers.current = [];
    };

    const onLocal = (id: string) => {
      playerId.current = id;
    };

    const onDeath = (data: Death) => {
      if (data.id === playerId.current) setDowned(true);
    };

    const onRevive = (data: { id: string }) => {
      if (data.id === playerId.current) setDowned(false);
    };

    const onLeave = () => setDowned(false);

    const onWipe = (data: Shown) => {
      clear();
      setDowned(false);
      setLeaving(false);
      setWipe(data);

      const duration = Math.max(data.duration, TOAST_HOLD);
      timers.current.push(
        setTimeout(() => setLeaving(true), duration - WAKE_FADE),
        setTimeout(() => setWipe(null), duration),
      );
    };

    const events = [
      [Event.PLAYER_CREATE_LOCAL, onLocal],
      [Event.PLAYER_DEATH, onDeath],
      [Event.PLAYER_REVIVE, onRevive],
      [Event.PARTY_LEAVE, onLeave],
      [Event.PARTY_WIPE, onWipe],
    ] as const;

    for (const [event, handler] of events) EventBus.on(event, handler);

    return () => {
      clear();
      for (const [event, handler] of events) EventBus.off(event, handler);
    };
  }, []);

  if (wipe)
    return (
      <div
        className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-8 bg-black pointer-events-none"
        style={{
          animation: `fade-in ${WAKE_FADE_IN}ms ease-out`,
          opacity: leaving ? 0 : 1,
          transition: `opacity ${WAKE_FADE}ms ease-in`,
        }}
      >
        <p
          className="text-white text-7xl tracking-wide"
        >
          You wake up
        </p>
        {wipe.kept && (
          <p className="text-white/60 text-3xl">
            You held on to everything you carried
          </p>
        )}
        {!!wipe.lost.length && (
          <>
            <p className="text-white/60 text-3xl">
              What you carried stayed in the dream
            </p>
            <Lost lost={wipe.lost} />
          </>
        )}
      </div>
    );

  if (!downed) return null;

  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center pb-32 pointer-events-none"
      style={{
        animation: `fade-in ${WAKE_FADE}ms ease-out`,
        background:
          "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)",
      }}
    >
      <div className="flex flex-col items-center gap-1 text-white">
        <p className="text-2xl tracking-wide">You've fallen</p>
        <p className="text-white/60 text-base">
          Your party can still bring you back
        </p>
      </div>
    </div>
  );
}
