import { LEAN_MAX, LEAN_TAKEN } from "../globals";
import { VillageState } from "../types";

export const village = {
  next: (lean: number, content: boolean, befriended: boolean): number => {
    if (befriended) return 0;

    return content ? Math.max(0, lean - 1) : Math.min(LEAN_MAX, lean + 1);
  },

  leaning: (lean: number): boolean => lean >= LEAN_TAKEN,

  state: (leaning: number, total: number): VillageState => {
    if (!leaning || !total) return VillageState.WHOLE;

    return leaning <= total / 3 ? VillageState.STRAINED : VillageState.SPLIT;
  },
};
