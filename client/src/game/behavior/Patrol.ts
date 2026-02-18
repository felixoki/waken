import {
  BehaviorName,
  Idle,
  Input,
  Scan,
  Stuck,
  Waypoint,
} from "@server/types";
import { Behavior } from "./Behavior";
import { Entity } from "../Entity";
import { handlers } from "../handlers";

export class Patrol extends Behavior {
  private spawn: Waypoint = { x: 0, y: 0 };
  private radius: number = 300;
  private path: Waypoint[] = [];
  private target: Waypoint | null = null;
  private scan: Scan = { last: 0, interval: 1500 };
  private idle: Idle = { time: 0, duration: 4000 };
  private stuck: Stuck = {
    lastPosition: { x: 0, y: 0 },
    lastCheck: 0,
    interval: 200,
  };
  public name = BehaviorName.PATROL;

  constructor(radius: number, repeat: boolean) {
    super();

    this.radius = radius;
    this.repeat = repeat;
  }

  update(entity: Entity): Partial<Input> {
    if (this.spawn.x === 0) this.spawn = { x: entity.x, y: entity.y };

    const now = Date.now();

    if (now - this.scan.last > this.scan.interval) {
      this.scan.last = now;

      const players = entity.scene.managers.players.all.filter(
        (p) => p && p.map === entity.map,
      );

      for (const player of players) {
        if (
          handlers.vision.canSee(
            entity.scene,
            entity,
            player,
            /**
             * We should introduce a patrol config
             */
            400,
            Math.PI * 2,
            7,
          )
        ) {
          entity.scene.game.events.emit("entity:spotted:player", {
            entityId: entity.id,
            playerId: player.id,
          });

          return {
            facing: entity.facing,
            moving: [],
            isRunning: false,
          };
        }
      }
    }

    if (this.idle.time > 0) {
      this.idle.time -= entity.scene.game.loop.delta;

      return {};
    }

    if (this.path.length && handlers.path.stuck(entity, this.stuck, now, 4)) {
      this.path = [];
      this.target = null;
    }

    if (!this.target && !this.path.length) this.target = this._getRandomPoint();

    if (this.target && !this.path.length) {
      const grid = handlers.path.getGrid(entity.scene);

      if (!grid.length || !entity.scene.tileManager) return {};

      const start = {
        x: Math.floor(entity.x / entity.scene.tileManager.map.tileWidth),
        y: Math.floor(entity.y / entity.scene.tileManager.map.tileHeight),
      };

      const end = {
        x: Math.floor(this.target.x / entity.scene.tileManager.map.tileWidth),
        y: Math.floor(this.target.y / entity.scene.tileManager.map.tileHeight),
      };

      this.path =
        handlers.path.find(grid, start, end, entity.scene.tileManager.map) ||
        [];

      if (!this.path.length) this.target = null;
    }

    if (this.path.length) {
      const input = handlers.path.follow(entity, this.path, 8, false);

      if (!input) {
        this.target = null;
        this.idle.time = this.idle.duration;
        return {};
      }

      return input;
    }

    return {
      facing: entity.facing,
      moving: [],
      isRunning: false,
    };
  }

  reset(): void {
    this.path = [];
    this.target = null;
    this.scan.last = 0;
    this.idle.time = 0;
  }

  private _getRandomPoint(): Waypoint {
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * this.radius;

    return {
      x: this.spawn.x + Math.cos(angle) * distance,
      y: this.spawn.y + Math.sin(angle) * distance,
    };
  }
}
