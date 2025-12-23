import { useEffect, useRef } from "react";
import { config } from "./game/config";
import Phaser from "phaser";

function App() {
  const game = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (game.current) return;

    game.current = new Phaser.Game(config);

    return () => {
      game.current?.destroy(true);
      game.current = null;
    };
  }, []);

  return (
    <div id="game"></div>
  );
}

export default App;
