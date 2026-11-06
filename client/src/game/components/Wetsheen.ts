import { ComponentName, EffectName, PipelineName } from "@server/types";
import {
  SHEEN_DEPTH_BIAS,
  SHEEN_DRY_DURATION,
  SHEEN_RISE_DURATION,
  SHEEN_SOAK_DURATION,
  SHEEN_SHALLOW,
  SINK_MAX,
} from "@server/globals";
import { OverlayComponent } from "./Overlay";
import type { Wading } from "../handlers/water";
import type { Soak } from "../pipelines/Sheen";

export class WetsheenComponent extends OverlayComponent {
  public name = ComponentName.WETSHEEN;

  protected readonly pipeline = PipelineName.SHEEN;
  protected readonly bias = SHEEN_DEPTH_BIAS;

  private soak: Soak = { wet: 0, rise: 0, seed: Math.random() };
  private wet = false;

  protected get present(): boolean {
    return this.wet;
  }

  protected bind(sprite: Phaser.GameObjects.Sprite): void {
    sprite.setData("soak", this.soak);
  }

  protected advance(delta: number): number {
    const entity = this.entity;
    const wet = entity.hasEffect(EffectName.WET);
    const wading = entity.getData("wading") as Wading | undefined;
    const soak = this.soak;

    soak.wet += wet ? delta / SHEEN_SOAK_DURATION : -delta / SHEEN_DRY_DURATION;
    soak.wet = Phaser.Math.Clamp(soak.wet, 0, 1);

    if (wading) {
      const reach =
        SHEEN_SHALLOW +
        (1 - SHEEN_SHALLOW) * Math.min(1, wading.depth / SINK_MAX);
      if (soak.rise < reach)
        soak.rise = Math.min(reach, soak.rise + delta / SHEEN_RISE_DURATION);
    } else if (!wet)
      soak.rise = Math.max(0, soak.rise - delta / SHEEN_DRY_DURATION);

    soak.wading = wading;
    this.wet = wet;

    return Math.max(soak.wet, soak.rise);
  }
}
