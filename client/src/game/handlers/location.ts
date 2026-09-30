import { LOCATION_MARGIN } from "@server/globals";
import { configs } from "@server/configs";
import { Event, MapName } from "@server/types";
import type { LocationBand } from "@server/types/generation";
import EventBus from "../EventBus";
import type { Scene } from "../scenes/Scene";
import type { MainScene } from "../scenes/Main";

interface TiledProperty {
  name: string;
  value: unknown;
}

export const location = {
  bands: (map: Phaser.Tilemaps.Tilemap): LocationBand[] => {
    const properties = map.properties as TiledProperty[] | undefined;
    if (!Array.isArray(properties)) return [];

    const bands = properties.find((p) => p.name === "bands")?.value;
    return typeof bands === "string" ? (JSON.parse(bands) as LocationBand[]) : [];
  },

  band: (
    bands: LocationBand[],
    row: number,
    current?: LocationBand,
  ): LocationBand | undefined => {
    if (
      current &&
      row >= current.y - LOCATION_MARGIN &&
      row < current.y + current.height + LOCATION_MARGIN
    )
      return current;

    return bands.find((b) => row >= b.y && row < b.y + b.height);
  },

  update: (scene: Scene, main: MainScene, y: number): void => {
    const row = Math.floor(y / scene.tileManager.map.tileHeight);

    if (row !== scene.row) {
      scene.row = row;
      scene.band = location.band(scene.bands, row, scene.band);
    }

    const label =
      scene.band?.label ?? configs.maps[scene.scene.key as MapName]?.label;
    if (!label || label === main.location) return;

    main.location = label;
    EventBus.emit(Event.LOCATION, label);
  },
};
