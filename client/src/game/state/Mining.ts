import { ComponentName, Event, StateName } from "@server/types";
import { DURATION_MINING } from "@server/globals";
import { State } from "./State";
import { Entity } from "../Entity";
import { AnimationComponent } from "../components/Animation";
import { vfx } from "../vfx";

export class Mining implements State {
  public name = StateName.MINING;

  private timer: Phaser.Time.TimerEvent | null = null;
  private target?: { x: number; y: number; id?: string };

  enter(entity: Entity): void {
    this.target = entity.target;

    entity.setState(this.name);
    entity.isLocked = true;
    entity.moving = [];

    const anim = entity.getComponent<AnimationComponent>(
      ComponentName.ANIMATION,
    );
    anim?.play(this.name, entity.facing);

    this.timer = entity.scene.time.delayedCall(DURATION_MINING, () => {
      this._mine(entity);
      this.exit(entity);
    });
  }

  update(_entity: Entity): void {}

  exit(entity: Entity): void {
    this.timer?.destroy();
    this.timer = null;

    entity.isLocked = false;

    const reset = entity.states?.get(StateName.IDLE);
    if (reset) reset.enter(entity);
  }

  private _mine(entity: Entity): void {
    const isLocal = entity === entity.scene.managers.players.player;
    const target = this.target;

    if (!isLocal || !target?.id) return;

    const source = entity.scene.managers.entities.get(target.id);
    if (source) vfx.shaders.bounce(source);

    entity.scene.game.events.emit(Event.EXTRACT_MATERIAL, { id: target.id });
  }
}
