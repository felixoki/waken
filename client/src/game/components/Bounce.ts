import { ComponentName, Event } from "@server/types";
import { Entity } from "../Entity";
import { Component } from "./Component";
import { BouncePipeline } from "../pipelines/Bounce";

interface PoolEntry {
  pipeline: BouncePipeline;
  refs: number;
  startTime: number;
}

const pool = {
  entries: new Map<string, PoolEntry>(),
  nextId: 0,

  acquire(game: Phaser.Game, startTime: number, tolerance = 200): PoolEntry {
    for (const entry of pool.entries.values())
      if (Math.abs(entry.startTime - startTime) < tolerance) {
        entry.refs++;
        return entry;
      }

    const name = `bounce_pool_${pool.nextId++}`;
    const pipeline = new BouncePipeline(game, name);
    const renderer = game.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
    renderer.pipelines.add(name, pipeline);

    const entry: PoolEntry = { pipeline, refs: 1, startTime };
    pool.entries.set(name, entry);

    return entry;
  },

  release(entry: PoolEntry, game: Phaser.Game): void {
    entry.refs--;

    if (entry.refs <= 0) {
      const renderer = game.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
      renderer.pipelines.remove(entry.pipeline.name);
      pool.entries.delete(entry.pipeline.name);
    }
  },
};

export class BounceComponent extends Component {
  private entity: Entity;
  private isAnimating: boolean = false;
  private activeEntry?: PoolEntry;
  private timer?: Phaser.Time.TimerEvent;

  public name = ComponentName.BOUNCE;

  constructor(entity: Entity) {
    super();
    this.entity = entity;
  }

  attach(): void {
    this.entity.scene.game.events.on(Event.ENTITY_OVERLAP, this._bounce, this);
  }

  private _bounce = (entity: Entity, other: Entity) => {
    if (entity.id !== this.entity.id && other.id !== this.entity.id) return;
    if (this.isAnimating) return;

    this.isAnimating = true;

    const game = this.entity.scene.game;
    const now = game.loop.time;

    this.activeEntry = pool.acquire(game, now);
    this.activeEntry.pipeline.trigger(0.15, 2.0, 2.5, 10.0);
    this.entity.setPipeline(this.activeEntry.pipeline.name);

    this.timer = this.entity.scene.time.delayedCall(2000, () => {
      this.timer = undefined;
      this.entity.resetPipeline();

      if (this.activeEntry) {
        pool.release(this.activeEntry, game);
        this.activeEntry = undefined;
      }

      this.isAnimating = false;
    });
  };

  update(): void {}

  detach(): void {
    this.entity.scene.game.events.off(Event.ENTITY_OVERLAP, this._bounce, this);

    if (this.timer) {
      this.timer.destroy();
      this.timer = undefined;
    }

    if (this.activeEntry) {
      this.entity.resetPipeline();
      pool.release(this.activeEntry, this.entity.scene.game);
      this.activeEntry = undefined;
    }
  }
}
