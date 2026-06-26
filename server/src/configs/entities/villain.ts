import { TRANSFORM_RANGE } from "../../globals";
import {
  ComponentName,
  Direction,
  EntityDefinition,
  EntityName,
  SpellName,
  StateName,
} from "../../types";

export const villain: Partial<Record<EntityName, EntityDefinition>> = {
  [EntityName.VILLAIN]: {
    facing: Direction.DOWN,
    moving: [],
    maxHealth: 500,
    components: [
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.BODY,
        config: {
          width: 12,
          height: 16,
          offsetX: 24,
          offsetY: 20,
          pushable: false,
        },
      },
    ],
    states: [
      StateName.IDLE,
      StateName.WALKING,
      StateName.CASTING,
      StateName.FLYING,
    ],
    attacks: [
      {
        state: StateName.CASTING,
        spell: SpellName.DRAGON_FORM,
        range: TRANSFORM_RANGE,
      },
    ],
  },
  [EntityName.DRAGON]: {
    facing: Direction.DOWN,
    moving: [],
    maxHealth: 500,
    components: [],
    states: [
      StateName.IDLE,
      StateName.WALKING,
      StateName.FLYING,
      StateName.CASTING,
    ],
    attacks: [
      { state: StateName.CASTING, spell: SpellName.BITE, range: 200 },
      { state: StateName.CASTING, spell: SpellName.FIRE_BREATH, range: 200 },
      { state: StateName.CASTING, spell: SpellName.METEOR_SHOWER, range: 320 },
    ],
  },
};
