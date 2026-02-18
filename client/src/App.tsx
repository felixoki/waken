import { useEffect, useRef, useState } from "react";
import { config } from "./game/config";
import Phaser from "phaser";
import { Inventory } from "./ui/Inventory";
import { Entities } from "./ui/Entities";
import { Hotbar } from "./ui/Hotbar";
import { Menu } from "./ui/Menu";
import { Dialogue } from "./ui/Dialogue";
import { Collection } from "./ui/Collection";

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
      <div id="game"></div>
      <Entities />
      <div className="fixed top-0 left-0 flex flex-col gap-4 p-4">
        <Hotbar />
        <Inventory />
        <Dialogue />
        <Collection />
      </div>
    </div>
  );
}

export default App;
