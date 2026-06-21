import { useEffect, useRef, useState } from "react";
import { config } from "./game/config";
import Phaser from "phaser";

import { Inventory } from "./ui/Inventory";
import { Entities } from "./ui/Entities";
import { Hotbar } from "./ui/Hotbar";
import { Menu } from "./ui/Menu";
import { Dialogue } from "./ui/Dialogue";
import { PartyPanel as Party } from "./ui/Party";
import { Stats } from "./ui/Stats";
import { Economy } from "./ui/Economy";
import { Loading } from "./ui/Loading";
import { Seeds } from "./ui/Seeds";
import { SpellBook } from "./ui/SpellBook";
import { Storage } from "./ui/Storage";
import { Collector } from "./ui/Collector";
import { Effects } from "./ui/Effects";
import { DamageNumbers } from "./ui/DamageNumbers";
import { Settings } from "./ui/Settings";
import { Provider } from "./ui/Provider";
import { Tooltip } from "./ui/Tooltip";

function FPS({ game }: { game: React.RefObject<Phaser.Game | null> }) {
  const [fps, setFps] = useState(0);

  useEffect(() => {
    let id: number;
    
    const loop = () => {
      if (game.current) setFps(Math.round(game.current.loop.actualFps));
      id = requestAnimationFrame(loop);
    };

    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="fixed top-1 right-1 text-white/60 text-xs font-mono pointer-events-none select-none">
      {fps}
    </div>
  );
}

function App() {
  const game = useRef<Phaser.Game | null>(null);
  const [inGame, setInGame] = useState(false);

  useEffect(() => {
    if (game.current || !inGame) return;

    game.current = new Phaser.Game(config);

    return () => {
      game.current?.destroy(true);
      game.current = null;
    };
  }, [inGame]);

  if (!inGame) return <Menu ready={() => setInGame(true)} />;

  return (
    <div>
      <div id="game" className="w-screen h-screen"></div>
      <Loading />
      <Entities />
      <DamageNumbers />
      <Tooltip />
      <div className="fixed top-4 right-4 bg-black/25 rounded-lg p-4 min-w-75">
        <Party />
      </div>
      <div className="fixed bottom-0 left-0 p-4 flex flex-col gap-4">
        <Effects />
        <Stats />
      </div>
      <Economy />
      <div className="fixed top-4 left-4 flex flex-row gap-4">
        <Provider>
        <div className="flex flex-col gap-4">
          <div className="bg-black/25 rounded-lg p-4">
            <Hotbar />
            <Inventory />
          </div>
          <Dialogue />
          <SpellBook />
          <Seeds />
        </div>
        <Storage />
        <Collector />
        </Provider>
      </div>
      <Settings />
      <FPS game={game} />
    </div>
  );
}

export default App;
