import { ComponentName } from "@server/types";
import { Entity } from "../Entity";
import { Component } from "./Component";
import { BouncePipeline } from "../pipelines/Bounce";

export class BounceComponent extends Component {
  private entity: Entity;
  private isAnimating: boolean = false;
  private pipeline?: BouncePipeline;

  public name = ComponentName.BOUNCE;

  constructor(entity: Entity) {
    super();
    this.entity = entity;
  }

  attach(): void {
    const renderer = this.entity.scene.game
      .renderer as Phaser.Renderer.WebGL.WebGLRenderer;
    const name = `bounce_${this.entity.id}`;

    this.pipeline = new BouncePipeline(this.entity.scene.game, name);
    renderer.pipelines.add(name, this.pipeline);

    this.entity.setPipeline(name);

    this.entity.scene.game.events.on("entity:overlap", this._bounce, this);
  }

  private _bounce = (entity: Entity, other: Entity) => {
    if (entity.id !== this.entity.id && other.id !== this.entity.id) return;
    if (this.isAnimating) return;

    this.isAnimating = true;

    if (this.pipeline) this.pipeline.trigger(0.15, 2.0, 2.5, 10.0);

    this.entity.scene.time.delayedCall(2000, () => {
      this.isAnimating = false;
    });
  };

  update(): void {}

  detach(): void {
    this.entity.scene.game.events.off("entity:overlap", this._bounce, this);

    if (this.pipeline) {
      const renderer = this.entity.scene.game
        .renderer as Phaser.Renderer.WebGL.WebGLRenderer;
      renderer.pipelines.remove(`bounce_${this.entity.id}`);
    }

    this.entity.resetPipeline();
  }
}
