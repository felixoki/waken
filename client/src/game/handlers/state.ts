import { EntityName, SlotType, Input, StateName } from "@server/types";

export const state = {
  resolve: (input: Partial<Input>) => {
    const selectors = [
      {
        condition: () => input.state === StateName.DASHING,
        state: () => StateName.DASHING,
      },
      {
        condition: () => input.state === StateName.JUMPING,
        state: () => StateName.JUMPING,
      },
      {
        condition: () => input.state === StateName.ROLLING,
        state: () => StateName.ROLLING,
      },
      {
        condition: () => input.state === StateName.CASTING,
        state: () => StateName.CASTING,
      },
      {
        condition: () => input.state === StateName.SLASHING,
        state: () => StateName.SLASHING,
      },
      {
        condition: () => input.state === StateName.THROWING,
        state: () => StateName.THROWING,
      },
      {
        condition: () => input.state === StateName.FELLING,
        state: () => StateName.FELLING,
      },
      {
        condition: () => input.state === StateName.MINING,
        state: () => StateName.MINING,
      },
      {
        condition: () => input.state === StateName.RAKING,
        state: () => StateName.RAKING,
      },
      {
        condition: () => input.state === StateName.WATERING,
        state: () => StateName.WATERING,
      },
      {
        condition: () =>
          !!input.target &&
          input.equipped?.type === SlotType.ENTITY &&
          input.equipped?.item.name === EntityName.FISHING_ROD,
        state: () => StateName.FISHING,
      },
      {
        condition: () =>
          input.target && input.equipped?.type === SlotType.SPELL,
        state: () => StateName.CASTING,
      },
      {
        condition: () => input.isJumping,
        state: () => StateName.JUMPING,
      },
      {
        condition: () => input.isRolling,
        state: () => StateName.ROLLING,
      },
      {
        condition: () => input.moving?.length,
        state: () => {
          if (input.isFlying) return StateName.FLYING;
          if (input.isRunning) return StateName.RUNNING;
          return StateName.WALKING;
        },
      },
      {
        condition: () => true,
        state: () => StateName.IDLE,
      },
    ];

    const selector = selectors.find((s) => s.condition());

    return {
      state: selector!.state(),
    };
  },
};
