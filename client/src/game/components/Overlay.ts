import { PipelineName } from "@server/types";
import { Entity } from "../Entity";
import { Component } from "./Component";

export abstract class OverlayComponent extends Component {
  protected sprite?: Phaser.GameObjects.Sprite;

  protected abstract readonly pipeline: PipelineName;
  protected abstract readonly bias: number;

  constructor(protected entity: Entity) {
    super();
  }

  protected abstract advance(delta: number): number;
  protected abstract get present(): boolean;
  protected bind(_sprite: Phaser.GameObjects.Sprite): void {}

  attach(): void {
    const entity = this.entity;

    const sprite = entity.scene.add.sprite(
      entity.x,
      entity.y,
      entity.texture.key,
      entity.frame.name,
    );

    sprite.setPipeline(this.pipeline);
    sprite.setVisible(false);
    sprite.setActive(false);

    this.bind(sprite);
    this.sprite = sprite;
  }

  update(): void {
    const entity = this.entity;
    const sprite = this.sprite;

    if (!sprite || !entity.scene || !entity.active) return;

    const level = this.advance(entity.scene.game.loop.delta);

    if (level <= 0 && !this.present) {
      entity.removeComponent(this.name);
      return;
    }

    sprite.setVisible(entity.visible && level > 0);
    if (!sprite.visible) return;

    if (sprite.frame !== entity.frame)
      sprite.setTexture(entity.texture.key, entity.frame.name);

    sprite.setPosition(entity.x, entity.y);
    sprite.setDisplayOrigin(entity.displayOriginX, entity.displayOriginY);
    sprite.setScale(entity.scaleX, entity.scaleY);
    sprite.setFlip(entity.flipX, entity.flipY);
    sprite.setRotation(entity.rotation);
    sprite.setAlpha(entity.alpha);

    const depth = entity.depth + this.bias;
    if (sprite.depth !== depth) sprite.setDepth(depth);
  }

  detach(): void {
    this.sprite?.destroy();
    this.sprite = undefined;
  }
}
