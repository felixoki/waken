import { SFX_FALLOFF_FAR, WATER_SOUND_EASE } from "@server/globals";
import { SoundName, type TiledProperty } from "@server/types";
import { WaterSound } from "@server/types/generation";
import type { Scene } from "../scenes/Scene";

interface Field {
  name: SoundName;
  near: Int32Array;
  sound: Phaser.Sound.WebAudioSound | null;
  gain: number;
}

export interface WaterSounds {
  width: number;
  height: number;
  tileWidth: number;
  tileHeight: number;
  fields: Field[];
}

const NONE = -1;

export const waterSound = {
  create: (map: Phaser.Tilemaps.Tilemap): WaterSounds | undefined => {
    const { width, height, tileWidth, tileHeight } = map;
    const size = width * height;
    const sources = {
      river: [] as number[],
      lake: [] as number[],
      fall: [] as number[],
    };

    const properties = Array.isArray(map.properties)
      ? (map.properties as TiledProperty[])
      : [];
    const grid = properties.find((p) => p.name === "water")?.value;

    if (typeof grid === "string") {
      const bytes = Uint8Array.from(atob(grid), (c) => c.charCodeAt(0));

      for (let i = 0; i < Math.min(size, bytes.length); i++)
        if (bytes[i] === WaterSound.RIVER) sources.river.push(i);
        else if (bytes[i] === WaterSound.LAKE) sources.lake.push(i);
    }

    for (const layer of map.objects) {
      const falls =
        Array.isArray(layer.properties) &&
        (layer.properties as TiledProperty[]).some(
          (p) => p.name === "waterfalls" && p.value === true,
        );
      if (!falls) continue;

      for (const object of layer.objects) {
        const x0 = Math.floor((object.x ?? 0) / tileWidth);
        const y0 = Math.floor((object.y ?? 0) / tileHeight);
        const x1 = Math.ceil(((object.x ?? 0) + (object.width ?? 0)) / tileWidth);
        const y1 = Math.ceil(((object.y ?? 0) + (object.height ?? 0)) / tileHeight);

        for (let y = Math.max(0, y0); y < Math.min(height, y1); y++)
          for (let x = Math.max(0, x0); x < Math.min(width, x1); x++)
            sources.fall.push(y * width + x);
      }
    }

    const reach = Math.ceil(SFX_FALLOFF_FAR / Math.min(tileWidth, tileHeight));
    const fields: Field[] = [];

    for (const [name, cells] of [
      [SoundName.RIVER, sources.river],
      [SoundName.LAKE, sources.lake],
      [SoundName.WATERFALL, sources.fall],
    ] as const)
      if (cells.length)
        fields.push({
          name,
          near: waterSound.flood(cells, width, height, reach),
          sound: null,
          gain: 0,
        });

    return fields.length
      ? { width, height, tileWidth, tileHeight, fields }
      : undefined;
  },

  flood: (
    sources: number[],
    width: number,
    height: number,
    reach: number,
  ): Int32Array => {
    const size = width * height;
    const near = new Int32Array(size).fill(NONE);
    const distance = new Uint16Array(size);
    const queue = new Int32Array(size);
    let head = 0;
    let tail = 0;

    for (const i of sources) {
      if (near[i] !== NONE) continue;
      near[i] = i;
      queue[tail++] = i;
    }

    const visit = (n: number, from: number, d: number) => {
      if (near[n] !== NONE) return;
      near[n] = near[from];
      distance[n] = d;
      queue[tail++] = n;
    };

    while (head < tail) {
      const i = queue[head++];
      const d = distance[i] + 1;
      if (d > reach) continue;

      const x = i % width;
      if (x > 0) visit(i - 1, i, d);
      if (x < width - 1) visit(i + 1, i, d);
      if (i >= width) visit(i - width, i, d);
      if (i < size - width) visit(i + width, i, d);
    }

    return near;
  },

  update: (
    scene: Scene,
    state: WaterSounds,
    position: { x: number; y: number },
    quiet: boolean,
    delta: number,
  ): void => {
    const sound = scene.managers.sound;
    const col = Math.floor(position.x / state.tileWidth);
    const row = Math.floor(position.y / state.tileHeight);
    const inside = col >= 0 && row >= 0 && col < state.width && row < state.height;
    const ease = Math.min(1, delta / WATER_SOUND_EASE);

    for (const field of state.fields) {
      const source = inside ? field.near[row * state.width + col] : NONE;

      let target = 0;
      let pan = 0;

      if (source !== NONE && !quiet) {
        const spatial = sound.spatial(field.name, {
          x: ((source % state.width) + 0.5) * state.tileWidth,
          y: (Math.floor(source / state.width) + 0.5) * state.tileHeight,
        });
        target = spatial.volume;
        pan = spatial.pan;
      }

      field.gain += (target - field.gain) * ease;

      if (!field.sound && target > 0)
        field.sound = sound.play.loop(field.name, { volume: 0, persist: true });

      field.sound?.setVolume(field.gain);
      field.sound?.setPan(pan);
    }
  },

  stop: (state: WaterSounds): void => {
    for (const field of state.fields) {
      field.sound?.stop();
      field.sound?.destroy();
      field.sound = null;
      field.gain = 0;
    }
  },
};
