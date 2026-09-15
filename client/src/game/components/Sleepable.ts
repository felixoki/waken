import {
  ComponentName,
  Direction,
  Event,
  SleepableConfig,
} from "@server/types";
import {
  SLEEP_FRAMES,
  SLEEP_FRAMERATE,
  SLEEP_RANGE,
} from "@server/globals";
import { Entity } from "../Entity";
import { Component } from "./Component";
import { handlers } from "../handlers";

const TEXTURE = "player-sleeping";

export class SleepableComponent extends Component {
  private entity: Entity;
  private config: SleepableConfig;
  private sprite?: Phaser.GameObjects.Sprite;

  public name = ComponentName.SLEEPABLE;

  constructor(entity: Entity, config: SleepableConfig) {
    super();

    this.entity = entity;
    this.config = config;
  }

  attach(): void {
    this.entity.on("pointed", this._sleep, this);
    this.entity.scene.game.events.on(Event.ENTITY_LOCK, this._locked, this);
    this.entity.scene.game.events.on(Event.ENTITY_UNLOCK, this._unlocked, this);

    if (this.entity.isLocked) this._show();
  }

  update(): void {}

  detach(): void {
    this.entity.off("pointed", this._sleep, this);
    this.entity.scene.game.events.off(Event.ENTITY_LOCK, this._locked, this);
    this.entity.scene.game.events.off(
      Event.ENTITY_UNLOCK,
      this._unlocked,
      this,
    );

    this._hide();
  }

  private _locked(data: { entityId: string }): void {
    if (data.entityId === this.entity.id) this._show();
  }

  private _unlocked(id: string): void {
    if (id === this.entity.id) this._hide();
  }

  private _show(): void {
    if (this.sprite) return;

    const scene = this.entity.scene;
    if (!scene.textures.exists(TEXTURE)) return;

    const { anchor, facing, depth } = this.config;
    const key = `${TEXTURE}-${facing}`;

    if (!scene.anims.exists(key)) {
      const start = Object.values(Direction).indexOf(facing) * SLEEP_FRAMES;
      const frames = scene.anims.generateFrameNumbers(TEXTURE, {
        start,
        end: start + SLEEP_FRAMES - 1,
      });

      if (!frames.length) return;

      scene.anims.create({ key, frames, frameRate: SLEEP_FRAMERATE, repeat: -1 });
    }

    this.sprite = scene.add.sprite(
      this.entity.x + anchor.x,
      this.entity.y + anchor.y,
      TEXTURE,
    );

    this.sprite.setDepth(1000 + this.entity.y + depth);
    this.sprite.play(key);
  }

  private _hide(): void {
    this.sprite?.destroy();
    this.sprite = undefined;
  }

  private _sleep(): void {
    if (this.entity.isLocked) return;

    const player = this.entity.scene.managers.players.player;
    if (!player || player.isLocked || handlers.sleep.is(player)) return;

    const distance = Phaser.Math.Distance.Between(
      this.entity.x,
      this.entity.y,
      player.x,
      player.y,
    );

    if (distance > SLEEP_RANGE) return;

    player.bed = this.entity.id;

    this.entity.scene.game.events.emit(Event.PLAYER_SLEEP_REQUEST, {
      entityId: this.entity.id,
    });
  }
}
