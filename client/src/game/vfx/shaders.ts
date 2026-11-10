import { PipelineName } from "@server/types";
import {
  DURATION_EXTRACTION_BOUNCE,
  ILLUMINATE_BOOST,
  ILLUMINATE_FADE,
} from "@server/globals";
import { Scene } from "../scenes/Scene";
import { Entity } from "../Entity";
import { StretchPipeline } from "../pipelines/Stretch";
import { pool } from "../pipelines/Bounce";

interface Bounce {
  slot: string;
  previous: Phaser.Renderer.WebGL.WebGLPipeline;
  timer: Phaser.Time.TimerEvent;
}

const bounces = new Map<string, Bounce>();

export const shaders = {
  illuminate: (scene: Scene, duration: number) => {
    const target = scene.illumination;

    scene.tweens.killTweensOf(target);
    scene.tweens.add({
      targets: target,
      boost: ILLUMINATE_BOOST,
      duration: ILLUMINATE_FADE,
      hold: Math.max(duration - ILLUMINATE_FADE * 2, 0),
      yoyo: true,
      ease: "Sine.easeInOut",
      onComplete: () => (target.boost = 1),
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

    const previous = entity.pipeline;
    entity.setPipeline(PipelineName.STRETCH);

    entity.scene.time.delayedCall(200, () => {
      if (!entity.scene) return;
      const rise = { y: 0 };
      let applied = 0;
      entity.scene.tweens.add({
        targets: rise,
        y: -6,
        duration: 400,
        ease: "Sine.easeOut",
        onUpdate: () => {
          if (!entity.active) return;
          entity.y += rise.y - applied;
          applied = rise.y;
        },
      });
    });

    entity.scene.time.delayedCall(600, () => {
      if (!entity.scene) return;
      entity.setPipeline(previous);
      onComplete?.();
    });
  },

  bounce: (entity: Entity, onComplete?: () => void) => {
    const running = bounces.get(entity.id);
    const previous = running ? running.previous : entity.pipeline;

    running?.timer.remove(false);

    const slot = pool.claim(
      entity.scene.game.loop.time,
      DURATION_EXTRACTION_BOUNCE,
      0.06,
      2.0,
      3.0,
      18.0,
      running?.slot,
    );
    entity.setPipeline(slot);

    const timer = entity.scene.time.delayedCall(
      DURATION_EXTRACTION_BOUNCE,
      () => {
        bounces.delete(entity.id);
        if (entity.scene) entity.setPipeline(previous);
        onComplete?.();
      },
    );

    bounces.set(entity.id, { slot, previous, timer });
  },

  jump: (entity: Entity) => {
    const scene = entity.scene;
    const sx = entity.scaleX;
    const sy = entity.scaleY;
    const hop = { y: 0 };
    let applied = 0;

    scene.tweens.add({
      targets: hop,
      y: -12,
      duration: 150,
      ease: "Sine.easeOut",
      yoyo: true,
      onUpdate: () => {
        if (!entity.active) return;
        entity.y += hop.y - applied;
        applied = hop.y;
      },
      onComplete: () => {
        if (entity.active) entity.y -= applied;
      },
    });

    entity.setScale(sx * 0.4, sy * 0.4);
    scene.tweens.add({
      targets: entity,
      scaleX: sx,
      scaleY: sy,
      duration: 300,
      ease: "Back.easeOut",
    });
  },
};
