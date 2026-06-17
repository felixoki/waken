import { AmbientSoundConfig, ComponentName } from "@server/types";
import { Component } from "./Component";
import { Entity } from "../Entity";

export class AmbientSoundComponent extends Component {
  name = ComponentName.AMBIENT_SOUND;

  private entity: Entity;
  private config: AmbientSoundConfig;
  private timer?: Phaser.Time.TimerEvent;
  private sound: Phaser.Sound.WebAudioSound | null = null;

  constructor(entity: Entity, config: AmbientSoundConfig) {
    super();
    this.entity = entity;
    this.config = config;
  }

  attach(): void {
    if (this.config.loop) {
      this.sound = this.entity.scene.managers.sound.play.loop(
        this.config.name,
        {
          position: { x: this.entity.x, y: this.entity.y },
          persist: true,
        },
      );

      return;
    }
    
    this._schedule();
  }

  update(): void {
    if (!this.config.loop || !this.sound) return;

    const { volume, pan } = this.entity.scene.managers.sound.spatial(
      this.config.name,
      { x: this.entity.x, y: this.entity.y },
    );

    this.sound.setVolume(volume);
    this.sound.setPan(pan);
  }

  detach(): void {
    this.timer?.destroy();
    this.timer = undefined;
    this.sound?.stop();
    this.sound?.destroy();
    this.sound = null;
  }

  private _schedule(): void {
    if (!this.config.interval) return;

    const [min, max] = this.config.interval;
    const delay = min + Math.random() * (max - min);

    this.timer = this.entity.scene.time.delayedCall(delay, () => {
      if (!this.entity.scene) return;

      this.entity.scene.managers.sound.play.sfx(this.config.name, {
        position: { x: this.entity.x, y: this.entity.y },
      });

      this._schedule();
    });
  }
}
