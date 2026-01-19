import { useEffect, useState } from "react";
import SocketManager from "../game/managers/Socket";

export function Menu({ ready }: { ready: () => void }) {
  const [games, setGames] = useState<string[]>([]);

  useEffect(() => {
    SocketManager.init();

    SocketManager.on("game:create", ({ instanceId }) => {
      SocketManager.setGameId(instanceId);
      ready();
    });

    SocketManager.on("game:join", ({ instanceId }) => {
      SocketManager.setGameId(instanceId);
      ready();
    });

    SocketManager.on("game:list", setGames);
    SocketManager.emit("game:list");
  }, []);

  return (
    <div className="max-w-150 mx-auto flex flex-col justify-center items-center gap-7 h-screen">
      <div className="flex justify-between items-center w-full p-3">
        <h1 className="text-white">Games</h1>
        <button
          className="px-3 py-2 bg-blue-500 text-white rounded"
          onClick={() => {
            SocketManager.emit("game:create");
          }}
        >
          Create new game
        </button>
      </div>
      <div className="w-full">
        {games.map((id) => (
          <div key={id} className="odd:bg-slate-800 rounded p-3">
            <div className="flex justify-between items-center">
              <div className="text-white">{id}</div>
              <button
                className="px-3 py-1.5 bg-blue-500 text-white rounded"
                onClick={() => {
                  SocketManager.emit("game:join", { instanceId: id });
                }}
              >
                Join
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
