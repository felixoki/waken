import { ComponentName, Direction, StateName } from "@server/types";
import { DamageType } from "@server/types/damage";
import { State } from "./State";
import { Entity } from "../Entity";
import { AnimationComponent } from "../components/Animation";
import {
  DURATION_THROWING,
  SPEED_RUNNING,
  THROW_FRAME,
  THROW_FRAMES_TOTAL,
  ROCK_ARC_HEIGHT,
  ROCK_FLIGHT_DURATION,
  ROCK_HITBOX_SIZE,
  ROCK_HITBOX_DURATION,
} from "@server/globals";
import { Hitbox } from "../Hitbox";
import { handlers } from "../handlers";
import { effects } from "../effects";

const ROCK_SPAWN_OFFSET: Record<Direction, { x: number; y: number }> = {
  [Direction.DOWN]: { x: 0, y: 16 },
  [Direction.UP]: { x: 0, y: 32 },
  [Direction.LEFT]: { x: -32, y: 0 },
  [Direction.RIGHT]: { x: 32, y: 0 },
};

export class Throwing implements State {
  private timer: Phaser.Time.TimerEvent | null = null;
  private launchTimer: Phaser.Time.TimerEvent | null = null;
  public name: StateName = StateName.THROWING;

  enter(entity: Entity): void {
    entity.setState(this.name);
    entity.isLocked = true;

    const anim = entity.getComponent<AnimationComponent>(
      ComponentName.ANIMATION,
    );
    anim?.play(this.name, entity.facing);

    const delay = (THROW_FRAME / THROW_FRAMES_TOTAL) * DURATION_THROWING;

    this.launchTimer = entity.scene.time.delayedCall(delay, () => {
      this._launchRock(entity);
    });

    this.timer = entity.scene.time.delayedCall(DURATION_THROWING, () => {
      this.exit(entity);
    });
  }

  private _launchRock(entity: Entity): void {
    if (!entity.scene) return;

    const nearest = handlers.player.nearest(entity);
    if (!nearest) return;

    const player = entity.scene.managers.players.get(nearest.player.id);
    const flightSeconds = ROCK_FLIGHT_DURATION / 1000;

    let targetX = nearest.player.x;
    let targetY = nearest.player.y;

    if (player?.moving?.length) {
      const vel = handlers.direction.getDiagonalDirectionVector(player.moving);
      targetX += vel.x * SPEED_RUNNING * flightSeconds;
      targetY += vel.y * SPEED_RUNNING * flightSeconds;
    }

    const offset = ROCK_SPAWN_OFFSET[entity.facing] ?? { x: 0, y: 0 };
    const startX = entity.x + offset.x;
    const startY = entity.y + offset.y;

    const rock = entity.scene.add.image(startX, startY, "troll_throwing_rock");
    rock.setDepth(1000 + startY);

    entity.scene.tweens.add({
      targets: rock,
      x: targetX,
      duration: ROCK_FLIGHT_DURATION,
      ease: "Linear",
      onUpdate: (tween) => {
        const progress = tween.progress;
        const arc = Math.sin(progress * Math.PI) * ROCK_ARC_HEIGHT;
        rock.y = Phaser.Math.Linear(startY, targetY, progress) - arc;
        rock.setDepth(1000 + rock.y);
      },
      onComplete: () => {
        rock.destroy();

        if (!entity.scene) return;

        effects.emitters.dust(entity.scene, targetX, targetY);

        new Hitbox(
          entity.scene,
          targetX,
          targetY,
          ROCK_HITBOX_SIZE,
          ROCK_HITBOX_SIZE,
          entity.id,
          {
            name: null as any,
            damage: { type: DamageType.PHYSICAL, amount: 60 },
            knockback: 80,
            range: 0,
            duration: ROCK_HITBOX_DURATION,
          },
        );
      },
    });
  }

  update(_entity: Entity): void {}

  exit(entity: Entity): void {
    if (this.timer) {
      this.timer.destroy();
      this.timer = null;
    }

    if (this.launchTimer) {
      this.launchTimer.destroy();
      this.launchTimer = null;
    }

    entity.isLocked = false;

    const reset = entity.states?.get(StateName.IDLE);
    if (reset) reset.enter(entity);
  }
}
