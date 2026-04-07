import { useState } from "react";
import SocketManager from "../game/managers/Socket";
import { tryCatch } from "@server/utils/tryCatch";

const LOBBY_URL = (
  import.meta.env.VITE_LOBBY_URL || "http://localhost:3100"
).replace(/\/$/, "");

const getPlayerId = (): string => {
  let playerId = localStorage.getItem("playerId");

  if (!playerId) {
    playerId = crypto.randomUUID();
    localStorage.setItem("playerId", playerId);
  }

  return playerId;
};

type World = {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
};

export function Menu({ ready }: { ready: () => void }) {
  const [playerId] = useState(getPlayerId());
  const [worlds, setWorlds] = useState<World[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [world, setWorld] = useState("");
  const [joinId, setJoinId] = useState("");
  const [showWorlds, setShowWorlds] = useState(false);

  const create = async () => {
    if (!world.trim()) {
      setError("Enter a world name");
      return;
    }

    setLoading(true);
    setError("");

    const result = await tryCatch(
      fetch(`${LOBBY_URL}/worlds`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, name: world.trim() }),
      }),
    );

    if (result.error) {
      setError("Failed to create world");
      setLoading(false);
      return;
    }

    if (!result.data.ok) {
      setError("Failed to create world");
      setLoading(false);
      return;
    }

    const dataResult = await tryCatch(result.data.json());

    if (dataResult.error) {
      setError("Failed to parse response");
      setLoading(false);
      return;
    }

    connect(dataResult.data.host, dataResult.data.port);
  };

  const load = async () => {
    setLoading(true);
    setError("");

    const result = await tryCatch(
      fetch(`${LOBBY_URL}/worlds?playerId=${encodeURIComponent(playerId)}`),
    );

    if (result.error) {
      setError("Failed to load worlds");
      setLoading(false);
      return;
    }

    if (!result.data.ok) {
      setError("Failed to load worlds");
      setLoading(false);
      return;
    }

    const dataResult = await tryCatch(result.data.json());

    if (dataResult.error) {
      setError("Failed to parse response");
      setLoading(false);
      return;
    }

    setWorlds(dataResult.data);
    setShowWorlds(true);
    setLoading(false);
  };

  const start = async (worldId: string) => {
    setLoading(true);
    setError("");

    const result = await tryCatch(
      fetch(`${LOBBY_URL}/worlds/${worldId}/start`, {
        method: "POST",
      }),
    );

    if (result.error) {
      setError("Failed to start world");
      setLoading(false);
      return;
    }

    if (!result.data.ok) {
      setError("Failed to start world");
      setLoading(false);
      return;
    }

    const dataResult = await tryCatch(result.data.json());

    if (dataResult.error) {
      setError("Failed to parse response");
      setLoading(false);
      return;
    }

    connect(dataResult.data.host, dataResult.data.port);
  };

  const join = async () => {
    if (!joinId.trim()) {
      setError("Enter a world ID");
      return;
    }

    setLoading(true);
    setError("");

    const result = await tryCatch(
      fetch(`${LOBBY_URL}/worlds/${joinId.trim()}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      }),
    );

    if (result.error) {
      setError("Failed to join world");
      setLoading(false);
      return;
    }

    if (!result.data.ok) {
      setError("World not found or failed to join");
      setLoading(false);
      return;
    }

    const dataResult = await tryCatch(result.data.json());

    if (dataResult.error) {
      setError("Failed to parse response");
      setLoading(false);
      return;
    }

    connect(dataResult.data.host, dataResult.data.port);
  };

  const connect = (host: string, port: number) => {
    const worldUrl = `http://${host}:${port}`;
    SocketManager.init(worldUrl);

    SocketManager.on("connect", () => {
      ready();
    });
  };

  if (showWorlds) {
    return (
      <div className="max-w-150 mx-auto flex flex-col justify-center items-center gap-7 h-screen">
        <div className="flex flex-col gap-6 w-full bg-white/5 p-4 rounded-lg">
          <h2 className="text-white text-2xl">Your worlds</h2>

          {worlds.length === 0 ? (
            <p className="text-gray-400">No worlds yet</p>
          ) : (
            <div className="flex flex-col gap-2">
              {worlds.map((world) => (
                <div key={world.id} className="flex flex-row gap-1">
                  <button
                    onClick={() => start(world.id)}
                    disabled={loading}
                    className="rounded bg-black/15 px-2 py-1 text-white hover:bg-black/25 disabled:opacity-50 flex-1"
                  >
                    {world.name}
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(world.id);
                      setError("World ID copied!");
                      setTimeout(() => setError(""), 2000);
                    }}
                    className="text-xs text-white/40 hover:text-white/60 text-left px-2"
                  >
                    Copy ID
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => setShowWorlds(false)}
            className="rounded bg-black/25 px-2 py-1 text-white hover:bg-black/50"
          >
            Back
          </button>

          {error && <p className="text-white/40">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-150 mx-auto flex flex-col justify-center items-center h-screen">
      <div className="flex flex-col gap-6 w-full bg-white/5 p-4 rounded-lg">
        <h1 className="text-white text-3xl mb-2">Waken</h1>

        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="World name"
            value={world}
            onChange={(e) => setWorld(e.target.value)}
            className="rounded bg-black/15 px-2 py-1 text-white hover:bg-black/25"
            disabled={loading}
          />
          <button
            onClick={create}
            disabled={loading || !world.trim()}
            className="rounded bg-black/15 px-2 py-1 text-white hover:bg-black/25 disabled:opacity-50"
          >
            {loading ? "Creating..." : "New game"}
          </button>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <input
            type="text"
            placeholder="World ID"
            value={joinId}
            onChange={(e) => setJoinId(e.target.value)}
            className="rounded bg-black/15 px-2 py-1 text-white hover:bg-black/25"
            disabled={loading}
          />
          <button
            onClick={join}
            disabled={loading || !joinId.trim()}
            className="rounded bg-black/15 px-2 py-1 text-white hover:bg-black/25 disabled:opacity-50"
          >
            {loading ? "Joining..." : "Join world"}
          </button>
        </div>

        <button
          onClick={load}
          disabled={loading}
          className="rounded bg-black/15 px-2 py-1 text-white hover:bg-black/25 disabled:opacity-50 mt-2"
        >
          {loading ? "Loading..." : "Load game"}
        </button>

        {error && <p className="text-red-500">{error}</p>}
      </div>
    </div>
  );
}
