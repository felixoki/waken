import Phaser from "phaser";
import { OutlinePipeline } from "./pipelines/Outline";
import { MainScene } from "./scenes/Main";
import VillageScene from "./scenes/Village";
import { HerbalistScene } from "./scenes/Herbalist";
import { IlluminatePipeline } from "./pipelines/Illuminate";
import { AmbiencePipeline } from "./pipelines/Ambience";
import { PipelineName } from "@server/types";
import { HomeScene } from "./scenes/Home";
import RealmScene from "./scenes/Realm";
import { BlacksmithScene } from "./scenes/Blacksmith";
import { TavernScene } from "./scenes/Tavern";
import { GlassblowerScene } from "./scenes/Glassblower";
import { FishingHutScene } from "./scenes/FishingHut";
import { FarmScene } from "./scenes/Farm";

export const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game",
  width: window.innerWidth,
  height: window.innerHeight,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [
    MainScene,
    VillageScene,
    HerbalistScene,
    HomeScene,
    RealmScene,
    BlacksmithScene,
    TavernScene,
    GlassblowerScene,
    FishingHutScene,
    FarmScene,
  ],
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
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
      renderer.pipelines.addPostPipeline(
        PipelineName.AMBIENCE,
        AmbiencePipeline,
      );
    },
  },
};
