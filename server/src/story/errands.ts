import { EntityName, ErrandConfig, ErrandReward, Phrase } from "../types";
import { ERRAND_RARE_CHANCE } from "../globals";

export const errands = {
  pick: (
    pool: ErrandConfig[],
    tier: number,
    last?: string,
    random: () => number = Math.random,
  ): ErrandConfig | undefined => {
    const open = pool.filter((errand) => errand.tier <= tier);
    const fresh = open.length > 1 ? open.filter((e) => e.id !== last) : open;

    return fresh[Math.floor(random() * fresh.length)];
  },

  roll: (
    rewards: ErrandReward[],
    tier: number,
    random: () => number = Math.random,
  ): ErrandReward | undefined => {
    const rare = random() < ERRAND_RARE_CHANCE;
    const tiered = rewards.filter((reward) => reward.tier <= tier);
    const kind = tiered.filter((reward) => !!reward.rare === rare);
    const open = kind.length ? kind : tiered;
    const total = open.reduce((sum, reward) => sum + reward.weight, 0);
    let roll = random() * total;

    for (const reward of open) {
      roll -= reward.weight;
      if (roll < 0) return reward;
    }

    return open[open.length - 1];
  },

  phrase: (displayName: string): Phrase => {
    const noun = displayName.toLowerCase();

    return {
      one: `${/^[aeiou]/.test(noun) ? "an" : "a"} ${noun}`,
      many: `{n} ${noun}s`,
    };
  },

  count: (phrase: Phrase, quantity: number): string =>
    quantity === 1 ? phrase.one : phrase.many.split("{n}").join(String(quantity)),

  fill: (
    text: string,
    errand: ErrandConfig,
    name: (entity: EntityName) => string,
    phrase: (entity: EntityName) => Phrase,
    reward?: { item: EntityName; quantity: number },
  ): string =>
    text
      .split("{items}")
      .join(errands.count(phrase(errand.item), errand.amount))
      .split("{them}")
      .join(errand.amount === 1 ? "it" : "them")
      .split("{for}")
      .join(name(errand.for))
      .split("{reward}")
      .join(reward ? errands.count(phrase(reward.item), reward.quantity) : ""),
};
