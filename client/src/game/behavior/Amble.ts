import {
  AmbleBehaviorConfig,
  BehaviorName,
  Idle,
  Input,
  Stuck,
  Waypoint,
} from "@server/types";
import { Behavior } from "./Behavior";
import { Entity } from "../Entity";
import { handlers } from "../handlers";

export class Amble extends Behavior {
  private spawn: Waypoint = { x: 0, y: 0 };
  private radius: number;
  private path: Waypoint[] = [];
  private target: Waypoint | null = null;
  private idle: Idle & { range: [number, number] } = {
    time: 0,
    duration: 0,
    range: [0, 0],
  };
  private stuck: Stuck = {
    lastPosition: { x: 0, y: 0 },
    lastCheck: 0,
    interval: 200,
  };

  public name = BehaviorName.AMBLE;

  constructor(config?: AmbleBehaviorConfig) {
    super();

    this.radius = config?.radius ?? 80;
    this.idle.range = config?.idle?.range ?? [5000, 12000];
    this.repeat = config?.repeat ?? true;
  }

  update(entity: Entity): Partial<Input> {
    if (this.spawn.x === 0) this.spawn = { x: entity.x, y: entity.y };

    if (this.idle.time > 0) {
      this.idle.time -= entity.scene.game.loop.delta;
      return {};
    }

    const now = Date.now();

    if (this.path.length && handlers.path.stuck(entity, this.stuck, now, 4)) {
      this.path = [];
      this.target = null;
    }

    if (!this.target && !this.path.length) this.target = this._getRandomPoint();

    if (this.target && !this.path.length) {
      const grid = handlers.path.getGrid(entity.scene);

      if (!grid.length || !entity.scene.tileManager) return {};

      const tw = entity.scene.tileManager.map.tileWidth;
      const th = entity.scene.tileManager.map.tileHeight;

      const start = {
        x: Math.floor(entity.x / tw),
        y: Math.floor(entity.y / th),
      };

      const end = {
        x: Math.floor(this.target.x / tw),
        y: Math.floor(this.target.y / th),
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
        this.idle.time = this._randomIdle();
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
