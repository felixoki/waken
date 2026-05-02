import { useState } from "react";
import SocketManager from "../game/managers/Socket";
import { tryCatch } from "@server/utils/tryCatch";
import { MenuOverlay } from "./MenuOverlay";

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

type Modal = "new" | "join" | null;
type Closing = "new" | "join" | "worlds" | null;

export function Menu({ ready }: { ready: () => void }) {
  const [playerId] = useState(getPlayerId());
  const [worlds, setWorlds] = useState<World[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [world, setWorld] = useState("");
  const [joinId, setJoinId] = useState("");
  const [showWorlds, setShowWorlds] = useState(false);
  const [modal, setModal] = useState<Modal>(null);
  const [closing, setClosing] = useState<Closing>(null);

  const openModal = (m: Modal) => {
    setError("");
    setModal(m);
  };

  const closeModal = () => {
    setClosing(modal as Closing);
  };

  const closeWorlds = () => {
    setClosing("worlds");
  };

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
    setError("");
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

  return (
    <div className="fixed inset-0 flex flex-col">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        src="/assets/videos/mountains.mp4"
      />
      <div className="absolute inset-0 bg-black/30" />
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-200 ${modal || showWorlds ? "!opacity-0" : ""}`}
      >
        <h1 className="font-arco text-white text-[10rem] leading-none animate-[fade-in-dream_3s_ease-out_forwards,dream-glow_4s_ease-in-out_3s_infinite] opacity-0 drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">
          <span className="inline-block animate-[letter-drift_14s_ease-in-out_infinite]">
            w
          </span>
          <span className="inline-block animate-[letter-drift_12s_ease-in-out_1s_infinite]">
            a
          </span>
          <span className="inline-block animate-[letter-drift_16s_ease-in-out_2s_infinite]">
            k
          </span>
          <span className="inline-block animate-[letter-drift_13s_ease-in-out_3s_infinite]">
            e
          </span>
          <span className="inline-block animate-[letter-drift_15s_ease-in-out_4s_infinite]">
            n
          </span>
        </h1>
        <p className="text-white/50 text-lg tracking-widest mt-4 animate-[fade-in_3s_ease-out_1.5s_forwards] opacity-0">
          by Discount Games
        </p>
      </div>
      <div
        className={`absolute bottom-0 inset-x-0 flex gap-4 px-8 pb-8 transition-opacity duration-200 ${modal || showWorlds ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      >
        <button
          onClick={() => openModal("new")}
          className="flex-1 py-6 text-white text-xl font-semibold rounded-xl bg-black/40 hover:bg-black/60 transition-colors"
        >
          New game
        </button>
        <button
          onClick={() => openModal("join")}
          className="flex-1 py-6 text-white text-xl font-semibold rounded-xl bg-black/40 hover:bg-black/60 transition-colors"
        >
          Join
        </button>
        <button
          onClick={load}
          disabled={loading}
          className="flex-1 py-6 text-white text-xl font-semibold rounded-xl bg-black/40 hover:bg-black/60 transition-colors disabled:opacity-50"
        >
          {loading ? "Loading..." : "Load"}
        </button>
      </div>

      {showWorlds && (
        <MenuOverlay
          closing={closing === "worlds"}
          onClose={closeWorlds}
          onExited={() => {
            setShowWorlds(false);
            setClosing(null);
            setError("");
          }}
        >
          <div className="flex flex-col h-full px-16 py-16">
            <h2 className="text-white text-3xl font-semibold mb-8">
              Load game
            </h2>
            {worlds.length === 0 ? (
              <p className="text-white/40">No worlds found.</p>
            ) : (
              <div className="flex-1 overflow-auto">
                <table className="w-full text-white border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-white/40 text-sm text-left">
                      <th className="pb-4 px-4 font-normal">Name</th>
                      <th className="pb-4 px-4 font-normal">Created</th>
                      <th className="pb-4 px-4 font-normal text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {worlds.map((w) => (
                      <tr
                        key={w.id}
                        className="border-b border-white/5 hover:bg-white/5"
                      >
                        <td className="py-4 px-4 text-lg">{w.name}</td>
                        <td className="py-4 px-4 text-white/50">
                          {new Date(w.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-4 justify-end">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(w.id);
                                setError("World ID copied!");
                                setTimeout(() => setError(""), 2000);
                              }}
                              className="text-white/40 hover:text-white/70 transition-colors"
                            >
                              Copy ID
                            </button>
                            <button
                              onClick={() => start(w.id)}
                              disabled={loading}
                              className="rounded-xl bg-white/15 px-6 py-2 hover:bg-white/25 disabled:opacity-50 transition-colors"
                            >
                              {loading ? "Starting..." : "Play"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {error && <p className="text-white/50 mt-4 text-sm">{error}</p>}
          </div>
        </MenuOverlay>
      )}

      {modal === "new" && (
        <MenuOverlay
          closing={closing === "new"}
          onClose={closeModal}
          onExited={() => {
            setModal(null);
            setClosing(null);
            setError("");
            setWorld("");
          }}
        >
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4 w-full max-w-xl px-8">
              <h2 className="text-white text-3xl font-semibold mb-4">
                New game
              </h2>
              <div className="flex gap-3 w-full">
                <input
                  type="text"
                  placeholder="World name"
                  value={world}
                  onChange={(e) => setWorld(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && create()}
                  autoFocus
                  className="flex-1 rounded-xl bg-white/10 px-5 py-4 text-white placeholder:text-white/25 outline-none focus:bg-white/15 transition-colors text-lg"
                  disabled={loading}
                />
                <button
                  onClick={create}
                  disabled={loading || !world.trim()}
                  className="rounded-xl bg-white/15 px-8 py-4 text-white hover:bg-white/25 disabled:opacity-40 transition-colors text-lg whitespace-nowrap"
                >
                  {loading ? "Creating..." : "Create"}
                </button>
              </div>
              {error && (
                <p className="text-red-400 text-sm self-start">{error}</p>
              )}
            </div>
          </div>
        </MenuOverlay>
      )}

      {modal === "join" && (
        <MenuOverlay
          closing={closing === "join"}
          onClose={closeModal}
          onExited={() => {
            setModal(null);
            setClosing(null);
            setError("");
            setJoinId("");
          }}
        >
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4 w-full max-w-xl px-8">
              <h2 className="text-white text-3xl font-semibold mb-4">
                Join Game
              </h2>
              <div className="flex gap-3 w-full">
                <input
                  type="text"
                  placeholder="World ID"
                  value={joinId}
                  onChange={(e) => setJoinId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && join()}
                  autoFocus
                  className="flex-1 rounded-xl bg-white/10 px-5 py-4 text-white placeholder:text-white/25 outline-none focus:bg-white/15 transition-colors text-lg"
                  disabled={loading}
                />
                <button
                  onClick={join}
                  disabled={loading || !joinId.trim()}
                  className="rounded-xl bg-white/15 px-8 py-4 text-white hover:bg-white/25 disabled:opacity-40 transition-colors text-lg whitespace-nowrap"
                >
                  {loading ? "Joining..." : "Join"}
                </button>
              </div>
              {error && (
                <p className="text-red-400 text-sm self-start">{error}</p>
              )}
            </div>
          </div>
        </MenuOverlay>
      )}
    </div>
  );
}
