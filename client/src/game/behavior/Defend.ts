import {
  BehaviorName,
  DefendBehaviorConfig,
  Input,
  StateName,
} from "@server/types";
import { DISTANCE_DASHING, RANGE_HITBOX_DETECTION } from "@server/globals";
import { Behavior } from "./Behavior";
import { Entity } from "../Entity";
import { handlers } from "../handlers";
import { Hitbox } from "../Hitbox";
import { Projectile } from "../Projectile";

export class DefendBehavior extends Behavior {
  private dashing: boolean = false;
  private vision: number;
  private fov: number;
  private watching = { startTime: 0, timeout: 10000 };
  private dash = { lastTime: 0, cooldown: 1000 };
  private circle = { direction: 1, nextSwitch: 0, distance: 120 };

  public name = BehaviorName.DEFEND;

  constructor(config?: DefendBehaviorConfig) {
    super();

    this.vision = config?.vision ?? 300;
    this.fov = config?.fov ?? Math.PI * 2;
    this.repeat = config?.repeat ?? true;
  }

  update(entity: Entity): Partial<Input> {
    if (entity.isLocked && !this.dashing) return {};

    const now = Date.now();

    if (this.watching.startTime === 0) this.watching.startTime = now;

    if (this.dashing && !entity.isLocked) {
      this.dashing = false;

      const result = handlers.player.nearest(entity);

      if (result) {
        entity.target = { x: result.player.x, y: result.player.y };

        const facing = handlers.direction.fromAngle(
          Phaser.Math.Angle.Between(
            entity.x,
            entity.y,
            result.player.x,
            result.player.y,
          ),
        );

        return {
          facing,
          moving: [],
          isRunning: false,
          state: StateName.CASTING,
        };
      }

      this.watching.startTime = now;
    }

    if (this.dashing) return {};

    const canDash = now - this.dash.lastTime >= this.dash.cooldown;

    if (canDash) {
      const hitboxes =
        entity.scene.physicsManager.groups.hits.getChildren() as Hitbox[];

      for (const hitbox of hitboxes) {
        if (hitbox.ownerId === entity.id) continue;

        const dist = Phaser.Math.Distance.Between(
          entity.x,
          entity.y,
          hitbox.x,
          hitbox.y,
        );
        if (dist >= RANGE_HITBOX_DETECTION) continue;

        let vx = 0;
        let vy = 0;

        if (hitbox instanceof Projectile && hitbox.body) {
          const body = hitbox.body as Phaser.Physics.Arcade.Body;

          vx = body.velocity.x;
          vy = body.velocity.y;
        }

        this.dashing = true;
        this.dash.lastTime = now;

        const dodge = handlers.combat.dodge(
          entity,
          hitbox.x,
          hitbox.y,
          vx,
          vy,
          DISTANCE_DASHING,
        );

        const attacker = handlers.player.nearest(entity);
        const facing = attacker
          ? handlers.direction.fromAngle(
              Phaser.Math.Angle.Between(
                entity.x,
                entity.y,
                attacker.player.x,
                attacker.player.y,
              ),
            )
          : dodge.facing;

        return {
          facing,
          moving: dodge.moving,
          isRunning: true,
          state: StateName.DASHING,
        };
      }
    }

    const visible = handlers.player.nearest(entity, {
      distance: this.vision,
      fov: this.fov,
    });

    if (visible) {
      const closestPlayer = visible.player;
      const closestDist = visible.distance;
      this.watching.startTime = now;

      if (now >= this.circle.nextSwitch) {
        this.circle.direction *= -1;
        this.circle.nextSwitch = now + 3000 + Math.random() * 2000;
      }

      const dx = closestPlayer.x - entity.x;
      const dy = closestPlayer.y - entity.y;
      const angleToPlayer = Math.atan2(dy, dx);

      const tangentAngle = angleToPlayer + (Math.PI / 2) * this.circle.direction;
      let moveX = Math.cos(tangentAngle);
      let moveY = Math.sin(tangentAngle);

      const normalX = dx / closestDist;
      const normalY = dy / closestDist;

      if (closestDist < this.circle.distance - 20) {
        moveX = moveX * 0.5 - normalX * 0.5;
        moveY = moveY * 0.5 - normalY * 0.5;
      }

      if (closestDist > this.circle.distance + 20) {
        moveX = moveX * 0.5 + normalX * 0.5;
        moveY = moveY * 0.5 + normalY * 0.5;
      }

      const moving = handlers.direction.fromVector(moveX, moveY);
      if (moving.length === 0)
        moving.push(handlers.direction.fromAngle(angleToPlayer));

      return {
        facing: handlers.direction.fromAngle(angleToPlayer),
        moving,
        isRunning: false,
      };
    }

    if (now - this.watching.startTime > this.watching.timeout)
      this.completed = true;

    return { facing: entity.facing, moving: [], isRunning: false };
  }

  reset(): void {
    this.dashing = false;
    this.watching.startTime = 0;
    this.dash.lastTime = 0;
    this.circle.direction = Math.random() > 0.5 ? 1 : -1;
    this.circle.nextSwitch = 0;
  }
}
