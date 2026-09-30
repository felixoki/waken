import {
  BehaviorName,
  Event,
  Input,
  Scan,
  StateName,
  Stuck,
  Waypoint,
  WanderBehaviorConfig,
} from "@server/types";
import { Behavior } from "./Behavior";
import { Entity } from "../Entity";
import { handlers } from "../handlers";
import { PATH_ARRIVAL } from "@server/globals";

export class WanderBehavior extends Behavior {
  private spawn: Waypoint = { x: 0, y: 0 };
  private radius: number;
  private path: Waypoint[] = [];
  private target: Waypoint | null = null;
  private scan: Scan = { last: 0, interval: 1000 };
  private idle: { time: number; range: [number, number] } = {
    time: 0,
    range: [2000, 6000],
  };
  private stuck: Stuck = {
    lastPosition: { x: 0, y: 0 },
    lastCheck: 0,
    interval: 200,
  };
  private vision: number = 600;
  private fov: number = Math.PI * 2;

  public name = BehaviorName.WANDER;

  constructor(config?: WanderBehaviorConfig) {
    super();

    this.radius = config?.radius ?? 120;
    this.repeat = config?.repeat ?? true;
    this.scan.interval = config?.scan?.interval ?? 1000;
    this.idle.range = config?.idle?.range ?? [2000, 6000];
    this.vision = config?.vision ?? 300;
    this.fov = config?.fov ?? Math.PI * 2;
  }

  update(entity: Entity): Partial<Input> {
    if (this.spawn.x === 0) this.spawn = { x: entity.x, y: entity.y };

    const now = entity.scene.time.now;

    if (now - this.scan.last > this.scan.interval) {
      this.scan.last = now;

      const players = entity.scene.managers.players.all.filter(
        (p) => p && p.map === entity.map && p.state !== StateName.DEAD,
      );

      for (const player of players) {
        if (
          handlers.vision.canSee(
            entity.scene,
            entity,
            player,
            this.vision,
            this.fov,
            7,
          )
        ) {
          entity.scene.game.events.emit(Event.ENTITY_SPOTTED_PLAYER, {
            entityId: entity.id,
            playerId: player.id,
          });

          return { facing: entity.facing, moving: [], isRunning: false };
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
      if (!entity.scene.tileManager) return {};

      this.path = handlers.path.plan(entity, this.target, false) ?? [];

      if (!this.path.length) {
        this.target = null;
        this.idle.time = this._randomIdle();
      }
    }

    if (this.path.length) {
      const input = handlers.path.follow(entity, this.path, PATH_ARRIVAL, false);

      if (!input) {
        this.target = null;
        this.idle.time = this._randomIdle();
        return {};
      }

      return input;
    }

    return { facing: entity.facing, moving: [], isRunning: false };
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

  private _randomIdle(): number {
    const [min, max] = this.idle.range;
    return min + Math.random() * (max - min);
  }
}
