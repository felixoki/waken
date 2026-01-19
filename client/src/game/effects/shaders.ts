import { PipelineName } from "@server/types";
import { Scene } from "../scenes/Scene";

export const shaders = {
  illuminate: (scene: Scene, duration: number) => {
    const camera = scene.cameras.main;
    camera.setPostPipeline(PipelineName.ILLUMINATE);

    scene.time.delayedCall(duration, () => {
      camera.resetPostPipeline();
    });
  },
};
