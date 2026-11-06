import { ComponentName, EffectName, PipelineName } from "@server/types";
import {
  STATUS_DEPTH_BIAS,
  STATUS_FADE_IN,
  STATUS_FADE_OUT,
  STATUS_TRAIL_EASE,
} from "@server/globals";
import { OverlayComponent } from "./Overlay";
import type { Wading } from "../handlers/water";
import type { Status } from "../pipelines/Status";

export const STATUSES = [
  EffectName.COLD,
  EffectName.POISONED,
  EffectName.ILLUMINATED,
  EffectName.REGAIN,
  EffectName.MOMENTUM,
  EffectName.REFLECT,
  EffectName.GREASE,
  EffectName.SEARING,
  EffectName.WARM,
] as const;

export class StatusComponent extends OverlayComponent {
  public name = ComponentName.STATUS;

  protected readonly pipeline = PipelineName.STATUS;
  protected readonly bias = STATUS_DEPTH_BIAS;

  private status: Status = {
    levels: new Float32Array(STATUSES.length),
    seed: Math.random(),
    trail: { x: 1, y: 0, motion: 0 },
  };
  private active = false;
  private lastX = 0;
  private lastY = 0;

  attach(): void {
    super.attach();

    this.lastX = this.entity.x;
    this.lastY = this.entity.y;
  }

  protected get present(): boolean {
    return this.active;
  }

  protected bind(sprite: Phaser.GameObjects.Sprite): void {
    sprite.setData("status", this.status);
  }

  protected advance(delta: number): number {
    const entity = this.entity;
    const levels = this.status.levels;
    let peak = 0;

    this.active = false;

    for (let i = 0; i < STATUSES.length; i++) {
      const on = entity.hasEffect(STATUSES[i]);
      if (on) this.active = true;

      levels[i] = on
        ? Math.min(1, levels[i] + delta / STATUS_FADE_IN)
        : Math.max(0, levels[i] - delta / STATUS_FADE_OUT);

      if (levels[i] > peak) peak = levels[i];
    }

    this.status.wading = entity.getData("wading") as Wading | undefined;
    this.follow(delta);

    return peak;
  }

  private follow(delta: number): void {
    const entity = this.entity;
    const trail = this.status.trail;
    const dx = entity.x - this.lastX;
    const dy = entity.y - this.lastY;
    const length = Math.hypot(dx, dy);

    this.lastX = entity.x;
    this.lastY = entity.y;

    const moving = length > 0.05;

    if (moving) {
      trail.x = (entity.flipX ? -dx : dx) / length;
      trail.y = dy / length;
    }

    const ease = Math.min(1, delta / STATUS_TRAIL_EASE);
    trail.motion += ((moving ? 1 : 0) - trail.motion) * ease;
  }
}
