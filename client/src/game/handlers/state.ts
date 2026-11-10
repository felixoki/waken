import { EntityName, SlotType, Input, StateName } from "@server/types";

type Selector = {
  condition: (input: Partial<Input>) => boolean;
  state: (input: Partial<Input>) => StateName;
};

const selectors: Selector[] = [
  { condition: (input) => !!input.bed, state: () => StateName.SLEEPING },
  { condition: (input) => !!input.isSwimming, state: () => StateName.SWIMMING },
  {
    condition: (input) => input.state === StateName.DASHING,
    state: () => StateName.DASHING,
  },
  {
    condition: (input) => input.state === StateName.JUMPING,
    state: () => StateName.JUMPING,
  },
  {
    condition: (input) => input.state === StateName.ROLLING,
    state: () => StateName.ROLLING,
  },
  {
    condition: (input) => input.state === StateName.CASTING,
    state: () => StateName.CASTING,
  },
  {
    condition: (input) => input.state === StateName.WARNING,
    state: () => StateName.WARNING,
  },
  {
    condition: (input) => input.state === StateName.SLASHING,
    state: () => StateName.SLASHING,
  },
  {
    condition: (input) => input.state === StateName.THROWING,
    state: () => StateName.THROWING,
  },
  {
    condition: (input) => input.state === StateName.FELLING,
    state: () => StateName.FELLING,
  },
  {
    condition: (input) => input.state === StateName.MINING,
    state: () => StateName.MINING,
  },
  {
    condition: (input) => input.state === StateName.RAKING,
    state: () => StateName.RAKING,
  },
  {
    condition: (input) => input.state === StateName.WATERING,
    state: () => StateName.WATERING,
  },
  {
    condition: (input) =>
      !!input.target &&
      !input.isFlying &&
      input.equipped?.type === SlotType.ENTITY &&
      input.equipped?.item.name === EntityName.FISHING_ROD,
    state: () => StateName.FISHING,
  },
  {
    condition: (input) =>
      !!input.target && input.equipped?.type === SlotType.SPELL,
    state: () => StateName.CASTING,
  },
  { condition: (input) => !!input.isJumping, state: () => StateName.JUMPING },
  { condition: (input) => !!input.isRolling, state: () => StateName.ROLLING },
  {
    condition: (input) => !!input.moving?.length,
    state: (input) => {
      if (input.isFlying) return StateName.FLYING;
      if (input.isRunning) return StateName.RUNNING;
      return StateName.WALKING;
    },
  },
  { condition: () => true, state: () => StateName.IDLE },
];

export const state = {
  resolve: (input: Partial<Input>) => {
    for (const selector of selectors)
      if (selector.condition(input)) return { state: selector.state(input) };
    return { state: StateName.IDLE };
  },
};
