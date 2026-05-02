import { useEffect, useState } from "react";
import EventBus from "../game/EventBus";
import { Event, Party, Death, PartyStatus } from "@server/types";
import { REVIVE_MANA } from "@server/globals";

export const PartyPanel = () => {
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [party, setParty] = useState<Party | null>(null);
  const [lobbies, setLobbies] = useState<Party[]>([]);
  const [dead, setDead] = useState<Set<string>>(new Set());
  const [inRealm, setInRealm] = useState(false);
  const [spectating, setSpectating] = useState<string | null>(null);

  useEffect(() => {
    const onDeath = (data: Death) =>
      setDead((prev) => new Set([...prev, data.id]));

    const onRevive = (data: { id: string }) => {
      setDead((prev) => {
        const next = new Set(prev);
        next.delete(data.id);
        return next;
      });

      if (data.id === playerId) setSpectating(null);
    };

    const onWipe = () => {
      setDead(new Set());
      setInRealm(false);
      setSpectating(null);
    };

    const onLeave = () => {
      setParty(null);
      onWipe();
    };

    const events = [
      [Event.PLAYER_CREATE_LOCAL, (id: string) => setPlayerId(id)],
      [Event.PARTY_LIST, (data: Party[]) => setLobbies(data)],
      [Event.PARTY_CREATE, (data: Party) => setParty(data)],
      [Event.PARTY_UPDATE, (data: Party) => {
        setParty(data);
        if (data.status === PartyStatus.LOBBY) setInRealm(false);
      }],
      [Event.PARTY_LEAVE, onLeave],
      [Event.PARTY_START_READY, () => setInRealm(true)],
      [Event.PLAYER_DEATH, onDeath],
      [Event.PLAYER_REVIVE, onRevive],
      [Event.PARTY_WIPE, onWipe],
    ] as const;

    for (const [event, handler] of events) EventBus.on(event, handler);

    return () => {
      for (const [event, handler] of events) EventBus.off(event, handler);
    };
  }, [playerId]);

  const isDead = playerId ? dead.has(playerId) : false;
  const alive = party?.members.filter((id) => !dead.has(id)) ?? [];

  const spectateNext = () => {
    if (!alive.length) return;
    const i = spectating ? alive.indexOf(spectating) : -1;
    const next = alive[(i + 1) % alive.length];
    setSpectating(next);
    EventBus.emit(Event.PLAYER_SPECTATE_REQUEST, next);
  };

  if (party && inRealm && dead.size > 0) {
    return (
      <div className="flex flex-col gap-4">
        <h3 className="text-white">Party</h3>
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
              {dead.has(id) && !isDead && (
                <button
                  className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
                  onClick={() => EventBus.emit(Event.PLAYER_REVIVE_REQUEST, id)}
                >
                  Revive ({REVIVE_MANA} mana)
                </button>
              )}
            </li>
          ))}
        </ul>
        {isDead && alive.length > 0 && (
          <button
            className="rounded bg-black/25 px-2 py-1 text-sm text-white hover:bg-black/50"
            onClick={spectateNext}
          >
            Spectate{spectating ? ` (${spectating.slice(0, 8)})` : ""}
          </button>
        )}
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
        <h3 className="text-white">Party</h3>
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
