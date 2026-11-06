import { ComponentName, EffectName, PipelineName } from "@server/types";
import {
  BLAZE_DEPTH_BIAS,
  BLAZE_DOUSE_DURATION,
  BLAZE_IGNITE_DURATION,
  BLAZE_STEAM_INTERVAL,
  BLAZE_STEAM_LIFESPAN,
  BLAZE_STEAM_PUFF,
} from "@server/globals";
import { OverlayComponent } from "./Overlay";
import { emitters } from "../vfx/emitters";
import { STEAM_HEIGHT } from "../handlers/textures";
import type { Wading } from "../handlers/water";
import type { Flame } from "../pipelines/Blaze";

export class BlazeComponent extends OverlayComponent {
  public name = ComponentName.BLAZE;

  protected readonly pipeline = PipelineName.BLAZE;
  protected readonly bias = BLAZE_DEPTH_BIAS;

  private flame: Flame = { heat: 0, seed: Math.random() };
  private steam?: Phaser.GameObjects.Particles.ParticleEmitter;
  private hiss = 0;
  private side = 1;
  private burning = false;

  protected get present(): boolean {
    return this.burning;
  }

  protected bind(sprite: Phaser.GameObjects.Sprite): void {
    sprite.setData("flame", this.flame);
  }

  protected advance(delta: number): number {
    const entity = this.entity;
    const burning = entity.hasEffect(EffectName.BURNING);
    const flame = this.flame;

    flame.heat += burning
      ? delta / BLAZE_IGNITE_DURATION
      : -delta / BLAZE_DOUSE_DURATION;
    flame.heat = Phaser.Math.Clamp(flame.heat, 0, 1);

    const wading = entity.getData("wading") as Wading | undefined;
    const doused =
      this.burning && !burning && entity.hasEffect(EffectName.WET);
    const entering = burning && !!wading && !flame.wading;

    if (doused || entering) this.puff(wading);
    else if (wading && flame.heat > 0) this.vent(wading, delta);

    this.burning = burning;
    flame.wading = wading;

    return flame.heat;
  }

  detach(): void {
    super.detach();

    const steam = this.steam;
    if (!steam) return;

    steam.scene?.time.delayedCall(BLAZE_STEAM_LIFESPAN, () => steam.destroy());
    this.steam = undefined;
  }

  private puff(wading?: Wading): void {
    this.hiss = BLAZE_STEAM_INTERVAL;
    for (let i = 0; i < BLAZE_STEAM_PUFF; i++) this.wisp(wading);
  }

  private vent(wading: Wading, delta: number): void {
    this.hiss -= delta;
    if (this.hiss > 0) return;

    this.hiss = BLAZE_STEAM_INTERVAL;
    this.wisp(wading);
  }

  private wisp(wading?: Wading): void {
    const entity = this.entity;

    this.steam ??= emitters.steam(entity.scene, () => this.side);
    this.steam.setDepth(entity.depth + 1);
    this.side = Math.random() < 0.5 ? -1 : 1;

    if (!wading) {
      this.steam.emitParticleAt(
        entity.x + this.side * (2 + Math.random() * 5),
        entity.y + Math.random() * 6 - STEAM_HEIGHT / 2,
      );
      return;
    }

    const angle = (Math.random() - 0.5) * (Math.PI / 1.5);
    this.steam.emitParticleAt(
      wading.x + this.side * Math.cos(angle) * wading.rx,
      wading.y + Math.sin(angle) * wading.ry - STEAM_HEIGHT / 2,
    );
  }
}
