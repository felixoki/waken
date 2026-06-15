import {
  Direction,
  EntityName,
  SlotType,
  Input,
  StateName,
} from "@server/types";

export const state = {
  resolve: (
    input: Partial<Input>,
    prev: { state: StateName; facing: Direction; movingCount: number },
  ) => {
    const selectors = [
      {
        condition: () => input.state === StateName.DASHING,
        state: () => StateName.DASHING,
        needsUpdate: false,
      },
      {
        condition: () => input.state === StateName.CASTING,
        state: () => StateName.CASTING,
        needsUpdate: false,
      },
      {
        condition: () => input.state === StateName.SLASHING,
        state: () => StateName.SLASHING,
        needsUpdate: false,
      },
      {
        condition: () => input.state === StateName.THROWING,
        state: () => StateName.THROWING,
        needsUpdate: false,
      },
      {
        condition: () =>
          !!input.target &&
          input.equipped?.type === SlotType.ENTITY &&
          input.equipped?.item.name === EntityName.FISHING_ROD,
        state: () => StateName.FISHING,
        needsUpdate: false,
      },
      {
        condition: () =>
          input.target && input.equipped?.type === SlotType.SPELL,
        state: () => StateName.CASTING,
        needsUpdate: false,
      },
      {
        condition: () => input.isJumping,
        state: () => StateName.JUMPING,
        needsUpdate: false,
      },
      {
        condition: () => input.isRolling,
        state: () => StateName.ROLLING,
        needsUpdate: false,
      },
      {
        condition: () => input.moving?.length,
        state: () => {
          if (input.isFlying) return StateName.FLYING;
          if (input.isRunning) return StateName.RUNNING;
          return StateName.WALKING;
        },
        needsUpdate: true,
      },
      {
        condition: () => true,
        state: () => StateName.IDLE,
      },
    ];

    const selector = selectors.find((s) => s.condition());

    const changed = {
      state: selector?.state() !== prev.state,
      facing: !!input.facing && input.facing !== prev.facing,
      movingCount: input.moving?.length !== prev.movingCount,
    };

    return {
      state: selector!.state(),
      needsUpdate: !changed.state && (changed.facing || changed.movingCount),
    };
  },
};
