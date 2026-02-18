import Phaser from "phaser";
import { OutlinePipeline } from "./pipelines/Outline";
import { MainScene } from "./scenes/Main";
import VillageScene from "./scenes/Village";
import { HerbalistScene } from "./scenes/Herbalist";
import { IlluminatePipeline } from "./pipelines/Illuminate";
import { PipelineName } from "@server/types";
import { HomeScene } from "./scenes/Home";

export const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game",
  width: window.innerWidth,
  height: window.innerHeight,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [MainScene, VillageScene, HerbalistScene, HomeScene],
  physics: {
    default: "arcade",
    arcade: {
      debug: true,
    },
  },
  backgroundColor: "302929",
  render: {
    pixelArt: true,
    roundPixels: true,
    antialias: false,
  },
  fps: {
    target: 60,
  },
  callbacks: {
    /**
     * We should introduce a loader for this
     */
    postBoot: (game) => {
      const renderer = game.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
      renderer.pipelines.addPostPipeline(PipelineName.OUTLINE, OutlinePipeline);
      renderer.pipelines.addPostPipeline(
        PipelineName.ILLUMINATE,
        IlluminatePipeline,
      );
    },
  },
};
