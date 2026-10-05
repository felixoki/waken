import {
  ComponentName,
  SpellConfig,
  SpellName,
  StateName,
} from "@server/types";
import { State } from "./State";
import { Entity } from "../Entity";
import { AnimationComponent } from "../components/Animation";
import { handlers } from "../handlers";
import { vfx } from "../vfx";
import {
  DELAY_ATTACK,
  DELAY_FLURRY_WINDOW,
  DURATION_COMBO_WINDOW,
} from "@server/globals";

export class Casting implements State {
  private timer: {
    delay?: Phaser.Time.TimerEvent;
    duration: Phaser.Time.TimerEvent;
    combo?: Phaser.Time.TimerEvent;
  } | null = null;
  private step: number = 0;
  private charging: boolean = false;
  private channeling: boolean = false;
  private config: SpellConfig | null = null;
  private hidden: boolean = false;
  private armed: boolean = false;
  private released: boolean = false;
  private flurry: boolean = false;

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

    if (config.sounds?.cast && !entity.scene.managers.players.get(entity.id))
      entity.scene.managers.sound.play.sfx(config.sounds.cast, {
        position: { x: entity.x, y: entity.y },
      });

    const attack = handlers.combat.attack(entity, config.name);
    if (attack?.sound)
      entity.scene.managers.sound.play.sfx(attack.sound, {
        position: { x: entity.x, y: entity.y },
      });

    const anim = entity.getComponent<AnimationComponent>(
      ComponentName.ANIMATION,
    );

    /** @todo We should refactor this later on */
    if (config.name === SpellName.DRAGON_FORM) {
      vfx.emitters.transform(entity);
      entity.setAlpha(0);
      this.hidden = true;
    } else if (config.animation)
      anim?.playKey(config.animation.key, entity.facing, config.animation);
    else anim?.play(this.name, entity.facing);

    if (config.charge) {
      this.charging = true;
      handlers.charge.start(entity, config);
      return;
    }

    if (config.channel) {
      this.channeling = true;
      this.config = config;
      handlers.beam.start(entity, config);
      return;
    }

    this._executeSpell(entity, config);
  }

  update(entity: Entity): void {
    if (this.channeling) {
      if (!entity.pointerdown) return this.exit(entity);

      const player = entity.scene.managers.players.get(entity.id);
      if (player?.isControllable && player.mana < (this.config?.mana ?? 0))
        this.exit(entity);

      return;
    }

    if (this.armed) {
      if (!entity.pointerdown) this.released = true;
      else if (this.released) this.flurry = true;
    }

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

    const windup = handlers.combat.attack(entity, config.name)?.windup ?? 0;
    const flurry = isFinisher ? config.flurry : undefined;

    this.armed = !!flurry;
    this.released = false;
    this.flurry = false;

    const finish = () => {
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
    };

    const delay = DELAY_ATTACK + windup + (flurry ? DELAY_FLURRY_WINDOW : 0);

    this.timer = {
      delay: entity.scene.time.delayedCall(delay, () => {
        if (!entity.scene) return;

        this.armed = false;

        if (flurry && this.flurry) {
          handlers.spells[config.name](
            entity,
            {
              ...config,
              damage: { ...config.damage, amount: flurry.damage },
              knockback: flurry.knockback,
              duration: flurry.duration,
              hitbox: flurry.hitbox,
            },
            target,
            direction,
            step + 1,
          );

          if (!this.timer) return;

          this.timer.duration.destroy();
          this.timer.duration = entity.scene.time.delayedCall(
            flurry.hits * flurry.interval + 120,
            finish,
          );

          return;
        }

        handlers.spells[config.name](
          entity,
          stepConfig,
          target,
          direction,
          step,
        );
      }),

      duration: entity.scene.time.delayedCall(duration + windup, finish),
    };
  }

  exit(entity: Entity): void {
    if (this.hidden) {
      entity.setAlpha(1);
      this.hidden = false;
    }

    if (this.timer) {
      this.timer.delay?.destroy();
      this.timer.duration?.destroy();
      this.timer.combo?.destroy();
      this.timer = null;
    }

    this.step = 0;
    this.armed = false;
    this.flurry = false;

    if (this.charging) {
      handlers.charge.cleanup(entity);
      this.charging = false;
    }

    if (this.channeling) {
      handlers.beam.stop(entity);
      this.channeling = false;
      this.config = null;
    }

    entity.isLocked = false;

    const reset = entity.states?.get(StateName.IDLE);
    if (reset) reset.enter(entity);
  }
}
