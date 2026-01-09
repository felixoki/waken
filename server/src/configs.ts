import {
  AnimationConfig,
  BehaviorName,
  ComponentName,
  Direction,
  EntityDefinition,
  EntityName,
  MapConfig,
  MapName,
  StateName,
} from "./types";

export const ANIMATIONS: Partial<
  Record<EntityName, Partial<Record<StateName, AnimationConfig>>>
> = {
  [EntityName.PLAYER]: {
    [StateName.IDLE]: {
      frameCount: 4,
      frameRate: 6,
      repeat: -1,
    },
    [StateName.WALKING]: {
      frameCount: 4,
      frameRate: 6,
      repeat: -1,
    },
    [StateName.RUNNING]: {
      frameCount: 8,
      frameRate: 10,
      repeat: -1,
    },
    [StateName.JUMPING]: {
      frameCount: 8,
      frameRate: 10,
      repeat: 0,
    },
    [StateName.CASTING]: {
      frameCount: 8,
      frameRate: 10,
      repeat: 0,
    },
  },
  [EntityName.ORC1]: {
    [StateName.IDLE]: {
      frameCount: 4,
      frameRate: 6,
      repeat: -1,
    },
    [StateName.WALKING]: {
      frameCount: 6,
      frameRate: 8,
      repeat: -1,
    },
    [StateName.RUNNING]: {
      frameCount: 8,
      frameRate: 10,
      repeat: -1,
    },
    [StateName.SLASHING]: {
      frameCount: 8,
      frameRate: 10,
      repeat: 0,
    },
  },
};

/**
 * Maps
 */

export const MAPS: Record<MapName, MapConfig> = {
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

/**
 * Entity Definitions
 */

export const DEFINITIONS: Partial<Record<EntityName, EntityDefinition>> = {
  [EntityName.ORC1]: {
    direction: Direction.DOWN,
    directions: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.BODY,
        config: {
          width: 16,
          height: 32,
          offsetX: 24,
          offsetY: 12,
          pushable: false,
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
    ],
    states: [
      StateName.IDLE,
      StateName.WALKING,
      StateName.RUNNING,
      StateName.SLASHING,
    ],
    behaviors: [BehaviorName.PATROL],
  },
  [EntityName.HOUSE1]: {
    direction: Direction.DOWN,
    directions: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 1, start: 1, end: 10 },
            { row: 2, start: 1, end: 10 },
            { row: 3, start: 1, end: 10 },
            { row: 4, start: 1, end: 10 },
            { row: 5, start: 1, end: 10 },
            { row: 6, start: 1, end: 10 },
            { row: 7, start: 1, end: 10 },
            { row: 8, start: 1, end: 10 },
            { row: 9, start: 1, end: 10 },
          ],
        },
        key: "house1_texture",
      },
      {
        name: ComponentName.BODY,
        config: { width: 64, height: 64, offsetX: 0, offsetY: 0 },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.HERBALIST]: {
    direction: Direction.DOWN,
    directions: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_herbalist_house",
          tileSize: 16,
          tiles: [
            { row: 9, start: 26, end: 37 },
            { row: 10, start: 26, end: 37 },
            { row: 11, start: 26, end: 37 },
            { row: 12, start: 26, end: 37 },
            { row: 13, start: 26, end: 37 },
            { row: 14, start: 26, end: 37 },
            { row: 15, start: 26, end: 37 },
            { row: 16, start: 26, end: 37 },
          ],
        },
        key: "herbalist_texture",
      },
      {
        name: ComponentName.BODY,
        config: { width: 64, height: 64, offsetX: 0, offsetY: 0 },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.WINDMILL]: {
    direction: Direction.DOWN,
    directions: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_farm_house",
          tileSize: 16,
          tiles: [
            { row: 1, start: 1, end: 8 },
            { row: 2, start: 1, end: 8 },
            { row: 3, start: 1, end: 8 },
            { row: 4, start: 1, end: 8 },
            { row: 5, start: 1, end: 8 },
            { row: 6, start: 1, end: 8 },
            { row: 7, start: 1, end: 8 },
            { row: 8, start: 1, end: 8 },
            { row: 9, start: 1, end: 8 },
          ],
        },
        key: "windmill_texture",
      },
      {
        name: ComponentName.BODY,
        config: { width: 64, height: 64, offsetX: 0, offsetY: 0 },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.HOUSE2]: {
    direction: Direction.DOWN,
    directions: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_farm_house",
          tileSize: 16,
          tiles: [
            { row: 2, start: 18, end: 25 },
            { row: 3, start: 18, end: 25 },
            { row: 4, start: 18, end: 25 },
            { row: 5, start: 18, end: 25 },
            { row: 6, start: 18, end: 25 },
            { row: 7, start: 18, end: 25 },
            { row: 8, start: 18, end: 25 },
            { row: 9, start: 18, end: 25 },
          ],
        },
        key: "windmill_texture",
      },
      {
        name: ComponentName.BODY,
        config: { width: 64, height: 64, offsetX: 0, offsetY: 0 },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.TREE1]: {
    direction: Direction.DOWN,
    directions: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 24, start: 6, end: 9 },
            { row: 25, start: 6, end: 9 },
            { row: 26, start: 6, end: 9 },
            { row: 27, start: 6, end: 9 },
            { row: 28, start: 6, end: 9 },
          ],
        },
        key: "tree1_texture",
      },
      {
        name: ComponentName.BODY,
        config: { width: 16, height: 24, offsetX: 24, offsetY: 48 },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.APPLETREE2]: {
    direction: Direction.DOWN,
    directions: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 25, start: 10, end: 13 },
            { row: 26, start: 10, end: 13 },
            { row: 27, start: 10, end: 13 },
            { row: 28, start: 10, end: 13 },
          ],
        },
        key: "appletree2_texture",
      },
      {
        name: ComponentName.BODY,
        config: { width: 16, height: 24, offsetX: 24, offsetY: 32 },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.ROCK2]: {
    direction: Direction.DOWN,
    directions: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 45, start: 6, end: 8 },
            { row: 46, start: 6, end: 8 },
            { row: 47, start: 6, end: 8 },
            { row: 48, start: 6, end: 8 },
          ],
        },
        key: "rock2_texture",
      },
      {
        name: ComponentName.BODY,
        config: { width: 32, height: 24, offsetX: 8, offsetY: 24 },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.FLYAMINATA1]: {
    direction: Direction.DOWN,
    directions: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 41, start: 5, end: 6 },
            { row: 42, start: 5, end: 6 },
          ],
        },
        key: "flyaminata1_texture",
      },
      {
        name: ComponentName.BODY,
        config: { width: 16, height: 16, offsetX: 8, offsetY: 8 },
      },
      { name: ComponentName.POINTABLE },
      {
        name: ComponentName.PICKABLE,
      },
      {
        name: ComponentName.HOVERABLE,
      },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Fly aminata",
      description: "A small, delicate mushroom with a pale cap.",
      stackable: true,
    },
  },
  [EntityName.BASKETFERN]: {
    direction: Direction.DOWN,
    directions: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 55, start: 2, end: 2 },
            { row: 56, start: 2, end: 2 },
          ],
        },
        key: "basketfern_texture",
      },
      {
        name: ComponentName.BODY,
        config: { width: 16, height: 24, offsetX: 0, offsetY: 8 },
      },
      {
        name: ComponentName.POINTABLE,
      },
      {
        name: ComponentName.PICKABLE,
      },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Basket fern",
      description: "A lush green fern typical for this region.",
      stackable: true,
    },
  },
};
