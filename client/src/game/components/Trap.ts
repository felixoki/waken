import { ComponentName, Event, TrapConfig } from "@server/types";
import { Entity } from "../Entity";
import { Component } from "./Component";
import { Hitbox } from "../Hitbox";

export class TrapComponent extends Component {
  private entity: Entity;
  private config: TrapConfig;
  private armed = true;
  private timers: Phaser.Time.TimerEvent[] = [];
  private animKey: string;

  public name = ComponentName.TRAP;

  constructor(entity: Entity, config: TrapConfig) {
    super();

    this.entity = entity;
    this.config = config;
    this.animKey = `${entity.name}_tex_anim`;
  }

  attach(): void {
    this.entity.scene.game.events.on(Event.ENTITY_OVERLAP, this._trip, this);
  }

  private _trip = (entity: Entity, other: Entity) => {
    if (entity.id !== this.entity.id && other.id !== this.entity.id) return;
    if (!this.armed) return;

    this.armed = false;

    const scene = this.entity.scene;
    const config = this.config;

    this.entity.play(this.animKey);

    this.timers.push(
      scene.time.delayedCall(config.delay, () => {
        const body = this.entity.body as Phaser.Physics.Arcade.Body | null;
        const x = body ? body.center.x : this.entity.x;
        const y = body ? body.center.y : this.entity.y;

        new Hitbox(
          scene,
          x,
          y,
          config.hitbox.width,
          config.hitbox.height,
          this.entity.id,
          config,
          this.entity.clearance,
          true,
        );
      }),
    );

    this.timers.push(
      scene.time.delayedCall(config.delay + config.duration, () => {
        this.entity.anims.playReverse(this.animKey);
      }),
    );

    this.timers.push(
      scene.time.delayedCall(
        config.delay + config.duration + config.cooldown,
        () => {
          this.armed = true;
        },
      ),
    );
  };

  update(): void {}

  detach(): void {
    this.entity.scene.game.events.off(Event.ENTITY_OVERLAP, this._trip, this);

    for (const timer of this.timers) timer.destroy();
    this.timers = [];
  }
}
