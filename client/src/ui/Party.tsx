import { useEffect, useState } from "react";
import EventBus from "../game/EventBus";
import { Party, Death } from "@server/types";
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
      ["player:create:local", (id: string) => setPlayerId(id)],
      ["party:list", (data: Party[]) => setLobbies(data)],
      ["party:create", (data: Party) => setParty(data)],
      ["party:update", (data: Party) => setParty(data)],
      ["party:leave", onLeave],
      ["party:start:ready", () => setInRealm(true)],
      ["player:death", onDeath],
      ["player:revive", onRevive],
      ["party:wipe", onWipe],
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
    EventBus.emit("player:spectate:request", next);
  };

  if (party && inRealm && dead.size > 0) {
    return (
      <div className="flex flex-col gap-2 rounded-lg bg-gray-200 p-4">
        <p className="text-sm font-bold">Party</p>
        <ul className="flex flex-col gap-1">
          {party.members.map((id) => (
            <li key={id} className="flex items-center gap-2 text-sm">
              {dead.has(id) ? <s>{id.slice(0, 8)}</s> : id.slice(0, 8)}
              {id === playerId && " (you)"}
              {dead.has(id) && !isDead && (
                <button
                  className="rounded bg-gray-300 px-2 py-0.5 text-xs hover:bg-gray-400"
                  onClick={() => EventBus.emit("player:revive:request", id)}
                >
                  Revive ({REVIVE_MANA} mana)
                </button>
              )}
            </li>
          ))}
        </ul>
        {isDead && alive.length > 0 && (
          <button
            className="rounded bg-gray-300 px-2 py-1 text-sm hover:bg-gray-400"
            onClick={spectateNext}
          >
            Spectate{spectating ? ` (${spectating.slice(0, 8)})` : ""}
          </button>
        )}
      </div>
    );
  }

  if (party) {
    return (
      <div className="flex flex-col gap-2 rounded-lg bg-gray-200 p-4">
        <p className="text-sm font-bold">Party</p>
        <ul className="flex flex-col gap-1">
          {party.members.map((id) => (
            <li key={id} className="text-sm">{id.slice(0, 8)}</li>
          ))}
        </ul>
        <div className="flex gap-2">
          {party.leader === playerId && (
            <button
              className="rounded bg-gray-300 px-2 py-1 text-sm hover:bg-gray-400"
              onClick={() => EventBus.emit("party:start:request")}
            >
              Start
            </button>
          )}
          <button
            className="rounded bg-gray-300 px-2 py-1 text-sm hover:bg-gray-400"
            onClick={() => EventBus.emit("party:leave:request")}
          >
            Leave
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg bg-gray-200 p-4">
      <button
        className="rounded bg-gray-300 px-2 py-1 text-sm hover:bg-gray-400"
        onClick={() => EventBus.emit("party:create:request")}
      >
        Create party
      </button>
      {lobbies.length > 0 && (
        <ul className="flex flex-col gap-1">
          {lobbies.map((p) => (
            <li key={p.id} className="flex items-center gap-2 text-sm">
              {p.id.slice(0, 8)} ({p.members.length})
              <button
                className="rounded bg-gray-300 px-2 py-1 text-xs hover:bg-gray-400"
                onClick={() => EventBus.emit("party:join:request", p.id)}
              >
                Join
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
