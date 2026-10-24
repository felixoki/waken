import {
  ANCHOR,
  AWAY,
  Condition,
  Placement,
  Schedule,
  TimePhase,
} from "../types";

export const timetable = {
  place: (
    rules: Schedule | undefined,
    phase: TimePhase,
    sleepless: boolean,
    passes: (when: Condition | undefined) => boolean = () => true,
  ): Placement => {
    const rule = rules?.find(
      (entry) =>
        (!entry.phases || entry.phases.includes(phase)) && passes(entry.when),
    );

    if (!rule || rule.target === ANCHOR) return { anchor: true };
    if (rule.target === AWAY)
      return sleepless && phase === TimePhase.NIGHT
        ? { anchor: true }
        : { away: true };

    return { spot: rule.target };
  },
};
