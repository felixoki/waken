import {
  ComponentName,
  StateName,
  WeaponConfig,
  WeaponName,
} from "@server/types";
import { State } from "./State";
import { Entity } from "../Entity";
import { AnimationComponent } from "../components/Animation";
import { DELAY_ATTACK, DURATION_SLASHING } from "@server/globals";
import { handlers } from "../handlers";
import { Hitbox } from "../Hitbox";
import { configs } from "@server/configs";

export class Slashing implements State {
  private timer: {
    delay: Phaser.Time.TimerEvent;
    duration: Phaser.Time.TimerEvent;
  } | null = null;
  private hitbox: Hitbox | null = null;
  public name: StateName = StateName.SLASHING;

  enter(entity: Entity): void {
    entity.setState(this.name);
    entity.isLocked = true;

    const anim = entity.getComponent<AnimationComponent>(
      ComponentName.ANIMATION,
    );
    anim?.play(this.name, entity.facing);

    const swing = configs.entities[entity.name]?.attacks?.find(
      (a) => a.state === StateName.SLASHING,
    )?.swing;

    if (swing)
      entity.scene.managers.sound.play.sfx(swing, {
        position: { x: entity.x, y: entity.y },
      });

    const timing = this._timing(entity);

    this.timer = {
      duration: entity.scene.time.delayedCall(timing.duration, () => {
        this.exit(entity);
      }),
      delay: entity.scene.time.delayedCall(timing.impact, () => {
        if (!entity.scene) return;

        const offset = handlers.direction.getDirectionalOffset(
          entity.facing,
          24,
        );

        const weapon = configs.weapons[WeaponName.SLASH];
        const attack = configs.entities[entity.name]?.attacks?.find(
          (a) => a.state === StateName.SLASHING,
        );

        if (attack?.sound)
          entity.scene.managers.sound.play.sfx(attack.sound, {
            position: { x: entity.x, y: entity.y },
          });

        const config: WeaponConfig = {
          ...weapon,
          duration: timing.window,
          ...(attack?.damage && { damage: attack.damage }),
          effects: [...(weapon.effects ?? []), ...(attack?.effects ?? [])],
        };

        this.hitbox = handlers.weapons[WeaponName.SLASH](
          entity,
          config,
          offset,
        );
      }),
    };
  }

  update(_entity: Entity): void {}

  private _timing(entity: Entity): {
    impact: number;
    window: number;
    duration: number;
  } {
    const config = configs.animations[entity.name]?.[StateName.SLASHING];

    if (!config)
      return {
        impact: DELAY_ATTACK,
        window: DURATION_SLASHING - DELAY_ATTACK,
        duration: DURATION_SLASHING,
      };

    const frame = 1000 / config.frameRate;
    const impact =
      typeof config.impact === "object"
        ? config.impact[entity.facing]
        : (config.impact ?? Math.floor(config.frameCount / 2));

    return {
      impact: impact * frame,
      window: 2 * frame,
      duration: config.frameCount * frame,
    };
  }

  exit(entity: Entity): void {
    this.hitbox?.destroy();

    if (this.timer) {
      this.timer.delay.destroy();
      this.timer.duration.destroy();
      this.timer = null;
    }

    entity.isLocked = false;

    const reset = entity.states?.get(StateName.IDLE);
    if (reset) reset.enter(entity);
  }
}
