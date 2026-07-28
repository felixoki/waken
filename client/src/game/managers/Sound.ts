import { configs } from "@server/configs";
import { MainScene } from "../scenes/Main";
import {
  AmbienceDomain,
  AmbienceName,
  AudioConfig,
  ChannelName,
  MusicName,
  SfxConfig,
  SoundName,
} from "@server/types";
import { CROSSFADE_DURATION } from "@server/globals";
import {
  SFX_FALLOFF_NEAR,
  SFX_FALLOFF_FAR,
  SFX_MAX_PAN,
} from "@server/globals";

type Sound = Phaser.Sound.WebAudioSound;

export class SoundManager {
  private scene: MainScene;
  private current: { name: MusicName; sound: Sound } | null = null;
  private layers: Map<AmbienceName, Sound> = new Map();
  private domains: Map<AmbienceName, AmbienceDomain> = new Map();
  private volume: { music: number; ambience: number; sfx: number };
  private queue: { music: MusicName[]; index: number } = {
    music: [],
    index: 0,
  };

  constructor(scene: MainScene) {
    this.scene = scene;
    this.volume = this._load();
  }

  play = {
    sfx: (
      name: SoundName,
      opts?: {
        volume?: number;
        rate?: number;
        position?: { x: number; y: number };
      },
    ) => {
      const config: SfxConfig =
        configs.sounds.sfx[name as keyof typeof configs.sounds.sfx];
      if (!config) return;

      let volume = (opts?.volume ?? config.volume) * this.volume.sfx;
      let pan = 0;

      if (opts?.position) {
        const spatial = this._spatial(opts.position);
        if (spatial.volume <= 0) return;
        volume *= spatial.volume;
        pan = spatial.pan;
      }

      const key = config.variants
        ? config.variants[Math.floor(Math.random() * config.variants.length)]
        : name;

      this.scene.sound.play(key, {
        volume,
        pan,
        rate: opts?.rate ?? 0.95 + Math.random() * 0.1,
      });
    },

    loop: (
      name: SoundName,
      opts?: {
        volume?: number;
        position?: { x: number; y: number };
        persist?: boolean;
      },
    ): Sound | null => {
      const config: SfxConfig =
        configs.sounds.sfx[name as keyof typeof configs.sounds.sfx];
      if (!config) return null;

      let volume = (opts?.volume ?? config.volume) * this.volume.sfx;
      let pan = 0;

      if (opts?.position) {
        const spatial = this._spatial(opts.position);
        if (spatial.volume <= 0 && !opts.persist) return null;
        volume *= spatial.volume;
        pan = spatial.pan;
      }

      const key = config.variants
        ? config.variants[Math.floor(Math.random() * config.variants.length)]
        : name;

      const sound = this.scene.sound.add(key, {
        volume,
        pan,
        loop: true,
      }) as Sound;
      sound.play();

      return sound;
    },

    music: (names: MusicName[]) => {
      const config = configs.sounds.music[names[0]];
      if (!config) return;

      this.queue.music = names;
      this.queue.index = 0;
      this.stop.music();
      this.play.queue(0);
    },

    ambience: (name: AmbienceName, domain: AmbienceDomain) => {
      if (this.layers.has(name)) return;

      const config = configs.sounds.ambience[name] as AudioConfig;
      if (!config) return;

      const key = config.variants
        ? config.variants[Math.floor(Math.random() * config.variants.length)]
        : name;
      const target = config.volume * this.volume.ambience;
      const sound = this.scene.sound.add(key, {
        volume: 0,
        loop: true,
      }) as Sound;
      sound.play();

      this.scene.tweens.add({
        targets: sound,
        volume: target,
        duration: CROSSFADE_DURATION,
      });
      this.layers.set(name, sound);
      this.domains.set(name, domain);
    },

    queue: (index: number) => {
      const name = this.queue.music[index];
      const config = configs.sounds.music[name];
      if (!config) return;

      const target = config.volume * this.volume.music;
      const next = this.scene.sound.add(name, {
        volume: 0,
        loop: false,
      }) as Sound;

      next.play();

      this.scene.tweens.add({
        targets: next,
        volume: target,
        duration: CROSSFADE_DURATION,
      });

      next.once("complete", () => {
        next.destroy();
        if (this.current?.sound !== next) return;
        this.current = null;
        this.queue.index = (index + 1) % this.queue.music.length;
        this.play.queue(this.queue.index);
      });

      this.current = { name, sound: next };
    },
  };

  stop = {
    music: () => {
      if (!this.current) return;
      const current = this.current.sound;
      this.current = null;
      current.off("complete");
      this._fade(current);
    },

    ambience: (name: AmbienceName) => {
      const sound = this.layers.get(name);
      if (!sound) return;

      this.layers.delete(name);
      this.domains.delete(name);
      this._fade(sound);
    },

    all: () => {
      this.stop.music();
      this.layers.forEach((_, name) => this.stop.ambience(name));
    },
  };

  setVolume(channel: ChannelName, value: number) {
    this.volume[channel] = value;
    this._save();

    if (channel === ChannelName.MUSIC && this.current)
      this.current.sound.setVolume(
        configs.sounds.music[this.current.name].volume * value,
      );

    if (channel === ChannelName.AMBIENCE)
      this.layers.forEach((sound, name) => {
        sound.setVolume(configs.sounds.ambience[name].volume * value);
      });
  }

  getActiveAmbience(domain?: AmbienceDomain): AmbienceName[] {
    const keys = [...this.layers.keys()];

    return domain
      ? keys.filter((name) => this.domains.get(name) === domain)
      : keys;
  }

  hasAmbience(name: AmbienceName): boolean {
    return this.layers.has(name);
  }

  getActiveMusic(): MusicName[] | null {
    if (!this.current) return null;
    return this.queue.music.length ? [...this.queue.music] : null;
  }

  private _fade(sound: Sound) {
    this.scene.tweens.add({
      targets: sound,
      volume: 0,
      duration: CROSSFADE_DURATION,
      onComplete: () => sound.destroy(),
    });
  }

  spatial(
    name: SoundName,
    position: { x: number; y: number },
  ): { volume: number; pan: number } {
    const config: SfxConfig =
      configs.sounds.sfx[name as keyof typeof configs.sounds.sfx];
    const spatial = this._spatial(position);

    return {
      volume: (config?.volume ?? 1) * this.volume.sfx * spatial.volume,
      pan: spatial.pan,
    };
  }

  private _spatial(position: { x: number; y: number }): {
    volume: number;
    pan: number;
  } {
    const listener = this.scene.managers.players?.player;
    if (!listener) return { volume: 1, pan: 0 };

    const dx = position.x - listener.x;
    const dy = position.y - listener.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance >= SFX_FALLOFF_FAR) return { volume: 0, pan: 0 };

    const volume =
      distance <= SFX_FALLOFF_NEAR
        ? 1
        : 1 -
          (distance - SFX_FALLOFF_NEAR) / (SFX_FALLOFF_FAR - SFX_FALLOFF_NEAR);

    const pan = Phaser.Math.Clamp(dx / SFX_FALLOFF_FAR, -1, 1) * SFX_MAX_PAN;

    return { volume, pan };
  }

  private _load() {
    return JSON.parse(
      localStorage.getItem("volume") ??
        JSON.stringify({ music: 0.5, ambience: 0.5, sfx: 0.5 }),
    );
  }

  private _save() {
    localStorage.setItem("volume", JSON.stringify(this.volume));
  }
}
