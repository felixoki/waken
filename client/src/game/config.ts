import Phaser from "phaser";
import { OutlinePipeline } from "./pipelines/Outline";
import VillageScene from "./scenes/Village";
import { HerbalistScene } from "./scenes/Herbalist";

export const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game",
  width: 1024,
  height: 1024,
  scene: [VillageScene, HerbalistScene],
  physics: {
    default: "arcade",
    arcade: {
      debug: true,
    },
  },
  backgroundColor: "4f63aa",
  pixelArt: true,
  fps: {
    target: 60,
  },
  callbacks: {
    postBoot: (game) => {
      const renderer = game.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
      renderer.pipelines.addPostPipeline('outline', OutlinePipeline);
    }
  }
};
