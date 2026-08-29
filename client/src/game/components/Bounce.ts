import { ComponentName, Event, PipelineName, SoundName } from "@server/types";
import { Entity } from "../Entity";
import { Component } from "./Component";
import {
  BOUNCE_POOL_SIZE,
  BouncePipeline,
  bounceSlotName,
} from "../pipelines/Bounce";

interface Slot {
  name: string;
  startTime: number;
}

const slots: Slot[] = Array.from({ length: BOUNCE_POOL_SIZE }, (_, i) => ({
  name: bounceSlotName(i),
  startTime: -Infinity,
}));

let cursor = 0;

const pool = {
  /**
   * Slots are registered once at boot, so handing one out is free. Bounces
   * landing within `tolerance` of a slot share its wave; anything later takes
   * the next slot round-robin.
   *
   * `startTime` is deliberately not refreshed on a match: rolling it forward
   * would funnel every bounce into one slot and re-trigger it forever, so
   * reeds already riding that wave would never settle.
   */
  acquire(startTime: number, tolerance = 200): string {
    for (const slot of slots)
      if (Math.abs(slot.startTime - startTime) < tolerance) return slot.name;

    const slot = slots[cursor++ % BOUNCE_POOL_SIZE];
    slot.startTime = startTime;

    return slot.name;
  },
};

export class BounceComponent extends Component {
  private entity: Entity;
  private isAnimating: boolean = false;
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

    this.entity.scene.managers.sound.play.sfx(SoundName.RUSTLE, {
      position: { x: this.entity.x, y: this.entity.y },
    });

    const game = this.entity.scene.game;
    const renderer = game.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
    const name = pool.acquire(game.loop.time);
    const pipeline = renderer.pipelines.get(name) as BouncePipeline;

    pipeline.trigger(0.15, 2.0, 2.5, 10.0);
    this.entity.setPipeline(name);

    this.timer = this.entity.scene.time.delayedCall(2000, () => {
      this.timer = undefined;
      this.entity.setPipeline(PipelineName.WIND);
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
  }
}
