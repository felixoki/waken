import {
  AmbushBehaviorConfig,
  BehaviorName,
  Event,
  Input,
  Scan,
  StateName,
  Stuck,
  Waypoint,
} from "@server/types";
import { Behavior } from "./Behavior";
import { Entity } from "../Entity";
import { handlers } from "../handlers";
import { AMBUSH_HOME_DEPTH, AMBUSH_HOME_SEARCH, PATH_ARRIVAL } from "@server/globals";
import type { Scene } from "../scenes/Scene";

export class AmbushBehavior extends Behavior {
  private spawn: Waypoint | null = null;
  private radius: number;
  private path: Waypoint[] = [];
  private scan: Scan = { last: 0, interval: 400 };
  private stuck: Stuck = {
    lastPosition: { x: 0, y: 0 },
    lastCheck: 0,
    interval: 200,
  };

  public name = BehaviorName.AMBUSH;

  constructor(config?: AmbushBehaviorConfig) {
    super();

    this.repeat = true;
    this.radius = config?.radius ?? 80;
    this.scan.interval = config?.scan?.interval ?? 400;
  }

  update(entity: Entity): Partial<Input> {
    this.spawn ??= this._home(entity);

    const now = entity.scene.time.now;
    const home = Math.hypot(entity.x - this.spawn.x, entity.y - this.spawn.y) <= PATH_ARRIVAL * 2;

    if (home && now - this.scan.last > this.scan.interval) {
      this.scan.last = now;

      const prey = entity.scene.managers.players.all.find(
        (p) =>
          p &&
          p.map === entity.map &&
          p.state !== StateName.DEAD &&
          handlers.vision.canSee(entity.scene, entity, p, this.radius, Math.PI * 2),
      );

      if (prey) {
        entity.scene.game.events.emit(Event.ENTITY_SPOTTED_PLAYER, {
          entityId: entity.id,
          playerId: prey.id,
        });

        return { facing: entity.facing, moving: [], isRunning: false };
      }
    }

    if (home) {
      this.path = [];
      return { facing: entity.facing, moving: [], isRunning: false };
    }

    if (this.path.length && handlers.path.stuck(entity, this.stuck, now, 4)) this.path = [];

    if (!this.path.length) {
      if (!entity.scene.tileManager) return {};
      this.path = handlers.path.plan(entity, this.spawn, false) ?? [];
      if (!this.path.length) return { moving: [], isRunning: false };
    }

    const input = handlers.path.follow(entity, this.path, PATH_ARRIVAL, false);
    if (!input) {
      this.path = [];
      return { moving: [], isRunning: false };
    }

    return input;
  }

  private _home(entity: Entity): Waypoint {
    const water = (entity.scene as Scene).water;
    if (!water) return { x: entity.x, y: entity.y };

    const { tile, columns, rows, distance } = water;
    const cx = Math.floor(entity.x / tile);
    const cy = Math.floor(entity.y / tile);
    if (distance[cy * columns + cx] >= AMBUSH_HOME_DEPTH) return { x: entity.x, y: entity.y };

    let best: Waypoint | null = null;
    let nearest = Infinity;
    for (let y = cy - AMBUSH_HOME_SEARCH; y <= cy + AMBUSH_HOME_SEARCH; y++)
      for (let x = cx - AMBUSH_HOME_SEARCH; x <= cx + AMBUSH_HOME_SEARCH; x++) {
        if (x < 0 || y < 0 || x >= columns || y >= rows) continue;
        if (distance[y * columns + x] < AMBUSH_HOME_DEPTH) continue;
        const d = (x - cx) ** 2 + (y - cy) ** 2;
        if (d < nearest) {
          nearest = d;
          best = { x: x * tile + tile / 2, y: y * tile + tile / 2 };
        }
      }

    return best ?? { x: entity.x, y: entity.y };
  }

  reset(): void {
    this.completed = false;
    this.path = [];
  }
}
