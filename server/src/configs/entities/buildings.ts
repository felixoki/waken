import {
  ComponentName,
  Direction,
  EntityDefinition,
  EntityName,
  MapName,
} from "../../types";

export const buildings: Partial<Record<EntityName, EntityDefinition>> = {
  [EntityName.HOUSE1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "buildings",
          tileSize: 16,
          tiles: [
            { row: 72, start: 1, end: 10 },
            { row: 73, start: 1, end: 10 },
            { row: 74, start: 1, end: 10 },
            { row: 75, start: 1, end: 10 },
            { row: 76, start: 1, end: 10 },
            { row: 77, start: 1, end: 10 },
            { row: 78, start: 1, end: 10 },
            { row: 79, start: 1, end: 10 },
            { row: 80, start: 1, end: 10 },
          ],
        },
        key: "house1_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 128,
          height: 49,
          offsetX: 32,
          offsetY: 79,
          static: true,
        },
      },
      {
        name: ComponentName.TRANSITION,
        config: {
          to: MapName.HOME,
          x: 200,
          y: 200,
          width: 16,
          height: 16,
          offsetX: 48,
          offsetY: 56,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.HERBALIST_HOUSE]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "buildings",
          tileSize: 16,
          tiles: [
            { row: 64, start: 1, end: 12 },
            { row: 65, start: 1, end: 12 },
            { row: 66, start: 1, end: 12 },
            { row: 67, start: 1, end: 12 },
            { row: 68, start: 1, end: 12 },
            { row: 69, start: 1, end: 12 },
            { row: 70, start: 1, end: 12 },
            { row: 71, start: 1, end: 12 },
          ],
        },
        key: "herbalist_house_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 128,
          height: 48,
          offsetX: 32,
          offsetY: 60,
          static: true,
        },
      },
      {
        name: ComponentName.TRANSITION,
        config: {
          to: MapName.HERBALIST_HOUSE,
          x: 128,
          y: 168,
          width: 16,
          height: 16,
          offsetX: 0,
          offsetY: 40,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.FARM_HOUSE]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "buildings",
          tileSize: 16,
          tiles: [
            { row: 34, start: 1, end: 8 },
            { row: 35, start: 1, end: 8 },
            { row: 36, start: 1, end: 8 },
            { row: 37, start: 1, end: 8 },
            { row: 38, start: 1, end: 8 },
            { row: 39, start: 1, end: 8 },
            { row: 40, start: 1, end: 8 },
            { row: 41, start: 1, end: 8 },
          ],
        },
        key: "farm_house_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 112,
          height: 48,
          offsetX: 8,
          offsetY: 48,
          static: true,
        },
      },
      {
        name: ComponentName.TRANSITION,
        config: {
          to: MapName.FARM_HOUSE,
          x: 128,
          y: 168,
          width: 16,
          height: 16,
          offsetX: 0,
          offsetY: 32,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.WINDMILL]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "buildings",
          tileSize: 16,
          tiles: [
            { row: 123, start: 1, end: 8 },
            { row: 124, start: 1, end: 8 },
            { row: 125, start: 1, end: 8 },
            { row: 126, start: 1, end: 8 },
            { row: 127, start: 1, end: 8 },
            { row: 128, start: 1, end: 8 },
            { row: 129, start: 1, end: 8 },
            { row: 130, start: 1, end: 8 },
            { row: 131, start: 1, end: 8 },
          ],
        },
        key: "windmill_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 56,
          height: 56,
          offsetX: 40,
          offsetY: 72,
          static: true,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.BARN]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "buildings",
          tileSize: 16,
          tiles: [
            { row: 1, start: 1, end: 5 },
            { row: 2, start: 1, end: 5 },
            { row: 3, start: 1, end: 5 },
            { row: 4, start: 1, end: 5 },
            { row: 5, start: 1, end: 5 },
          ],
        },
        key: "barn_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 80,
          height: 32,
          offsetX: 0,
          offsetY: 32,
          static: true,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.HENHOUSE]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "buildings",
          tileSize: 16,
          tiles: [
            { row: 60, start: 1, end: 3 },
            { row: 61, start: 1, end: 3 },
            { row: 62, start: 1, end: 3 },
            { row: 63, start: 1, end: 3 },
          ],
        },
        key: "henhouse_texture",
      },
      {
        name: ComponentName.BODY,
        config: { width: 30, height: 14, offsetX: 8, offsetY: 26, static: true },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.HOUSE2]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "buildings",
          tileSize: 16,
          tiles: [
            { row: 72, start: 11, end: 18 },
            { row: 73, start: 11, end: 18 },
            { row: 74, start: 11, end: 18 },
            { row: 75, start: 11, end: 18 },
            { row: 76, start: 11, end: 18 },
            { row: 77, start: 11, end: 18 },
            { row: 78, start: 11, end: 18 },
            { row: 79, start: 11, end: 18 },
          ],
        },
        key: "house2_texture",
      },
      {
        name: ComponentName.BODY,
        config: { width: 112, height: 48, offsetX: 8, offsetY: 48, static: true },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.BLACKSMITH_HOUSE]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "buildings",
          tileSize: 16,
          tiles: [
            { row: 6, start: 1, end: 13 },
            { row: 7, start: 1, end: 13 },
            { row: 8, start: 1, end: 13 },
            { row: 9, start: 1, end: 13 },
            { row: 10, start: 1, end: 13 },
            { row: 11, start: 1, end: 13 },
            { row: 12, start: 1, end: 13 },
            { row: 13, start: 1, end: 13 },
            { row: 14, start: 1, end: 13 },
            { row: 15, start: 1, end: 13 },
          ],
        },
        key: "blacksmith_house_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 168,
          height: 48,
          offsetX: 4,
          offsetY: 84,
          static: true,
        },
      },
      {
        name: ComponentName.TRANSITION,
        config: {
          to: MapName.BLACKSMITH_HOUSE,
          x: 54,
          y: 208,
          width: 14,
          height: 14,
          offsetX: -40,
          offsetY: 48,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.MARKET_HOUSE]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "buildings",
          tileSize: 16,
          tiles: [
            { row: 85, start: 1, end: 10 },
            { row: 86, start: 1, end: 10 },
            { row: 87, start: 1, end: 10 },
            { row: 88, start: 1, end: 10 },
            { row: 89, start: 1, end: 10 },
            { row: 90, start: 1, end: 10 },
            { row: 91, start: 1, end: 10 },
            { row: 92, start: 1, end: 10 },
            { row: 93, start: 1, end: 10 },
          ],
        },
        key: "market_house_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 134,
          height: 53,
          offsetX: 13,
          offsetY: 79,
          static: true,
        },
      },
      {
        name: ComponentName.TRANSITION,
        config: {
          to: MapName.MARKET_HOUSE,
          x: 168,
          y: 192,
          width: 16,
          height: 14,
          offsetX: 0,
          offsetY: 64,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.TAVERN]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "buildings",
          tileSize: 16,
          tiles: [
            { row: 94, start: 1, end: 12 },
            { row: 95, start: 1, end: 12 },
            { row: 96, start: 1, end: 12 },
            { row: 97, start: 1, end: 12 },
            { row: 98, start: 1, end: 12 },
            { row: 99, start: 1, end: 12 },
            { row: 100, start: 1, end: 12 },
            { row: 101, start: 1, end: 12 },
            { row: 102, start: 1, end: 12 },
            { row: 103, start: 1, end: 12 },
          ],
        },
        key: "tavern_house_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 128,
          height: 48,
          offsetX: 32,
          offsetY: 60,
          static: true,
        },
      },
      {
        name: ComponentName.TRANSITION,
        config: {
          to: MapName.TAVERN,
          x: 176,
          y: 176,
          width: 16,
          height: 16,
          offsetX: 0,
          offsetY: 40,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.GLASSBLOWER_HOUSE]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "buildings",
          tileSize: 16,
          tiles: [
            { row: 50, start: 1, end: 9 },
            { row: 51, start: 1, end: 9 },
            { row: 52, start: 1, end: 9 },
            { row: 53, start: 1, end: 9 },
            { row: 54, start: 1, end: 9 },
            { row: 55, start: 1, end: 9 },
            { row: 56, start: 1, end: 9 },
            { row: 57, start: 1, end: 9 },
            { row: 58, start: 1, end: 9 },
            { row: 59, start: 1, end: 9 },
          ],
        },
        key: "glassblower_house_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 104,
          height: 57,
          offsetX: 18,
          offsetY: 87,
          static: true,
        },
      },
      {
        name: ComponentName.TRANSITION,
        config: {
          to: MapName.GLASSBLOWER_HOUSE,
          x: 144,
          y: 260,
          width: 16,
          height: 16,
          offsetX: 0,
          offsetY: 64,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.MARKET_STAND1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "buildings",
          tileSize: 16,
          tiles: [
            { row: 85, start: 11, end: 18 },
            { row: 86, start: 11, end: 18 },
            { row: 87, start: 11, end: 18 },
            { row: 88, start: 11, end: 18 },
            { row: 89, start: 11, end: 18 },
            { row: 90, start: 11, end: 18 },
            { row: 91, start: 11, end: 18 },
          ],
        },
        key: "market_stand1_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 86,
          height: 40,
          offsetX: 24,
          offsetY: 56,
          static: true,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.MARKET_STAND2]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "buildings",
          tileSize: 16,
          tiles: [
            { row: 85, start: 19, end: 24 },
            { row: 86, start: 19, end: 24 },
            { row: 87, start: 19, end: 24 },
            { row: 88, start: 19, end: 24 },
            { row: 89, start: 19, end: 24 },
          ],
        },
        key: "market_stand2_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 64,
          height: 8,
          offsetX: 20,
          offsetY: 42,
          static: true,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.MARKET_STAND3]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "buildings",
          tileSize: 16,
          tiles: [
            { row: 85, start: 25, end: 29 },
            { row: 86, start: 25, end: 29 },
            { row: 87, start: 25, end: 29 },
            { row: 88, start: 25, end: 29 },
          ],
        },
        key: "market_stand3_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 52,
          height: 16,
          offsetX: 16,
          offsetY: 32,
          static: true,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.MARKET_STAND4]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "buildings",
          tileSize: 16,
          tiles: [
            { row: 85, start: 30, end: 36 },
            { row: 86, start: 30, end: 36 },
            { row: 87, start: 30, end: 36 },
            { row: 88, start: 30, end: 36 },
            { row: 89, start: 30, end: 36 },
            { row: 90, start: 30, end: 36 },
            { row: 91, start: 30, end: 36 },
            { row: 92, start: 30, end: 36 },
          ],
        },
        key: "market_stand4_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 77,
          height: 34,
          offsetX: 19,
          offsetY: 71,
          static: true,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.FISHING_HUT]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "buildings",
          tileSize: 16,
          tiles: [
            { row: 43, start: 1, end: 8 },
            { row: 44, start: 1, end: 8 },
            { row: 45, start: 1, end: 8 },
            { row: 46, start: 1, end: 8 },
            { row: 47, start: 1, end: 8 },
            { row: 48, start: 1, end: 8 },
            { row: 49, start: 1, end: 8 },
          ],
        },
        key: "fishing_dock_house_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 94,
          height: 48,
          offsetX: 18,
          offsetY: 48,
          static: true,
        },
      },
      {
        name: ComponentName.TRANSITION,
        config: {
          to: MapName.FISHING_HUT,
          x: 87,
          y: 120,
          width: 16,
          height: 16,
          offsetX: 0,
          offsetY: 48,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.TENT1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "buildings",
          tileSize: 16,
          tiles: [
            { row: 113, start: 1, end: 5 },
            { row: 114, start: 1, end: 5 },
            { row: 115, start: 1, end: 5 },
            { row: 116, start: 1, end: 5 },
            { row: 117, start: 1, end: 5 },
            { row: 118, start: 1, end: 5 },
            { row: 119, start: 1, end: 5 },
          ],
        },
        key: "tent1_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 80,
          height: 32,
          offsetX: 0,
          offsetY: 32,
          static: true,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.TENT2]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "buildings",
          tileSize: 16,
          tiles: [
            { row: 113, start: 6, end: 13 },
            { row: 114, start: 6, end: 13 },
            { row: 115, start: 6, end: 13 },
            { row: 116, start: 6, end: 13 },
            { row: 117, start: 6, end: 13 },
            { row: 118, start: 6, end: 13 },
            { row: 119, start: 6, end: 13 },
          ],
        },
        key: "tent2_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 80,
          height: 32,
          offsetX: 26,
          offsetY: 32,
          static: true,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.FENCE]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "buildings",
          tileSize: 16,
          tiles: [
            { row: 42, start: 1, end: 1 },
          ],
        },
        key: "fence_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 16,
          height: 16,
          offsetX: 0,
          offsetY: 0,
          static: true,
          collides: true,
        },
      },
      { name: ComponentName.JUMPABLE, config: { clearance: 12 } },
      {
        name: ComponentName.CONNECTABLE,
        config: { spritesheet: "buildings", tileSize: 16, row: 132, col: 1 },
      },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Fence",
      description: "A wooden fence. Joins up with the fences beside it.",
    },
  },
};
