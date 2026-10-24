import { parseArgs } from "node:util";
import { configs } from "../server/src/configs";
import { EconomyManager } from "../server/src/managers/Economy";
import { ItemsStore } from "../server/src/stores/Items";
import { DAY, PHASE_STARTS } from "../server/src/globals";
import { EntityName } from "../server/src/types";

const { values } = parseArgs({
  options: {
    tier: { type: "string", default: "1" },
    days: { type: "string", default: "10" },
    stock: { type: "string", default: "" },
    daily: { type: "string", default: "" },
    rain: { type: "boolean", default: false },
  },
});

const parse = (list: string): [EntityName, number][] =>
  list
    .split(",")
    .filter(Boolean)
    .map((entry) => {
      const [name, quantity] = entry.split(":");

      if (!configs.entities[name as EntityName]) {
        console.error(`Unknown item "${name}"`);
        process.exit(1);
      }

      return [name as EntityName, Number(quantity ?? 1)];
    });

const tier = Number(values.tier);
const days = Number(values.days);
const stock = parse(values.stock);
const daily = parse(values.daily);

const supply = new ItemsStore();
for (const [name, quantity] of stock) supply.add(name, quantity);

const economy = new EconomyManager(supply);
economy.setTier(tier);

const groups = configs.needs
  .filter((need) => need.consumption > 0 && need.tier <= tier)
  .flatMap((need) =>
    need.groups
      .filter((group) =>
        need.items.some(
          (item) => item.group === group.name && item.tier <= tier,
        ),
      )
      .map((group) => {
        const items = need.items.filter(
          (item) => item.group === group.name && item.tier <= tier,
        );
        const tiers = [...new Set(items.map((item) => item.tier))];

        return {
          name: group.name,
          low: group.low,
          slots: tiers.map((slot) =>
            items.filter((item) => item.tier === slot).map((item) => item.item),
          ),
        };
      }),
  );

const width = 11;
const cell = (text: string) => text.padStart(width);

const row = (day: number) => {
  const amounts = groups.map((group) => {
    const amount = Math.min(
      ...group.slots.map((slot) =>
        Math.max(...slot.map((item) => supply.get(item))),
      ),
    );

    return cell(`${amount.toFixed(1)}${amount < group.low ? "*" : " "}`);
  });

  const upgrade = economy.canUpgrade() ? "yes" : "no";

  return `${String(day).padStart(4)}${amounts.join("")}  ${economy.getMood().padEnd(10)}${upgrade}`;
};

console.log(
  `tier ${tier}, ${days} days` +
    (daily.length ? `, daily: ${values.daily}` : "") +
    (values.rain ? ", raining" : "") +
    "\nEach group shows its weakest slot. * below its low mark\n",
);
console.log(
  `${"day".padStart(4)}${groups.map((group) => cell(group.name)).join("")}  ${"mood".padEnd(10)}upgrade`,
);
console.log(row(0));

const steps = 24;

for (let day = 1; day <= days; day++) {
  for (const [name, quantity] of daily) supply.add(name, quantity);
  for (let step = 0; step < steps; step++) {
    const progress = step / steps;
    const phase = PHASE_STARTS.filter((entry) => progress >= entry.start).pop()
      ?.phase;

    economy.update(DAY / steps, phase, values.rain);
  }

  console.log(row(day));
}
