import Phaser from "phaser";
import Village from "./scenes/Village";
import { OutlinePipeline } from "./pipelines/Outline";

export const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game",
  width: 1024,
  height: 1024,
  scene: [Village],
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
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
