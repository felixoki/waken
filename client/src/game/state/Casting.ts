import { ComponentName, SpellName, StateName } from "@server/types";
import { State } from "./State";
import { Entity } from "../Entity";
import { AnimationComponent } from "../components/Animation";
import { handlers } from "../handlers";
import { DELAY_ATTACK, DURATION_COMBO_WINDOW } from "@server/globals";

export class Casting implements State {
  private timer: {
    delay?: Phaser.Time.TimerEvent;
    duration: Phaser.Time.TimerEvent;
    combo?: Phaser.Time.TimerEvent;
  } | null = null;
  private step: number = 0;
  private charging: boolean = false;

  public name: StateName = StateName.CASTING;

  enter(entity: Entity): void {
    const config = handlers.combat.resolve(entity);

    if (!config) {
      const reset = entity.states?.get(StateName.IDLE);
      if (reset) reset.enter(entity);
      return;
    }

    if (!handlers.combat.consume(entity, config)) {
      const reset = entity.states?.get(StateName.IDLE);
      if (reset) reset.enter(entity);
      return;
    }

    entity.setState(this.name);
    entity.isLocked = true;

    const anim = entity.getComponent<AnimationComponent>(
      ComponentName.ANIMATION,
    );
    anim?.play(this.name, entity.facing);

    if (config.charge) {
      this.charging = true;
      handlers.charge.start(entity, config);
      return;
    }

    this._executeSpell(entity, config);
  }

  update(entity: Entity): void {
    if (!this.charging) return;

    if (!entity.pointerdown) this._releaseCharge(entity);
  }

  private _releaseCharge(entity: Entity): void {
    if (!this.charging) return;

    this.charging = false;

    const scaled = handlers.charge.release(entity);
    if (!scaled) {
      this.exit(entity);
      return;
    }

    const direction = handlers.direction.getDirectionToPoint(
      entity,
      entity.target || { x: entity.x + 1, y: entity.y },
    );

    handlers.spells[scaled.name as SpellName](
      entity,
      scaled,
      entity.target || { x: entity.x + direction.x, y: entity.y + direction.y },
      direction,
      0,
    );

    const { duration } = handlers.combat.combo(scaled, 0);

    this.timer = {
      duration: entity.scene.time.delayedCall(duration, () => {
        this.exit(entity);
        this.timer = null;
      }),
    };
  }

  private _executeSpell(
    entity: Entity,
    config: ReturnType<typeof handlers.combat.resolve>,
  ): void {
    if (!config || !entity.target) return;

    const target = entity.target;
    const direction = handlers.direction.getDirectionToPoint(entity, target);

    const step = config.combo ? this.step : 0;
    const { stepConfig, isFinisher, duration } = handlers.combat.combo(
      config,
      step,
    );

    if (this.timer?.combo) this.timer.combo.destroy();

    this.timer = {
      delay: entity.scene.time.delayedCall(DELAY_ATTACK, () => {
        if (!entity.scene) return;

        handlers.spells[config.name](
          entity,
          stepConfig,
          target,
          direction,
          step,
        );
      }),

      duration: entity.scene.time.delayedCall(duration, () => {
        if (config.combo && !isFinisher) {
          this.step = step + 1;
          entity.isLocked = false;

          const reset = entity.states?.get(StateName.IDLE);
          if (reset) reset.enter(entity);

          this.timer = {
            combo: entity.scene.time.delayedCall(DURATION_COMBO_WINDOW, () => {
              this.step = 0;
              this.timer = null;
            }),
            duration: null!,
          };

          return;
        }

        this.exit(entity);
      }),
    };
  }

  exit(entity: Entity): void {
    if (this.timer) {
      this.timer.delay?.destroy();
      this.timer.duration?.destroy();
      this.timer.combo?.destroy();
      this.timer = null;
    }

    this.step = 0;

    if (this.charging) {
      handlers.charge.cleanup(entity);
      this.charging = false;
    }

    entity.isLocked = false;

    const reset = entity.states?.get(StateName.IDLE);
    if (reset) reset.enter(entity);
  }
}
