import {
  BehaviorName,
  ComponentName,
  Direction,
  EntityDefinition,
  EntityName,
  MapName,
  StateName,
  NodeId,
  DialogueEffectName,
  ChoiceId,
} from "../types";

export const definitions: Partial<Record<EntityName, EntityDefinition>> = {
  [EntityName.ORC1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.ANIMATION },
      { name: ComponentName.DAMAGEABLE },
      { name: ComponentName.BEHAVIOR_QUEUE },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 28,
          offsetY: 24,
          pushable: false,
        },
      },
    ],
    states: [
      StateName.IDLE,
      StateName.WALKING,
      StateName.RUNNING,
      StateName.SLASHING,
    ],
    behaviors: [BehaviorName.PATROL, BehaviorName.ATTACK],
  },
  [EntityName.HOUSE1]: {
    facing: Direction.DOWN,
    moving: [],
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
        config: {
          width: 128,
          height: 48,
          offsetX: 32,
          offsetY: 80,
        },
      },
      {
        name: ComponentName.TRANSITION,
        config: {
          to: MapName.HOME,
          x: 184,
          y: 168,
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
  [EntityName.HOUSE1_EXIT]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TRANSITION,
        config: {
          to: MapName.VILLAGE,
          x: 432,
          y: 608,
          width: 32,
          height: 16,
          offsetX: 0,
          offsetY: 16,
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
        config: {
          width: 128,
          height: 48,
          offsetX: 32,
          offsetY: 60,
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
  [EntityName.HERBALIST_EXIT]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TRANSITION,
        config: {
          to: MapName.VILLAGE,
          x: 208,
          y: 176,
          width: 32,
          height: 16,
          offsetX: 0,
          offsetY: 16,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.HERBALIST]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.INTERACTABLE },
      {
        name: ComponentName.COLLECTOR,
        config: {
          accepts: [EntityName.FLYAMINATA1, EntityName.BASKETFERN],
        },
      },
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 12,
          offsetY: 12,
          pushable: false,
        },
      },
    ],
    states: [StateName.IDLE, StateName.WALKING],
    behaviors: [],
    dialogue: {
      [NodeId.GREETING]: {
        ref: NodeId.GREETING,
        individual: [
          {
            text: "Are you looking for herbs?",
            effects: [
              {
                name: DialogueEffectName.COLLECTION_START,
              },
            ],
          },
          {
            text: "What is your role in this village?",
            next: NodeId.STORY,
          },
        ],
      },
      [NodeId.STORY]: {
        text: "I am the village herbalist. I collect herbs and make potions to help the villagers. I specialize in dream herbs, which can help with sleep and dreams. If you find any, please bring them to me.",
        choices: [
          {
            ref: ChoiceId.GOODBYE,
            effects: [{ name: DialogueEffectName.CONVERSATION_END }],
          },
        ],
      },
    },
  },
  [EntityName.WINDMILL]: {
    facing: Direction.DOWN,
    moving: [],
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
  [EntityName.BARN]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_farm_house",
          tileSize: 16,
          tiles: [
            { row: 1, start: 9, end: 13 },
            { row: 2, start: 9, end: 13 },
            { row: 3, start: 9, end: 13 },
            { row: 4, start: 9, end: 13 },
            { row: 5, start: 9, end: 13 },
          ],
        },
        key: "barn_texture",
      },
      {
        name: ComponentName.BODY,
        config: { width: 64, height: 64, offsetX: 0, offsetY: 0 },
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
          spritesheet: "village_farm_house",
          tileSize: 16,
          tiles: [
            { row: 2, start: 15, end: 17 },
            { row: 3, start: 15, end: 17 },
            { row: 4, start: 15, end: 17 },
            { row: 5, start: 15, end: 17 },
          ],
        },
        key: "henhouse_texture",
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
    facing: Direction.DOWN,
    moving: [],
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
  [EntityName.WELL]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 35, start: 5, end: 7 },
            { row: 36, start: 5, end: 7 },
            { row: 37, start: 5, end: 7 },
          ],
        },
        key: "well_texture",
      },
      {
        name: ComponentName.BODY,
        config: { width: 20, height: 12, offsetX: 8, offsetY: 16 },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.TREE1]: {
    facing: Direction.DOWN,
    moving: [],
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
        config: {
          width: 16,
          height: 24,
          offsetX: 24,
          offsetY: 48,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.TREE2]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 15, start: 13, end: 16 },
            { row: 16, start: 13, end: 16 },
            { row: 17, start: 13, end: 16 },
            { row: 18, start: 13, end: 16 },
          ],
        },
        key: "tree2_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 16,
          height: 24,
          offsetX: 24,
          offsetY: 32,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.TREE4]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 35, start: 11, end: 16 },
            { row: 36, start: 11, end: 16 },
            { row: 37, start: 11, end: 16 },
            { row: 38, start: 11, end: 16 },
            { row: 39, start: 11, end: 16 },
          ],
        },
        key: "tree5_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 16,
          height: 24,
          offsetX: 36,
          offsetY: 48,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.TREE5]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 43, start: 13, end: 16 },
            { row: 44, start: 13, end: 16 },
            { row: 45, start: 13, end: 16 },
            { row: 46, start: 13, end: 16 },
            { row: 47, start: 13, end: 16 },
          ],
        },
        key: "tree5_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 16,
          height: 24,
          offsetX: 24,
          offsetY: 48,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.APPLETREE2]: {
    facing: Direction.DOWN,
    moving: [],
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
        config: {
          width: 16,
          height: 24,
          offsetX: 24,
          offsetY: 32,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.STUMP1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 43, start: 7, end: 9 },
            { row: 44, start: 7, end: 9 },
          ],
        },
        key: "stump1_texture",
      },
      {
        name: ComponentName.BODY,
        config: { width: 28, height: 8, offsetX: 12, offsetY: 8 },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.STUMP2]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 51, start: 12, end: 13 },
            { row: 52, start: 12, end: 13 },
          ],
        },
        key: "stump2_texture",
      },
      {
        name: ComponentName.BODY,
        config: { width: 12, height: 8, offsetX: 12, offsetY: 8 },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.BUSH1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 25, start: 14, end: 16 },
            { row: 26, start: 14, end: 16 },
            { row: 27, start: 14, end: 16 },
          ],
        },
        key: "bush1_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 24,
          height: 12,
          offsetX: 12,
          offsetY: 24,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.BUSH2]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 29, start: 5, end: 6 },
            { row: 30, start: 5, end: 6 },
          ],
        },
        key: "bush2_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 16,
          height: 12,
          offsetX: 8,
          offsetY: 16,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.BUSH3]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "plants_bushes",
          tileSize: 16,
          tiles: [
            { row: 1, start: 16, end: 18 },
            { row: 2, start: 16, end: 18 },
            { row: 3, start: 16, end: 18 },
          ],
        },
        key: "bush3_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 4,
          height: 4,
          offsetX: 24,
          offsetY: 20,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.BUSH4]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "plants_bushes",
          tileSize: 16,
          tiles: [
            { row: 4, start: 25, end: 26 },
            { row: 5, start: 25, end: 26 },
          ],
        },
        key: "bush4_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 4,
          height: 4,
          offsetX: 16,
          offsetY: 12,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.REED1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "reed",
          tileSize: 16,
          tiles: [{ row: 2, start: 2, end: 2 }],
        },
        key: "reed1_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 16,
          height: 16,
          offsetX: 0,
          offsetY: 0,
          collides: false,
        },
      },
      {
        name: ComponentName.BOUNCE,
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.REED2]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "reed",
          tileSize: 16,
          tiles: [{ row: 2, start: 4, end: 4 }],
        },
        key: "reed2_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 16,
          height: 16,
          offsetX: 0,
          offsetY: 0,
          collides: false,
        },
      },
      {
        name: ComponentName.BOUNCE,
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.REED3]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "reed",
          tileSize: 16,
          tiles: [
            { row: 1, start: 6, end: 6 },
            { row: 2, start: 6, end: 6 },
          ],
        },
        key: "reed3_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 16,
          height: 24,
          offsetX: 0,
          offsetY: 8,
          collides: false,
        },
      },
      {
        name: ComponentName.BOUNCE,
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.ROCK1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 45, start: 2, end: 5 },
            { row: 46, start: 2, end: 5 },
            { row: 47, start: 2, end: 5 },
            { row: 48, start: 2, end: 5 },
          ],
        },
        key: "rock1_texture",
      },
      {
        name: ComponentName.BODY,
        config: { width: 40, height: 24, offsetX: 8, offsetY: 24 },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.ROCK2]: {
    facing: Direction.DOWN,
    moving: [],
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
          ],
        },
        key: "rock2_texture",
      },
      {
        name: ComponentName.BODY,
        config: { width: 32, height: 16, offsetX: 8, offsetY: 24 },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.ROCK3]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 45, start: 9, end: 11 },
            { row: 46, start: 9, end: 11 },
            { row: 47, start: 9, end: 11 },
          ],
        },
        key: "rock3_texture",
      },
      {
        name: ComponentName.BODY,
        config: { width: 24, height: 12, offsetX: 12, offsetY: 24 },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.ROCK4]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 49, start: 2, end: 5 },
            { row: 50, start: 2, end: 5 },
            { row: 51, start: 2, end: 5 },
            { row: 52, start: 2, end: 5 },
          ],
        },
        key: "rock4_texture",
      },
      {
        name: ComponentName.BODY,
        config: { width: 40, height: 24, offsetX: 12, offsetY: 24 },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.ROCK8]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 53, start: 6, end: 7 },
            { row: 54, start: 6, end: 7 },
          ],
        },
        key: "rock8_texture",
      },
      {
        name: ComponentName.BODY,
        config: { width: 16, height: 8, offsetX: 8, offsetY: 16 },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.ROCKS1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 29, start: 11, end: 13 },
            { row: 30, start: 11, end: 13 },
            { row: 31, start: 11, end: 13 },
          ],
        },
        key: "rocks1_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 20,
          height: 16,
          offsetX: 16,
          offsetY: 12,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.ROCKS3]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 33, start: 2, end: 3 },
            { row: 34, start: 2, end: 3 },
          ],
        },
        key: "rocks3_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 6,
          height: 6,
          offsetX: 12,
          offsetY: 12,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.ROCKS5]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 33, start: 8, end: 9 },
            { row: 34, start: 8, end: 9 },
          ],
        },
        key: "rocks5_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 6,
          height: 6,
          offsetX: 12,
          offsetY: 12,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.ROCKS6]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 33, start: 10, end: 11 },
            { row: 34, start: 10, end: 11 },
          ],
        },
        key: "rocks6_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 6,
          height: 6,
          offsetX: 12,
          offsetY: 12,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.FLYAMINATA1]: {
    facing: Direction.DOWN,
    moving: [],
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
    facing: Direction.DOWN,
    moving: [],
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
