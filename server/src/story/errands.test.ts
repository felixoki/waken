import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { errands } from "./errands";
import { errandRewards, errands as pool } from "../configs/errands";
import { EntityName, ErrandConfig, ErrandReward } from "../types";

const errand = (id: string, tier: number): ErrandConfig => ({
  id,
  tier,
  for: EntityName.TANNER,
  item: EntityName.DEER_HIDE,
  amount: 3,
});

describe("pick", () => {
  const list = [errand("a", 1), errand("b", 1), errand("c", 2)];

  test("only errands up to the tier", () => {
    for (let i = 0; i < 20; i++)
      assert.notEqual(errands.pick(list, 1)?.id, "c");
  });

  test("never the same errand twice in a row", () => {
    for (let i = 0; i < 20; i++)
      assert.equal(errands.pick(list, 1, "a")?.id, "b");
  });

  test("the last one is allowed when it is the only one", () => {
    assert.equal(errands.pick([errand("a", 1)], 1, "a")?.id, "a");
  });
});

describe("fill", () => {
  test("replaces every placeholder", () => {
    const text = errands.fill(
      "{for} wants {items}. Bring {them}. {reward} for you.",
      errand("a", 1),
      (name) => name,
      (name) => errands.phrase(name),
      { item: EntityName.WINE, quantity: 2 },
    );

    assert.equal(
      text,
      "tanner wants 3 deer_hides. Bring them. 2 wines for you.",
    );
  });

  test("one of something gets an article and 'it'", () => {
    const one = { ...errand("a", 1), amount: 1 };
    const text = errands.fill(
      "{for} wants {items}. Bring {them}. {reward}.",
      one,
      (name) => name,
      () => errands.phrase("Iron ore"),
      { item: EntityName.WINE, quantity: 1 },
    );

    assert.equal(text, "tanner wants an iron ore. Bring it. an iron ore.");
  });

  test("a phrase overrides the default", () => {
    assert.equal(
      errands.count({ one: "a sack of flour", many: "{n} sacks of flour" }, 2),
      "2 sacks of flour",
    );
  });
});

describe("roll", () => {
  const rewards: ErrandReward[] = [
    { item: EntityName.WINE, quantity: 1, tier: 1, weight: 3 },
    { item: EntityName.RING2, quantity: 1, tier: 1, weight: 1, rare: true },
    { item: EntityName.BEER, quantity: 1, tier: 3, weight: 100 },
  ];

  test("a low roll picks from the rare pool", () => {
    assert.equal(errands.roll(rewards, 1, () => 0)?.item, EntityName.RING2);
  });

  test("otherwise the common pool, without rewards above the tier", () => {
    assert.equal(errands.roll(rewards, 1, () => 0.5)?.item, EntityName.WINE);
  });
});

describe("pool", () => {
  test("ids are unique and every tier 1 has an errand", () => {
    assert.equal(new Set(pool.map((e) => e.id)).size, pool.length);
    assert.ok(pool.some((e) => e.tier === 1));
    assert.ok(errandRewards.some((r) => r.tier === 1));
  });
});
