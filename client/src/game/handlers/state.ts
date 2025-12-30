import { Direction, PlayerInput, StateName } from "@server/types";

export const state = {
  resolve: (
    input: PlayerInput,
    prev: { state: StateName; direction: Direction; directionCount: number }
  ) => {
    const selectors = [
      {
        condition: () => input.direction,
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
      direction: !!input.direction && input.direction !== prev.direction,
      directionCount: input.directions.length !== prev.directionCount,
    };

    return {
      state: selector!.state(),
      needsUpdate:
        !changed.state && (changed.direction || changed.directionCount),
    };
  },
};
