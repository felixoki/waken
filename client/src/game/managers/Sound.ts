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
import { CROSSFADE_DURATION, MASTER_FADE_OUT } from "@server/globals";
import {
  SFX_FALLOFF_NEAR,
  SFX_FALLOFF_FAR,
  SFX_MAX_PAN,
} from "@server/globals";
import { AMBIENCE_PATH, MUSIC_PATH } from "../loaders/Sound";

type Sound = Phaser.Sound.WebAudioSound;

type Stream = {
  name: MusicName;
  element: HTMLAudioElement;
  source: MediaElementAudioSourceNode;
  gain: GainNode;
};

type Layer = { key: string; sound: Sound | null };

export const loadVolume = (): Record<ChannelName, number> =>
  JSON.parse(
    localStorage.getItem("volume") ??
      JSON.stringify({ music: 0.5, ambience: 0.5, sfx: 0.5 }),
  );

export class SoundManager {
  private scene: MainScene;
  private manager: Phaser.Sound.WebAudioSoundManager;
  private bus: GainNode;
  private current: Stream | null = null;
  private layers: Map<AmbienceName, Layer> = new Map();
  private domains: Map<AmbienceName, AmbienceDomain> = new Map();
  private volume: Record<ChannelName, number>;
  private queue: { music: MusicName[]; index: number } = {
    music: [],
    index: 0,
  };

  constructor(scene: MainScene) {
    this.scene = scene;
    this.volume = loadVolume();
    this.manager = scene.sound as Phaser.Sound.WebAudioSoundManager;
    this.bus = this.manager.context.createGain();
    this.bus.gain.value = 0;
    this.bus.connect(this.manager.destination);
  }

  fade = {
    in: () => this._ramp(this.bus.gain, 1, CROSSFADE_DURATION),
    out: () => this._ramp(this.bus.gain, 0, MASTER_FADE_OUT),
  };

  play = {
    sfx: (
      name: SoundName,
      opts?: {
        volume?: number;
        rate?: number;
        seek?: number;
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

      this._routed(() =>
        this.manager.play(key, {
          volume,
          pan,
          rate: opts?.rate ?? 0.95 + Math.random() * 0.1,
          seek: opts?.seek ?? 0,
        }),
      );
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

      const sound = this._routed(
        () =>
          this.manager.add(key, {
            volume,
            pan,
            loop: true,
          }) as Sound,
      );
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

    ambience: (
      name: AmbienceName,
      domain: AmbienceDomain,
      duration = CROSSFADE_DURATION,
      ease = "Linear",
    ) => {
      if (this.layers.has(name)) return;

      const config = configs.sounds.ambience[name] as AudioConfig;
      if (!config) return;

      const key = config.variants
        ? config.variants[Math.floor(Math.random() * config.variants.length)]
        : name;
      const layer: Layer = { key, sound: null };
      this.layers.set(name, layer);
      this.domains.set(name, domain);

      this._fetch(key, () => {
        if (this.layers.get(name) !== layer) return this._evict(key);

        const sound = this._routed(
          () =>
            this.manager.add(key, {
              volume: 0,
              loop: true,
            }) as Sound,
        );
        sound.play();

        this.scene.tweens.add({
          targets: sound,
          volume: config.volume * this.volume.ambience,
          duration,
          ease,
        });
        layer.sound = sound;
      });
    },

    queue: (index: number) => {
      const name = this.queue.music[index];
      const config = configs.sounds.music[name];
      if (!config) return;

      const stream = this._stream(name);
      this._ramp(
        stream.gain.gain,
        config.volume * this.volume.music,
        CROSSFADE_DURATION,
      );

      stream.element.onended = () => {
        if (this.current !== stream) return;
        this._release(stream);
        this.current = null;
        this.queue.index = (index + 1) % this.queue.music.length;
        this.play.queue(this.queue.index);
      };

      this.current = stream;
    },
  };

  stop = {
    music: () => {
      if (!this.current) return;
      const stream = this.current;
      this.current = null;
      stream.element.onended = null;
      this._ramp(stream.gain.gain, 0, CROSSFADE_DURATION);
      this.scene.time.delayedCall(CROSSFADE_DURATION, () =>
        this._release(stream),
      );
    },

    ambience: (
      name: AmbienceName,
      duration = CROSSFADE_DURATION,
      ease = "Linear",
    ) => {
      const layer = this.layers.get(name);
      if (!layer) return;

      this.layers.delete(name);
      this.domains.delete(name);
      this._fade(layer, duration, ease);
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
      this._ramp(
        this.current.gain.gain,
        configs.sounds.music[this.current.name].volume * value,
        0,
      );

    if (channel === ChannelName.AMBIENCE)
      this.layers.forEach((layer, name) => {
        layer.sound?.setVolume(configs.sounds.ambience[name].volume * value);
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

  private _ramp(gain: AudioParam, volume: number, duration: number) {
    const now = this.manager.context.currentTime;

    gain.cancelScheduledValues(now);
    gain.setValueAtTime(gain.value, now);
    gain.linearRampToValueAtTime(volume, now + duration / 1000);
  }

  private _stream(name: MusicName): Stream {
    const context = this.manager.context;
    const element = new Audio(`${MUSIC_PATH}/${name}.ogg`);
    const source = context.createMediaElementSource(element);
    const gain = context.createGain();

    gain.gain.value = 0;
    source.connect(gain).connect(this.bus);

    const start = () => {
      if (element.src) element.play().catch(() => {});
    };
    if (this.manager.locked)
      this.manager.once(Phaser.Sound.Events.UNLOCKED, start);
    else start();

    return { name, element, source, gain };
  }

  private _release(stream: Stream) {
    stream.element.pause();
    stream.element.removeAttribute("src");
    stream.element.load();
    stream.source.disconnect();
    stream.gain.disconnect();
  }

  private _fetch(key: string, done: () => void) {
    if (this.scene.cache.audio.exists(key)) return done();

    this.scene.load.once(
      `${Phaser.Loader.Events.FILE_KEY_COMPLETE}audio-${key}`,
      done,
    );
    this.scene.load.audio(key, `${AMBIENCE_PATH}/${key}.ogg`);
    this.scene.load.start();
  }

  private _evict(key: string) {
    for (const layer of this.layers.values()) if (layer.key === key) return;
    this.scene.cache.audio.remove(key);
  }

  private _routed<T>(create: () => T): T {
    const destination = this.manager.destination;

    this.manager.destination = this.bus;
    const result = create();
    this.manager.destination = destination;

    return result;
  }

  private _fade(layer: Layer, duration: number, ease: string) {
    const sound = layer.sound;
    if (!sound) return;

    this.scene.tweens.killTweensOf(sound);
    this.scene.tweens.add({
      targets: sound,
      volume: 0,
      duration,
      ease,
      onComplete: () => {
        sound.destroy();
        this._evict(layer.key);
      },
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
    if (!listener) return { volume: 0, pan: 0 };

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

  private _save() {
    localStorage.setItem("volume", JSON.stringify(this.volume));
  }
}
