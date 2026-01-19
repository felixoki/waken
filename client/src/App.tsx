import { useEffect, useRef, useState } from "react";
import { config } from "./game/config";
import Phaser from "phaser";
import { Inventory } from "./ui/Inventory";
import { Entities } from "./ui/Entities";
import { Hotbar } from "./ui/Hotbar";
import { Menu } from "./ui/Menu";

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
      <div className="fixed top-0 left-256 flex flex-col gap-4 p-4">
        <Inventory />
        <Hotbar />
      </div>
    </div>
  );
}

export default App;
