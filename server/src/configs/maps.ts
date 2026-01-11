import { MapConfig, MapName } from "../types";

export const maps: Record<MapName, MapConfig> = {
  [MapName.VILLAGE]: {
    id: MapName.VILLAGE,
    json: "village.json",
    spritesheets: [
      {
        key: "village_home",
        file: "village_home.png",
        frameWidth: 16,
        frameHeight: 16,
        asTileset: true,
      },
      {
        key: "village_herbalist_house",
        file: "village_herbalist_house.png",
        frameWidth: 16,
        frameHeight: 16,
        asTileset: true,
      },
      {
        key: "village_farm_house",
        file: "village_farm_house.png",
        frameWidth: 16,
        frameHeight: 16,
        asTileset: true,
      },
      {
        key: "ground_grass",
        file: "ground_grass.png",
        frameWidth: 16,
        frameHeight: 16,
        asTileset: true,
      },
      {
        key: "water_coasts",
        file: "water_coasts.png",
        frameWidth: 16,
        frameHeight: 16,
        asTileset: true,
      },
      { key: "player-idle", file: "player_idle.png" },
      { key: "player-walking", file: "player_walking.png" },
      { key: "player-running", file: "player_running.png" },
      { key: "player-jumping", file: "player_jumping.png" },
      { key: "player-casting", file: "player_casting.png" },
    ],
  },
};
