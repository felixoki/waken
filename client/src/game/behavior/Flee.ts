import {
  BehaviorName,
  FleeBehaviorConfig,
  Input,
  Stuck,
  Waypoint,
} from "@server/types";
import { Behavior } from "./Behavior";
import { Entity } from "../Entity";
import { handlers } from "../handlers";

export class FleeBehavior extends Behavior {
  private targetId: string = "";
  private path: Waypoint[] = [];
  private exit: Waypoint | null = null;
  private stuck: Stuck = {
    lastPosition: { x: 0, y: 0 },
    lastCheck: 0,
    interval: 200,
  };
  private attempts: number = 0;

  public name = BehaviorName.FLEE;

  constructor(config?: FleeBehaviorConfig) {
    super();
    this.repeat = config?.repeat ?? false;
  }

  start(targetId: string): void {
    this.targetId = targetId;
    this.completed = false;
    this.path = [];
    this.exit = null;
    this.attempts = 0;
  }

  update(entity: Entity): Partial<Input> {
    if (!entity.scene.tileManager) return {};

    const map = entity.scene.tileManager.map;
    const tw = map.tileWidth;
    const th = map.tileHeight;
    const mapW = map.widthInPixels;
    const mapH = map.heightInPixels;

    if (!this.exit) {
      const exit = this._getExitPoint(entity, mapW, mapH);

      if (!exit) {
        this._despawn(entity);
        return {};
      }

      this.exit = exit;
      this.path = [];
    }

    if (this.exit && !this.path.length) {
      const grid = handlers.path.getGrid(entity.scene);
      if (!grid.length) return {};

      const start = {
        x: Math.floor(entity.x / tw),
        y: Math.floor(entity.y / th),
      };
      const end = {
        x: Math.floor(this.exit.x / tw),
        y: Math.floor(this.exit.y / th),
      };

      this.path = handlers.path.find(grid, start, end, map) || [];

      if (!this.path.length) {
        this.attempts++;
        this.exit = null;

        if (this.attempts > 3) {
          this._despawn(entity);
          return {};
        }

        return { facing: entity.facing, moving: [], isRunning: true };
      }
    }

    const now = Date.now();

    if (this.path.length && handlers.path.stuck(entity, this.stuck, now, 4)) {
      this.attempts++;
      this.path = [];
      this.exit = null;

      if (this.attempts > 3) {
        this._despawn(entity);
        return {};
      }

      return { facing: entity.facing, moving: [], isRunning: true };
    }

    if (this.path.length) {
      const input = handlers.path.follow(entity, this.path, 8, true);

      if (!input) {
        this._despawn(entity);
        return {};
      }

      return { ...input, isRunning: true };
    }

    return { facing: entity.facing, moving: [], isRunning: true };
  }

  reset(): void {
    this.path = [];
    this.exit = null;
    this.targetId = "";
    this.attempts = 0;
  }

  private _getExitPoint(
    entity: Entity,
    width: number,
    height: number,
  ): Waypoint | null {
    const player = entity.scene.managers.players.get(this.targetId);
    if (!player) return null;

    let dx = entity.x - player.x;
    let dy = entity.y - player.y;

    if (this.attempts > 0) {
      const jitter = (Math.random() - 0.5) * Math.PI * 0.5;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const angle = Math.atan2(dy, dx) + jitter;

      dx = Math.cos(angle) * len;
      dy = Math.sin(angle) * len;
    }

    const margin = 8;

    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0
        ? { x: width - margin, y: entity.y }
        : { x: margin, y: entity.y };
    }

    return dy > 0
      ? { x: entity.x, y: height - margin }
      : { x: entity.x, y: margin };
  }

  private _despawn(entity: Entity): void {
    this.completed = true;

    entity.scene.game.events.emit("entity:flee", entity.id);
  }
}
