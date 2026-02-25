import { useEffect, useState } from "react";
import EventBus from "../game/EventBus";
import { Party } from "@server/types";

export const PartyPanel = () => {
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [party, setParty] = useState<Party | null>(null);
  const [lobbies, setLobbies] = useState<Party[]>([]);

  useEffect(() => {
    const local = (data: { id: string }) => setPlayerId(data.id);
    const list = (data: Party[]) => setLobbies(data);
    const create = (data: Party) => setParty(data);
    const update = (data: Party) => setParty(data);
    const leave = () => setParty(null);

    EventBus.on("player:create:local", local);
    EventBus.on("party:list", list);
    EventBus.on("party:create", create);
    EventBus.on("party:update", update);
    EventBus.on("party:leave", leave);

    return () => {
      EventBus.off("player:create:local", local);
      EventBus.off("party:list", list);
      EventBus.off("party:create", create);
      EventBus.off("party:update", update);
      EventBus.off("party:leave", leave);
    };
  }, []);

  if (party) {
    return (
      <div className="flex flex-col gap-2 rounded-lg bg-gray-200 p-4">
        <p className="font-bold">Party</p>
        <ul className="flex flex-col gap-1">
          {party.members.map((id) => (
            <li key={id}>{id.slice(0, 8)}</li>
          ))}
        </ul>
        <div className="flex gap-2">
          {party.leader === playerId && (
            <button
              className="rounded bg-gray-300 px-2 py-1 hover:bg-gray-400"
              onClick={() => EventBus.emit("party:start:request")}
            >
              Start
            </button>
          )}
          <button
            className="rounded bg-gray-300 px-2 py-1 hover:bg-gray-400"
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
        className="rounded bg-gray-300 px-2 py-1 hover:bg-gray-400"
        onClick={() => EventBus.emit("party:create:request")}
      >
        Create party
      </button>
      {lobbies.length && (
        <>
          <p className="font-bold">Parties</p>
          <ul className="flex flex-col gap-1">
            {lobbies.map((p) => (
              <li key={p.id} className="flex items-center gap-2">
                <span>
                  {p.id.slice(0, 8)} ({p.members.length})
                </span>
                <button
                  className="rounded bg-gray-300 px-2 py-1 hover:bg-gray-400"
                  onClick={() => EventBus.emit("party:join:request", p.id)}
                >
                  Join
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};
