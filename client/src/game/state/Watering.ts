import { ComponentName, Direction, Event, SoundName, StateName } from "@server/types";
import { DURATION_WATERING } from "@server/globals";
import { State } from "./State";
import { Entity } from "../Entity";
import { AnimationComponent } from "../components/Animation";
import { vfx } from "../vfx";

const SPOUT: Record<
  Direction,
  { x: number; y: number; angle: { min: number; max: number } }
> = {
  [Direction.DOWN]: { x: 6, y: 6, angle: { min: 65, max: 115 } },
  [Direction.UP]: { x: -6, y: -4, angle: { min: 65, max: 115 } },
  [Direction.LEFT]: { x: -18, y: 2, angle: { min: 95, max: 155 } },
  [Direction.RIGHT]: { x: 12, y: 2, angle: { min: 25, max: 85 } },
};

export class Watering implements State {
  public name = StateName.WATERING;

  private timer: Phaser.Time.TimerEvent | null = null;
  private target?: { x: number; y: number; id?: string };
  private stop: (() => void) | null = null;

  enter(entity: Entity): void {
    this.target = entity.target;

    entity.setState(this.name);
    entity.isLocked = true;
    entity.moving = [];

    const anim = entity.getComponent<AnimationComponent>(
      ComponentName.ANIMATION,
    );
    anim?.play(this.name, entity.facing);

    const spout = SPOUT[entity.facing];

    this.stop = vfx.emitters.water(
      entity,
      { x: spout.x, y: spout.y },
      spout.angle,
    );

    entity.scene.managers.sound.play.sfx(SoundName.WATER, {
      position: { x: entity.x, y: entity.y },
    });

    this.timer = entity.scene.time.delayedCall(DURATION_WATERING, () => {
      this._water(entity);
      this.exit(entity);
    });
  }

  update(_entity: Entity): void {}

  exit(entity: Entity): void {
    this.timer?.destroy();
    this.timer = null;

    this.stop?.();
    this.stop = null;

    entity.isLocked = false;

    const reset = entity.states?.get(StateName.IDLE);
    if (reset) reset.enter(entity);
  }

  private _water(entity: Entity): void {
    const isLocal = entity === entity.scene.managers.players.player;
    const target = this.target;

    if (!isLocal || !target?.id) return;

    entity.scene.game.events.emit(Event.ENTITY_WATER, { id: target.id });
  }
}
