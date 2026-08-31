import { ComponentName, EffectName, PipelineName } from "@server/types";
import {
  SHEEN_DEPTH_BIAS,
  SHEEN_DRY_DURATION,
  SHEEN_SOAK_DURATION,
} from "@server/globals";
import { Entity } from "../Entity";
import { Component } from "./Component";

export class WetsheenComponent extends Component {
  public name = ComponentName.WETSHEEN;

  private sheen?: Phaser.GameObjects.Sprite;
  private level = 0;
  private phase: number;
  private packed = -1;
  private frame?: Phaser.Textures.Frame;

  constructor(private entity: Entity) {
    super();

    this.phase = Math.floor(Math.random() * 256);
  }

  attach(): void {
    const entity = this.entity;

    const sheen = entity.scene.add.sprite(
      entity.x,
      entity.y,
      entity.texture.key,
      entity.frame.name,
    );

    sheen.setPipeline(PipelineName.SHEEN);
    sheen.setVisible(false);
    sheen.setActive(false);

    this.sheen = sheen;
  }

  update(): void {
    const entity = this.entity;

    if (!this.sheen || !entity.scene || !entity.active) return;

    const wet = entity.hasEffect(EffectName.WET);
    const delta = entity.scene.game.loop.delta;

    this.level += wet
      ? delta / SHEEN_SOAK_DURATION
      : -delta / SHEEN_DRY_DURATION;

    this.level = Phaser.Math.Clamp(this.level, 0, 1);

    if (!wet && this.level <= 0) {
      entity.removeComponent(ComponentName.WETSHEEN);
      return;
    }

    this._sync();
  }

  detach(): void {
    this.sheen?.destroy();
    this.sheen = undefined;
  }

  private _sync(): void {
    const sheen = this.sheen!;
    const entity = this.entity;

    sheen.setVisible(entity.visible && this.level > 0.004);

    if (!sheen.visible) return;

    sheen.setPosition(entity.x, entity.y);
    sheen.setOrigin(entity.originX, entity.originY);
    sheen.setScale(entity.scaleX, entity.scaleY);
    sheen.setFlip(entity.flipX, entity.flipY);
    sheen.setRotation(entity.rotation);
    sheen.setAlpha(this.level);

    const depth = entity.depth + SHEEN_DEPTH_BIAS;
    if (sheen.depth !== depth) sheen.setDepth(depth);

    const frame = entity.frame;

    if (frame === this.frame) return;

    this.frame = frame;
    sheen.setTexture(entity.texture.key, frame.name);

    const v0 = Math.round(frame.v0 * 255);
    const span = Math.round(Math.min((frame.v1 - frame.v0) * 4, 1) * 255);
    const packed = (v0 << 16) | (span << 8) | this.phase;

    if (packed === this.packed) return;

    this.packed = packed;
    sheen.setTint(packed);
  }
}
