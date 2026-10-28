import {
  Condition,
  EntityName,
  ErrandState,
  FactName,
  FishName,
  Facts,
  Mood,
  StoryFlag,
} from "../types";

export interface StoryContext {
  facts: Facts;
  mood: Mood;
  flagged: (flag: StoryFlag) => boolean;
  carrying: (name: EntityName) => boolean;
  followed: (name: EntityName) => boolean;
  bond: (name: EntityName) => number;
  since: (flag: StoryFlag) => number | undefined;
  craving: boolean;
  leaning: boolean;
  stock: (name: EntityName) => number;
  present: (name: EntityName) => number;
  errand: ErrandState;
  record: (fish: FishName) => number;
}

export const conditions = {
  passes: (when: Condition | undefined, context: StoryContext): boolean =>
    conditions.explain(when, context).length === 0,

  explain: (when: Condition | undefined, context: StoryContext): string[] => {
    if (!when) return [];

    const failures: string[] = [];
    const tier = context.facts[FactName.TIER];

    if (when.tier !== undefined && tier < when.tier)
      failures.push(`tier ${when.tier} needed, is ${tier}`);

    if (when.mood !== undefined && context.mood !== when.mood)
      failures.push(`mood ${when.mood} needed, is ${context.mood}`);

    for (const flag of when.flags ?? [])
      if (!context.flagged(flag)) failures.push(`flag ${flag} not set`);

    for (const flag of when.unflags ?? [])
      if (context.flagged(flag)) failures.push(`flag ${flag} is set`);

    for (const name of when.carrying ?? [])
      if (!context.carrying(name)) failures.push(`not carrying ${name}`);

    if (when.carryingAny && !when.carryingAny.some((name) => context.carrying(name)))
      failures.push(`not carrying any of ${when.carryingAny.join(", ")}`);

    for (const [fish, min] of Object.entries(when.record ?? {}) as [
      FishName,
      number,
    ][])
      if (context.record(fish) < min)
        failures.push(`record ${min} for ${fish} needed, is ${context.record(fish)}`);

    if (when.errand && context.errand !== when.errand)
      failures.push(`errand ${when.errand} needed, is ${context.errand}`);

    for (const name of when.followed ?? [])
      if (!context.followed(name)) failures.push(`not followed by ${name}`);

    for (const [name, min] of Object.entries(when.facts ?? {}) as [
      FactName,
      number,
    ][])
      if (context.facts[name] < min)
        failures.push(`${name} ${min} needed, is ${context.facts[name]}`);

    for (const [name, min] of Object.entries(when.bond ?? {}) as [
      EntityName,
      number,
    ][])
      if (context.bond(name) < min)
        failures.push(`bond ${min} with ${name} needed, is ${context.bond(name)}`);

    if (when.within) {
      const since = context.since(when.within.flag);

      if (since === undefined || since >= when.within.days)
        failures.push(
          `flag ${when.within.flag} not set within ${when.within.days} days`,
        );
    }

    for (const flag of when.fresh ?? [])
      if (context.since(flag) === 0) failures.push(`flag ${flag} set today`);

    if (when.craving !== undefined && when.craving !== context.craving)
      failures.push(when.craving ? "not craving" : "craving");

    if (when.leaning !== undefined && when.leaning !== context.leaning)
      failures.push(when.leaning ? "not leaning" : "leaning");

    for (const [name, min] of Object.entries(when.stock ?? {}) as [
      EntityName,
      number,
    ][])
      if (context.stock(name) < min)
        failures.push(`${min} ${name} in stock needed, is ${context.stock(name)}`);

    for (const [name, min] of Object.entries(when.present ?? {}) as [
      EntityName,
      number,
    ][])
      if (context.present(name) < min)
        failures.push(`${min} ${name} present needed, is ${context.present(name)}`);

    return failures;
  },

  pick: <T extends { when?: Condition; salience?: number }>(
    nodes: T[],
    context: StoryContext,
    random: () => number = Math.random,
  ): T | null => {
    let best: T[] = [];

    for (const node of nodes) {
      if (!conditions.passes(node.when, context)) continue;

      const salience = node.salience ?? 0;
      const top = best[0]?.salience ?? 0;

      if (!best.length || salience > top) best = [node];
      else if (salience === top) best.push(node);
    }

    return best.length ? best[Math.floor(random() * best.length)] : null;
  },
};
