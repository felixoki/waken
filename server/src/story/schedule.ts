import {
  ANCHOR,
  AWAY,
  Clock,
  Condition,
  Moment,
  Placement,
  Schedule,
  ScheduleRule,
  TimePhase,
} from "../types";

export const timetable = {
  roll: (name: string, day: number, salt: string): number => {
    let hash = 2166136261;
    for (const char of `${name}:${day}:${salt}`) {
      hash ^= char.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    hash ^= hash >>> 16;
    hash = Math.imul(hash, 0x85ebca6b);
    hash ^= hash >>> 13;
    hash = Math.imul(hash, 0xc2b2ae35);
    hash ^= hash >>> 16;
    return (hash >>> 0) / 4294967296;
  },

  moment: (moment: Moment, name: string, day: number, salt: string): number =>
    typeof moment === "number"
      ? moment
      : moment[0] + (moment[1] - moment[0]) * timetable.roll(name, day, salt),

  matches: (rule: ScheduleRule, clock: Clock, name: string, index: number) => {
    if (rule.phases && !rule.phases.includes(clock.phase)) return false;

    const from =
      rule.from === undefined
        ? 0
        : timetable.moment(rule.from, name, clock.day, `${index}:from`);
    const until =
      rule.until === undefined
        ? 1
        : timetable.moment(rule.until, name, clock.day, `${index}:until`);

    if (clock.progress < from || clock.progress >= until) return false;

    return (
      rule.chance === undefined ||
      timetable.roll(name, clock.day, `${index}:chance`) < rule.chance
    );
  },

  place: (
    rules: Schedule | undefined,
    clock: Clock,
    name: string,
    sleepless: boolean,
    passes: (when: Condition | undefined) => boolean = () => true,
  ): Placement => {
    const rule = rules?.find(
      (entry, index) =>
        timetable.matches(entry, clock, name, index) && passes(entry.when),
    );

    if (!rule || rule.target === ANCHOR) return { anchor: true };
    if (rule.target === AWAY)
      return sleepless && clock.phase === TimePhase.NIGHT
        ? { anchor: true }
        : { away: true };

    return { spot: rule.target };
  },
};
