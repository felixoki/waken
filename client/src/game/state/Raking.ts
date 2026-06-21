import { ComponentName, Event, EntityName, StateName } from "@server/types";
import { DURATION_RAKING } from "@server/globals";
import { State } from "./State";
import { Entity } from "../Entity";
import { AnimationComponent } from "../components/Animation";

export class Raking implements State {
  public name = StateName.RAKING;

  private timer: Phaser.Time.TimerEvent | null = null;
  private target?: { x: number; y: number; id?: string };
  private seed?: EntityName | null;

  setSeed(seed: EntityName | null): void {
    this.seed = seed;
  }

  enter(entity: Entity): void {
    this.target = entity.target;

    entity.setState(this.name);
    entity.isLocked = true;
    entity.moving = [];

    const anim = entity.getComponent<AnimationComponent>(
      ComponentName.ANIMATION,
    );
    anim?.play(this.name, entity.facing);

    this.timer = entity.scene.time.delayedCall(DURATION_RAKING, () => {
      this._plant(entity);
      this.exit(entity);
    });
  }

  update(_entity: Entity): void {}

  exit(entity: Entity): void {
    this.timer?.destroy();
    this.timer = null;

    entity.isLocked = false;
    this.seed = null;

    const reset = entity.states?.get(StateName.IDLE);
    if (reset) reset.enter(entity);
  }

  private _plant(entity: Entity): void {
    const isLocal = entity === entity.scene.managers.players.player;
    const target = this.target;

    if (!isLocal || !target || !this.seed) return;

    entity.scene.game.events.emit(Event.ENTITY_PLANT, {
      seed: this.seed,
      x: target.x,
      y: target.y,
    });
  }
}
