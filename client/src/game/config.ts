import Phaser from "phaser";
import Village from "./scenes/Village";

export const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game",
  width: 800,
  height: 600,
  scene: [Village],
  physics: {
    default: "arcade",
  },
  pixelArt: true,
};
