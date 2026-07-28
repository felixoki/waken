import { BehaviorName, Input, StateName, Stuck, Waypoint } from "@server/types";
import { Behavior } from "./Behavior";
import { Entity } from "../Entity";
import { handlers } from "../handlers";
import { configs } from "@server/configs";

export class AttackBehavior extends Behavior {
  public target: { id: string; lastPosition: Waypoint | null } = {
    id: "",
    lastPosition: null,
  };
  private path: Waypoint[] = [];
  private recalculation = { last: 0, interval: 300 };
  private lostSightTime: number = 0;
  private lostSightThreshold: number = 3000;
  private lastAttackTime: number = 0;
  private frustrationThreshold: number = 3000;
  private cooldowns = new Map<StateName, number>();
  public alert = { active: false, time: 0, duration: 800 };
  private stuck: Stuck = {
    lastPosition: { x: 0, y: 0 },
    lastCheck: 0,
    interval: 200,
  };

  public name = BehaviorName.ATTACK;

  constructor() {
    super();
    this.repeat = true;
  }

  start(targetId: string): void {
    this.target.id = targetId;
    this.completed = false;
    this.path = [];
    this.target.lastPosition = null;
    this.lostSightTime = 0;
    this.recalculation.last = 0;
    this.lastAttackTime = 0;
    this.cooldowns.clear();
    this.alert.active = false;
  }

  update(entity: Entity): Partial<Input> {
    if (entity.isLocked) return {};

    const target = entity.scene.managers.players.get(this.target.id);

    if (!target || target.state === StateName.DEAD)
      return handlers.behavior.lookAround(entity, this);

    if (!this.target.lastPosition)
      this.target.lastPosition = { x: target.x, y: target.y };

    const now = entity.scene.time.now;

    const canSee = handlers.vision.canSee(
      entity.scene,
      entity,
      target,
      600,
      Math.PI / 2,
      7,
    );

    if (canSee) {
      this.target.lastPosition = { x: target.x, y: target.y };
      this.lostSightTime = 0;

      const distance = Phaser.Math.Distance.Between(
        entity.x,
        entity.y,
        target.x,
        target.y,
      );

      const definition = configs.entities[entity.name];
      const attacks = definition?.attacks;

      if (!attacks?.length) {
        this.completed = true;
        return {};
      }

      const frustrated =
        now - this.lastAttackTime > this.frustrationThreshold;

      const angle = Phaser.Math.Angle.Between(
        entity.x,
        entity.y,
        target.x,
        target.y,
      );
      const facing = handlers.direction.fromAngle(angle);

      for (const config of attacks) {
        const range = config.range ?? 40;
        const minRange = frustrated ? 0 : (config.minRange ?? 0);

        if (distance < minRange || distance > range) continue;
        if (now < (this.cooldowns.get(config.state) ?? 0)) continue;

        if (config.weapon) {
          const weapon = configs.weapons[config.weapon];
          const offset = handlers.direction.getDirectionalOffset(facing, 24);

          const hitboxX = entity.x + offset.x;
          const hitboxY = entity.y + offset.y;
          const halfW = (weapon.hitbox?.width || 16) / 2;
          const halfH = (weapon.hitbox?.height || 16) / 2;

          const body = target.body as Phaser.Physics.Arcade.Body;
          const padX = body ? body.halfWidth : 8;
          const padY = body ? body.halfHeight : 8;

          const within =
            target.x >= hitboxX - halfW - padX &&
            target.x <= hitboxX + halfW + padX &&
            target.y >= hitboxY - halfH - padY &&
            target.y <= hitboxY + halfH + padY;

          if (!within) continue;
        }

        this.lastAttackTime = now;
        this.cooldowns.set(
          config.state,
          now + (config.cooldown ?? 1000),
        );

        return {
          facing,
          moving: [],
          isRunning: false,
          state: config.state,
        };
      }

      if (handlers.path.stuck(entity, this.stuck, now, 2)) {
        const grid = handlers.path.getGrid(entity);

        if (grid.length) {
          const { tileManager } = entity.scene;

          const from = handlers.path.position(entity);
          const to = handlers.path.position(target);

          const start = {
            x: Math.floor(from.x / tileManager.map.tileWidth),
            y: Math.floor(from.y / tileManager.map.tileHeight),
          };

          const end = {
            x: Math.floor(to.x / tileManager.map.tileWidth),
            y: Math.floor(to.y / tileManager.map.tileHeight),
          };

          this.path =
            handlers.path.find(grid, start, end, tileManager.map, true) || [];

          if (this.path.length) this.path.shift();
        }
      }

      if (this.path.length) {
        const input = handlers.path.follow(entity, this.path, 8, true);
        if (input) return input;
      }

      const chaseAngle = Phaser.Math.Angle.Between(
        entity.x,
        entity.y,
        target.x,
        target.y,
      );
      const direction = handlers.direction.fromAngle(chaseAngle);

      return {
        facing: direction,
        moving: [direction],
        isRunning: true,
      };
    }

    this.lostSightTime += entity.scene.game.loop.delta;

    if (this.lostSightTime > this.lostSightThreshold) {
      this.completed = true;
      
      handlers.behavior.search(entity, this.target.lastPosition);

      return {
        facing: entity.facing,
        moving: [],
        isRunning: false,
      };
    }

    if (this.target.lastPosition) {
      if (
        !this.path.length &&
        now - this.recalculation.last > this.recalculation.interval
      ) {
        this.recalculation.last = now;

        const grid = handlers.path.getGrid(entity);

        if (grid.length) {
          const { tileManager } = entity.scene;

          const from = handlers.path.position(entity);

          const start = {
            x: Math.floor(from.x / tileManager.map.tileWidth),
            y: Math.floor(from.y / tileManager.map.tileHeight),
          };

          const end = {
            x: Math.floor(
              this.target.lastPosition.x / tileManager.map.tileWidth,
            ),
            y: Math.floor(
              this.target.lastPosition.y / tileManager.map.tileHeight,
            ),
          };

          this.path =
            handlers.path.find(grid, start, end, tileManager.map, true) || [];
        }
      }

      if (this.path.length && handlers.path.stuck(entity, this.stuck, now, 2))
        this.path = [];

      if (this.path.length) {
        const input = handlers.path.follow(entity, this.path, 8, true);

        if (!input) {
          this.completed = true;
          handlers.behavior.search(entity, this.target.lastPosition);
          return { facing: entity.facing, moving: [], isRunning: false };
        }

        return input;
      }
    }

    return { facing: entity.facing, moving: [], isRunning: false };
  }

  reset(): void {
    this.target.id = "";
    this.path = [];
    this.target.lastPosition = null;
    this.lostSightTime = 0;
    this.recalculation.last = 0;
    this.lastAttackTime = 0;
    this.cooldowns.clear();
    this.alert.active = false;
  }
}
