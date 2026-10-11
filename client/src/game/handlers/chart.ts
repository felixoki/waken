import { ComponentName, EntityName, Event, SlotType } from "@server/types";
import { TERRAIN_ORDER, TerrainName } from "@server/types/generation";
import EventBus from "../EventBus";
import type { HotbarComponent } from "../components/Hotbar";
import type { Player } from "../Player";
import type { Scene } from "../scenes/Scene";
import type { MainScene } from "../scenes/Main";

const RADIUS = 9;
const REVEALED = true;

const COLORS: Record<TerrainName, number> = {
  [TerrainName.VOID]: 0x1f2937,
  [TerrainName.WATER]: 0x2563eb,
  [TerrainName.GROUND]: 0xca8a04,
  [TerrainName.GRASS]: 0x16a34a,
  [TerrainName.EARTH]: 0xca8a04,
  [TerrainName.SNOW]: 0xe5e7eb,
  [TerrainName.RECESSED]: 0x9ca3af,
  [TerrainName.FLOOR]: 0xd1d5db,
  [TerrainName.ELEVATED]: 0xf3f4f6,
  [TerrainName.WALL_BASE]: 0x111827,
  [TerrainName.WALL_MID]: 0x111827,
  [TerrainName.WALL_TOP]: 0x111827,
};

const PALETTE = Uint32Array.from(TERRAIN_ORDER, (terrain) => {
  const rgb = COLORS[terrain];

  return (
    (0xff000000 |
      ((rgb & 0xff) << 16) |
      (rgb & 0xff00) |
      ((rgb >> 16) & 0xff)) >>>
    0
  );
});

interface TiledProperty {
  name: string;
  value: unknown;
}

export interface Chart {
  width: number;
  height: number;
  tileWidth: number;
  tileHeight: number;
  terrain: Uint8Array;
  seen: Uint8Array;
  pixels: Uint32Array<ArrayBuffer>;
  col: number;
  row: number;
}

export const chart = {
  create: (map: Phaser.Tilemaps.Tilemap): Chart | undefined => {
    const properties = map.properties as TiledProperty[] | undefined;
    if (!Array.isArray(properties)) return;

    const value = properties.find((p) => p.name === "chart")?.value;
    if (typeof value !== "string") return;

    const { width, height, tileWidth, tileHeight } = map;
    const binary = atob(value);
    if (binary.length !== width * height) return;

    const terrain = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) terrain[i] = binary.charCodeAt(i);

    const seen = new Uint8Array(terrain.length);
    const pixels = new Uint32Array(terrain.length);

    if (REVEALED) {
      seen.fill(1);
      for (let i = 0; i < terrain.length; i++) pixels[i] = PALETTE[terrain[i]];
    }

    return {
      width,
      height,
      tileWidth,
      tileHeight,
      terrain,
      seen,
      pixels,
      col: -1,
      row: -1,
    };
  },

  reveal: (data: Chart, col: number, row: number): void => {
    const { width, height, terrain, seen, pixels } = data;

    const top = Math.max(0, row - RADIUS);
    const bottom = Math.min(height - 1, row + RADIUS);

    for (let y = top; y <= bottom; y++) {
      const dy = y - row;
      const span = Math.floor(Math.sqrt(RADIUS * RADIUS - dy * dy));
      const left = Math.max(0, col - span);
      const right = Math.min(width - 1, col + span);

      for (let i = y * width + left, end = y * width + right; i <= end; i++) {
        if (seen[i]) continue;

        seen[i] = 1;
        pixels[i] = PALETTE[terrain[i]];
      }
    }
  },

  update: (scene: Scene, main: MainScene, player: Player): void => {
    const data = scene.chart;
    let moved = false;

    if (data) {
      const col = Math.floor(player.x / data.tileWidth);
      const row = Math.floor(player.y / data.tileHeight);

      if (col !== data.col || row !== data.row) {
        data.col = col;
        data.row = row;
        chart.reveal(data, col, row);
        moved = true;
      }
    }

    const slot = player
      .getComponent<HotbarComponent>(ComponentName.HOTBAR)
      ?.get();

    const shown =
      slot?.type === SlotType.ENTITY && slot.item.name === EntityName.MAP
        ? data
        : undefined;

    if (shown === main.chart && !(shown && moved)) return;

    main.chart = shown;
    EventBus.emit(Event.CHART, shown, scene.landmarks);
  },
};
