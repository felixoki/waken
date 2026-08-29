import { useEffect, useState } from "react";
import EventBus from "../game/EventBus";
import { Event, Party, Death } from "@server/types";
import { levels } from "@server/configs/levels";
import { useParty } from "./useParty";

export const PartyPanel = () => {
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [lobbies, setLobbies] = useState<Party[]>([]);
  const [dead, setDead] = useState<Set<string>>(new Set());
  const { party, inRealm } = useParty();

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
      [Event.PARTY_LIST, (data: Party[]) => setLobbies(data)],
      [Event.PARTY_LEAVE, onWipe],
      [Event.PLAYER_DEATH, onDeath],
      [Event.PLAYER_REVIVE, onRevive],
      [Event.PARTY_WIPE, onWipe],
    ] as const;

    for (const [event, handler] of events) EventBus.on(event, handler);

    return () => {
      for (const [event, handler] of events) EventBus.off(event, handler);
    };
  }, [playerId]);

  if (party && inRealm && dead.size > 0) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white">Party</h3>
          <span
            className="rounded bg-black/25 px-2 py-0.5 text-xs text-white/70"
            title="Dream depth"
          >
            Depth {party.unlocked + 1}/{levels.length}
          </span>
        </div>
        <ul className="flex flex-col gap-1">
          {party.members.map((id) => (
            <li
              key={id}
              className="flex items-center justify-between text-white"
            >
              <span>
                {dead.has(id) ? <s>{id.slice(0, 8)}</s> : id.slice(0, 8)}
                {id === playerId && " (you)"}
              </span>
            </li>
          ))}
        </ul>
        <button
          className="rounded bg-black/25 px-2 py-1 text-white hover:bg-black/50"
          onClick={() => EventBus.emit(Event.PARTY_LEAVE_REQUEST)}
        >
          Leave
        </button>
      </div>
    );
  }

  if (party) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white">Party</h3>
          <span
            className="rounded bg-black/25 px-2 py-0.5 text-xs text-white/70"
            title="Dream depth"
          >
            Depth {party.unlocked + 1}/{levels.length}
          </span>
        </div>
        <ul className="flex flex-col gap-1">
          {party.members.map((id) => (
            <li key={id} className="text-sm text-white">
              {id.slice(0, 8)}
              {id === playerId && " (you)"}
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          {party.leader === playerId && !inRealm && (
            <button
              className="rounded text-white bg-blue-600 px-2 py-1 hover:bg-blue-700"
              onClick={() => EventBus.emit(Event.PARTY_START_REQUEST)}
            >
              Start
            </button>
          )}
          <button
            className="rounded bg-black/25 px-2 py-1 text-white hover:bg-black/50"
            onClick={() => EventBus.emit(Event.PARTY_LEAVE_REQUEST)}
          >
            Leave
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {lobbies.length > 0 ? (
        <>
          <h3 className="text-white">Parties</h3>
          <ul className="flex flex-col gap-2">
            {lobbies.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between text-sm text-white"
              >
                {p.id.slice(0, 8)} ({p.members.length})
                <button
                  className="rounded bg-black/25 px-2 py-1 text-xs text-white hover:bg-black/50"
                  onClick={() => EventBus.emit(Event.PARTY_JOIN_REQUEST, p.id)}
                >
                  Join
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <span className="text-white">No parties available</span>
      )}
      <button
        className="rounded bg-blue-600 px-2 py-1 text-white font-medium hover:bg-blue-700"
        onClick={() => EventBus.emit(Event.PARTY_CREATE_REQUEST)}
      >
        Create party
      </button>
    </div>
  );
};
