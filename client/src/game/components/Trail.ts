import { ComponentName } from "@server/types";
import { Landmark } from "@server/types/generation";
import { Component } from "./Component";
import { emitters } from "../vfx/emitters";
import { handlers } from "../handlers";
import type { Player } from "../Player";

const INTERVAL = 1000;
const EXPANSIONS = 20000;
const TILES = 24;
const DEVIATION = 4;
const ARRIVAL = 32;
const FADE = 1200;
const RETRY = 480;

export class TrailComponent extends Component {
  name = ComponentName.TRAIL;

  private player: Player;
  private emitter: Phaser.GameObjects.Particles.ParticleEmitter;
  private zone?: Phaser.GameObjects.Particles.Zones.RandomZone;
  private points: Array<{ x: number; y: number }> = [];
  private target: Landmark | null = null;
  private unreachable = new Map<Landmark, { x: number; y: number }>();
  private enabled = false;
  private lastAt = 0;
  private fade?: Phaser.Tweens.Tween;

  constructor(player: Player) {
    super();

    this.player = player;
    this.emitter = emitters.trail(player.scene);
  }

  setEnabled(enabled: boolean): void {
    if (enabled === this.enabled) return;
    this.enabled = enabled;

    if (!enabled) {
      this.emitter.stop();
      this.fade = this.player.scene.tweens.add({
        targets: this.emitter,
        alpha: 0,
        duration: FADE,
      });

      return;
    }

    this.fade?.stop();
    this.fade = undefined;
    this.emitter.setAlpha(1);

    this.points = [];
    this.target = null;
    this.lastAt = 0;
  }

  update(): void {
    if (!this.enabled) return;

    const now = this.player.scene.time.now;
    if (now - this.lastAt < INTERVAL) return;
    this.lastAt = now;

    const target = this._target();

    if (!target) {
      this._clear();
      return;
    }

    if (
      target === this.target &&
      this.points.length > 1 &&
      !this._strayed() &&
      !this._consumed()
    )
      return;

    this.target = target;
    this._route(target);
  }

  detach(): void {
    this.fade?.stop();
    this.emitter.destroy();
  }

  private _target(): Landmark | null {
    const { x, y, scene } = this.player;

    let nearest: Landmark | null = null;
    let nearestDist = Infinity;

    for (const landmark of scene.landmarks) {
      const failed = this.unreachable.get(landmark);

      if (failed) {
        if (
          Phaser.Math.Distance.Squared(x, y, failed.x, failed.y) <
          RETRY * RETRY
        )
          continue;

        this.unreachable.delete(landmark);
      }

      const dist = Phaser.Math.Distance.Squared(x, y, landmark.x, landmark.y);

      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = landmark;
      }
    }

    return nearestDist > ARRIVAL * ARRIVAL ? nearest : null;
  }

  private _strayed(): boolean {
    const { x, y } = this.player;
    const limit =
      DEVIATION * (this.player.scene.tileManager?.map.tileWidth ?? 16);

    let nearest = Infinity;

    for (const point of this.points) {
      const dist = Phaser.Math.Distance.Squared(x, y, point.x, point.y);
      if (dist < nearest) nearest = dist;
    }

    return nearest > limit * limit;
  }

  private _consumed(): boolean {
    const last = this.points[this.points.length - 1];
    if (!last) return true;

    const reach =
      TILES * 0.25 * (this.player.scene.tileManager?.map.tileWidth ?? 16);

    return (
      Phaser.Math.Distance.Squared(
        this.player.x,
        this.player.y,
        last.x,
        last.y,
      ) <
      reach * reach
    );
  }

  private _route(target: Landmark): void {
    const map = this.player.scene.tileManager?.map;

    if (!map) {
      this._clear();
      return;
    }

    const grid = handlers.path.getGrid(this.player);

    const start = {
      x: Math.floor(this.player.x / map.tileWidth),
      y: Math.floor(this.player.y / map.tileHeight),
    };

    const end = {
      x: Math.floor(target.x / map.tileWidth),
      y: Math.floor(target.y / map.tileHeight),
    };

    const route = handlers.path.find(grid, start, end, map, true, EXPANSIONS);

    if (!route || route.length < 2) {
      this.unreachable.set(target, { x: this.player.x, y: this.player.y });
      this.target = null;
      this._clear();

      return;
    }

    this.points = route.slice(0, TILES);

    const curve = new Phaser.Curves.Path(this.points[0].x, this.points[0].y);

    for (let i = 1; i < this.points.length; i++)
      curve.lineTo(this.points[i].x, this.points[i].y);

    const source =
      curve as unknown as Phaser.Types.GameObjects.Particles.RandomZoneSource;

    if (this.zone) this.zone.source = source;
    else {
      const [zone] = this.emitter.addEmitZone({ type: "random", source });

      this.zone = zone as Phaser.GameObjects.Particles.Zones.RandomZone;
    }

    this.emitter.start();
  }

  private _clear(): void {
    this.points = [];
    this.emitter.stop();
  }
}
