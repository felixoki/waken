import { ComponentName, Event, SoundName, StateName } from "@server/types";
import { DURATION_MINING, EXTRACTION_IMPACT_FRAME } from "@server/globals";
import { State } from "./State";
import { Entity } from "../Entity";
import { AnimationComponent } from "../components/Animation";
import { vfx } from "../vfx";

export class Mining implements State {
  public name = StateName.MINING;

  private timer: Phaser.Time.TimerEvent | null = null;
  private target?: { x: number; y: number; id?: string };
  private onFrame?: (
    anim: Phaser.Animations.Animation,
    frame: Phaser.Animations.AnimationFrame,
  ) => void;

  enter(entity: Entity): void {
    this.target = entity.target;

    entity.setState(this.name);
    entity.isLocked = true;
    entity.moving = [];

    const anim = entity.getComponent<AnimationComponent>(
      ComponentName.ANIMATION,
    );
    anim?.play(this.name, entity.facing);

    this.onFrame = (_anim, frame) => {
      if (frame.index < EXTRACTION_IMPACT_FRAME) return;
      entity.off(Phaser.Animations.Events.ANIMATION_UPDATE, this.onFrame!);
      this.onFrame = undefined;
      this._impact(entity);
    };
    entity.on(Phaser.Animations.Events.ANIMATION_UPDATE, this.onFrame);

    this.timer = entity.scene.time.delayedCall(DURATION_MINING, () => {
      this._mine(entity);
      this.exit(entity);
    });
  }

  update(_entity: Entity): void {}

  exit(entity: Entity): void {
    this.timer?.destroy();
    this.timer = null;

    if (this.onFrame) {
      entity.off(Phaser.Animations.Events.ANIMATION_UPDATE, this.onFrame);
      this.onFrame = undefined;
    }

    entity.isLocked = false;

    const reset = entity.states?.get(StateName.IDLE);
    if (reset) reset.enter(entity);
  }

  private _impact(entity: Entity): void {
    entity.scene.managers.sound.play.sfx(SoundName.MINE, {
      position: { x: entity.x, y: entity.y },
    });

    const isLocal = entity === entity.scene.managers.players.player;
    if (!isLocal || !this.target?.id) return;

    const source = entity.scene.managers.entities.get(this.target.id);
    if (source) vfx.shaders.bounce(source);
  }

  private _mine(entity: Entity): void {
    const isLocal = entity === entity.scene.managers.players.player;
    const target = this.target;

    if (!isLocal || !target?.id) return;

    entity.scene.game.events.emit(Event.EXTRACT_MATERIAL, { id: target.id });
  }
}
