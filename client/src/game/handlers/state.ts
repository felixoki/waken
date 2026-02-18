import {
  Direction,
  HotbarSlotType,
  Input,
  StateName,
} from "@server/types";

export const state = {
  resolve: (
    input: Partial<Input>,
    prev: { state: StateName; facing: Direction; movingCount: number }
  ) => {
    const selectors = [
      {
        condition: () => input.state === StateName.SLASHING,
        state: () => StateName.SLASHING,
        needsUpdate: false,
      },
      {
        condition: () =>
          input.target && input.equipped?.type === HotbarSlotType.SPELL,
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
        state: () => (input.isRunning ? StateName.RUNNING : StateName.WALKING),
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
      needsUpdate:
        !changed.state && (changed.facing || changed.movingCount),
    };
  },
};
