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
import { Spells } from "./ui/Spells";
import { Storage } from "./ui/Storage";

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
      <div className="fixed top-4 right-4 bg-black/25 rounded-lg p-4 min-w-75">
        <Party />
      </div>
      <Stats />
      <Economy />
      <div className="fixed top-4 left-4 flex flex-row gap-4">
        <div className="flex flex-col gap-4">
          <div className="bg-black/25 rounded-lg p-4">
            <Hotbar />
            <Inventory />
          </div>
          <Dialogue />
          <Spells />
          <Seeds />
        </div>
        <Storage />
      </div>
    </div>
  );
}

export default App;
