import Phaser from "phaser";
import Village from "./scenes/Village";

export const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game",
  width: 600,
  height: 400,
  scene: [Village],
  physics: {
    default: "arcade",
    arcade: {
      debug: true,
    },
  },
  scale: {
    zoom: 1.65,
  },
  backgroundColor: "f3f3f3",
  pixelArt: true,
};
