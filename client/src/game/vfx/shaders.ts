import { PipelineName } from "@server/types";
import { DURATION_EXTRACTION_BOUNCE } from "@server/globals";
import { Scene } from "../scenes/Scene";
import { Entity } from "../Entity";
import { StretchPipeline } from "../pipelines/Stretch";
import { BouncePipeline } from "../pipelines/Bounce";

export const shaders = {
  illuminate: (scene: Scene, duration: number) => {
    const camera = scene.cameras.main;
    camera.setPostPipeline(PipelineName.ILLUMINATE);

    scene.time.delayedCall(duration, () => {
      camera.resetPostPipeline();
    });
  },

  stretch: (entity: Entity, onComplete?: () => void) => {
    const game = entity.scene.game;
    const renderer = game.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
    let pipeline = renderer.pipelines.get(
      PipelineName.STRETCH,
    ) as StretchPipeline;

    if (!pipeline) {
      pipeline = new StretchPipeline(game);
      renderer.pipelines.add(PipelineName.STRETCH, pipeline);
    }

    pipeline.trigger();

    entity.setPipeline(PipelineName.STRETCH);

    entity.scene.time.delayedCall(200, () => {
      if (!entity.scene) return;
      entity.scene.tweens.add({
        targets: entity,
        y: entity.y - 6,
        duration: 400,
        ease: "Sine.easeOut",
      });
    });

    entity.scene.time.delayedCall(600, () => {
      if (!entity.scene) return;
      entity.resetPipeline();
      onComplete?.();
    });
  },

  bounce: (entity: Entity, onComplete?: () => void) => {
    const game = entity.scene.game;
    const renderer = game.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
    const name = `bounce_${entity.id}`;

    let pipeline = renderer.pipelines.get(name) as BouncePipeline;

    if (!pipeline) {
      pipeline = new BouncePipeline(game, name);
      renderer.pipelines.add(name, pipeline);
    }

    pipeline.trigger(0.12, 2.0, 1.5, 18.0);
    entity.setPipeline(name);

    entity.scene.time.delayedCall(DURATION_EXTRACTION_BOUNCE, () => {
      renderer.pipelines.remove(name);
      if (entity.active) entity.resetPipeline();
      onComplete?.();
    });
  },
};
