import { BounceConfig, ComponentName, Event, SoundName } from "@server/types";
import { Entity } from "../Entity";
import { Component } from "./Component";
import { BouncePipeline, pool } from "../pipelines/Bounce";

export class BounceComponent extends Component {
  private entity: Entity;
  private isAnimating: boolean = false;
  private timer?: Phaser.Time.TimerEvent;
  private config?: BounceConfig;

  public name = ComponentName.BOUNCE;

  constructor(entity: Entity, config?: BounceConfig) {
    super();
    this.entity = entity;
    this.config = config;
  }

  attach(): void {
    this.entity.scene.game.events.on(Event.ENTITY_OVERLAP, this._bounce, this);
  }

  private _bounce = (entity: Entity, other: Entity) => {
    if (entity.id !== this.entity.id && other.id !== this.entity.id) return;
    if (this.isAnimating) return;

    this.isAnimating = true;

    if (!this.config?.quiet)
      this.entity.scene.managers.sound.play.sfx(SoundName.RUSTLE, {
        position: { x: this.entity.x, y: this.entity.y },
      });

    const game = this.entity.scene.game;
    const renderer = game.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
    const name = pool.acquire(game.loop.time);
    const pipeline = renderer.pipelines.get(name) as BouncePipeline;

    const previous = this.entity.pipeline;

    pipeline.trigger(0.15, 2.0, 2.5, 10.0);
    this.entity.setPipeline(name);

    this.timer = this.entity.scene.time.delayedCall(2000, () => {
      this.timer = undefined;
      this.entity.setPipeline(previous);
      this.isAnimating = false;
    });
  };

  update(): void {}

  detach(): void {
    this.entity.scene.game.events.off(Event.ENTITY_OVERLAP, this._bounce, this);

    if (this.timer) {
      this.timer.destroy();
      this.timer = undefined;
    }
  }
}
