import { ReactNode, useEffect, useState } from "react";
import EventBus from "../game/EventBus";
import { useEscape } from "./escape";
import { Event, Party as PartyData, Death, Item } from "@server/types";
import { configs } from "@server/configs";
import { levels } from "@server/configs/levels";
import { useParty } from "./useParty";

const Screen = ({ children }: { children: ReactNode }) => (
  <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
    <div className="pointer-events-auto flex max-h-[80vh] w-[min(40rem,calc(100vw-2rem))] flex-col gap-6 rounded-xl bg-black/60 p-8">
      {children}
    </div>
  </div>
);

const Header = ({ party }: { party: PartyData }) => (
  <div className="flex items-center justify-between">
    <h3 className="text-2xl text-white">Party</h3>
    <span
      className="rounded-lg bg-white/10 px-3 py-1 text-base text-white/70"
      title="Dream depth"
    >
      Depth{" "}
      {levels.filter((l) => (l.requires ?? 0) <= party.unlocked).length}/
      {levels.length}
    </span>
  </div>
);

const Members = ({
  party,
  playerId,
  dead,
}: {
  party: PartyData;
  playerId: string | null;
  dead: Set<string>;
}) => (
  <ul className="flex flex-col gap-2 overflow-y-auto">
    {party.members.map((id) => (
      <li
        key={id}
        className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3 text-lg text-white"
      >
        <span>
          {dead.has(id) ? <s>{id.slice(0, 8)}</s> : id.slice(0, 8)}
          {id === playerId && " (you)"}
        </span>
        {id === party.leader && (
          <span className="text-sm text-white/50">leader</span>
        )}
      </li>
    ))}
  </ul>
);

const Leave = ({ event }: { event: Event }) => (
  <button
    className="rounded-lg bg-white/10 px-6 py-3 text-lg text-white hover:bg-white/20"
    onClick={() => EventBus.emit(event)}
  >
    Leave
  </button>
);

const RealmLeave = ({ items }: { items: (Item | null)[] }) => {
  const [warning, setWarning] = useState(false);

  const loses =
    items.some(Boolean) &&
    !items.some((item) => item && configs.entities[item.name]?.modifier?.keep);

  if (!warning || !loses)
    return (
      <button
        className="rounded-lg bg-white/10 px-6 py-3 text-lg text-white hover:bg-white/20"
        onClick={() =>
          loses ? setWarning(true) : EventBus.emit(Event.PARTY_LEAVE_REQUEST)
        }
      >
        Leave
      </button>
    );

  return (
    <div className="flex flex-col gap-3">
      <span className="text-lg text-white/80">
        You'll wake with empty hands. Everything you carry stays in the dream.
      </span>
      <div className="flex gap-3">
        <button
          className="flex-1 rounded-lg bg-red-700 px-6 py-3 text-lg font-medium text-white hover:bg-red-800"
          onClick={() => EventBus.emit(Event.PARTY_LEAVE_REQUEST)}
        >
          Leave anyway
        </button>
        <button
          className="flex-1 rounded-lg bg-white/10 px-6 py-3 text-lg text-white hover:bg-white/20"
          onClick={() => setWarning(false)}
        >
          Stay
        </button>
      </div>
    </div>
  );
};

export const Party = () => {
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [dead, setDead] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<(Item | null)[]>([]);
  const { party, lobbies, inRealm, asleep } = useParty();

  useEffect(() => {
    const onDeath = (data: Death) =>
      setDead((prev) => new Set([...prev, data.id]));

    const onRevive = (data: { id: string }) => {
      setDead((prev) => {
        const next = new Set(prev);
        next.delete(data.id);
        return next;
      });
    };

    const onWipe = () => setDead(new Set());

    const events = [
      [Event.PLAYER_CREATE_LOCAL, (id: string) => setPlayerId(id)],
      [Event.PARTY_LEAVE, onWipe],
      [Event.PLAYER_DEATH, onDeath],
      [Event.PLAYER_REVIVE, onRevive],
      [Event.PARTY_WIPE, onWipe],
      [Event.INVENTORY_UPDATE, (next: (Item | null)[]) => setItems(next)],
    ] as const;

    for (const [event, handler] of events) EventBus.on(event, handler);

    return () => {
      for (const [event, handler] of events) EventBus.off(event, handler);
    };
  }, []);

  useEffect(() => {
    if (!inRealm) setOpen(false);
  }, [inRealm]);

  useEscape(open && !!party && inRealm, () => setOpen(false));

  if (party && inRealm)
    return (
      <>
        <button
          className="fixed top-6 right-4 flex items-center gap-2 rounded-lg bg-black/40 px-4 py-2 text-base text-white hover:bg-black/60"
          onClick={() => setOpen((prev) => !prev)}
        >
          <span className="size-2.5 rounded-full bg-green-500" />
          Party
        </button>
        {open && (
          <Screen>
            <Header party={party} />
            <Members party={party} playerId={playerId} dead={dead} />
            <RealmLeave items={items} />
          </Screen>
        )}
      </>
    );

  if (!asleep) return null;

  if (party)
    return (
      <Screen>
        <Header party={party} />
        <Members party={party} playerId={playerId} dead={dead} />
        <div className="flex gap-3">
          {party.leader === playerId ? (
            <button
              className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-lg font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-black/25 disabled:text-white/40"
              disabled={
                !party.members.length ||
                (party.ready?.length ?? 0) < party.members.length
              }
              onClick={() => EventBus.emit(Event.PARTY_START_REQUEST)}
            >
              Start
            </button>
          ) : (
            <span className="flex-1 self-center text-lg text-white/50">
              Waiting for the leader…
            </span>
          )}
          <Leave event={Event.PLAYER_WAKE_REQUEST} />
        </div>
      </Screen>
    );

  return (
    <Screen>
      <h3 className="text-2xl text-white">Parties</h3>
      {lobbies.length > 0 ? (
        <ul className="flex flex-col gap-2 overflow-y-auto">
          {lobbies.map((p) => (
            <li key={p.id}>
              <button
                className="flex w-full items-center justify-between rounded-lg bg-white/5 px-4 py-4 text-lg text-white hover:bg-white/15"
                onClick={() => EventBus.emit(Event.PARTY_JOIN_REQUEST, p.id)}
              >
                <span>
                  {p.id.slice(0, 8)}
                  <span className="ml-3 text-white/50">
                    {p.members.length}{" "}
                    {p.members.length === 1 ? "player" : "players"}
                  </span>
                </span>
                <span className="rounded-lg bg-blue-600 px-4 py-1.5 text-base font-medium">
                  Join
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <span className="text-lg text-white/60">No parties available</span>
      )}
      <button
        className="rounded-lg bg-white/10 px-6 py-3 text-lg font-medium text-white hover:bg-white/20"
        onClick={() => EventBus.emit(Event.PARTY_CREATE_REQUEST)}
      >
        Create party
      </button>
    </Screen>
  );
};
