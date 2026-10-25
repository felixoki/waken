import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { EconomyManager } from "./Economy";
import { ItemsStore } from "../stores/Items";
import {
  EntityName,
  GroupName,
  ImprovementName,
  Mood,
  NeedName,
  TimePhase,
} from "../types";
import { DAY, STORE_CAPACITY, STORE_CAPACITY_EXPANDED } from "../globals";

const stocked = (items: Partial<Record<EntityName, number>>) => {
  const supply = new ItemsStore();
  for (const [name, quantity] of Object.entries(items))
    supply.add(name as EntityName, quantity);

  return { supply, economy: new EconomyManager(supply) };
};

const tierOne = {
  [EntityName.RASPBERRY]: 10,
  [EntityName.GAME_MEAT]: 10,
  [EntityName.MILK]: 10,
  [EntityName.TUNIC]: 10,
  [EntityName.CANDLE]: 10,
};

describe("groups", () => {
  test("an empty village is unhappy and can't upgrade", () => {
    const { economy } = stocked({});

    assert.notEqual(economy.getMood(), Mood.HAPPY);
    assert.equal(economy.canUpgrade(), false);
  });

  test("every tier 1 group stocked makes a happy village", () => {
    const { economy } = stocked(tierOne);

    assert.equal(economy.getMood(), Mood.HAPPY);
    assert.equal(economy.canUpgrade(), true);
  });

  test("fruit alone doesn't satisfy food", () => {
    const { economy } = stocked({ ...tierOne, [EntityName.GAME_MEAT]: 0 });

    assert.equal(economy.isLow(NeedName.FOOD), true);
    assert.equal(economy.getMood(), Mood.HUNGRY);
    assert.equal(economy.canUpgrade(), false);
  });

  test("at tier 1 any tier 1 item fills a group", () => {
    const { economy } = stocked({
      ...tierOne,
      [EntityName.RASPBERRY]: 0,
      [EntityName.STRAWBERRY]: 10,
    });

    assert.equal(economy.isLow(NeedName.FOOD), false);
  });

  test("each tier adds a slot filled by an item of that tier", () => {
    const tierTwo = {
      ...tierOne,
      [EntityName.CARROT]: 10,
      [EntityName.VEST]: 10,
    };

    const twoOld = stocked(tierTwo);
    twoOld.economy.setTier(2);
    assert.equal(twoOld.economy.isLow(NeedName.FOOD), true);

    const oldAndNew = stocked({ ...tierTwo, [EntityName.BEEF]: 10 });
    oldAndNew.economy.setTier(2);
    assert.equal(oldAndNew.economy.isLow(NeedName.FOOD), false);
    assert.equal(oldAndNew.economy.canUpgrade(), true);
  });

  test("a group only has slots for tiers that have items", () => {
    const { economy } = stocked(tierOne);
    economy.setTier(3);

    const drinks = economy
      .getSnapshot()
      .needs.find((need) => need.name === NeedName.DRINKS);
    const milk = drinks?.groups.find((group) => group.name === GroupName.MILK);

    assert.equal(milk?.needed, 1);
    assert.equal(milk?.met, true);
  });

  test("candles are rest, not warmth", () => {
    const { economy } = stocked({ ...tierOne, [EntityName.CANDLE]: 0 });

    assert.equal(economy.isLow(NeedName.WARMTH), false);
    assert.equal(economy.getMood(), Mood.SLEEPLESS);
  });

  test("a new tier asks for more", () => {
    const { economy } = stocked(tierOne);
    economy.setTier(2);

    assert.equal(economy.isLow(NeedName.FOOD), true);
  });

  test("a group with no items yet is never required", () => {
    const { economy } = stocked(tierOne);
    economy.setTier(2);

    const rest = economy
      .getSnapshot()
      .needs.find((need) => need.name === NeedName.REST);
    const bedding = rest?.groups.find(
      (group) => group.name === GroupName.BEDDING,
    );

    assert.equal(bedding?.required, false);
    assert.equal(bedding?.met, true);
  });

  test("resources never block an upgrade", () => {
    const { economy } = stocked(tierOne);

    assert.equal(economy.isLow(NeedName.RESOURCES), false);
  });
});

describe("game time", () => {
  test("each group consumes a day's worth per day", () => {
    const { supply, economy } = stocked(tierOne);

    for (let i = 0; i < 100; i++) economy.update(DAY / 100);

    assert.ok(Math.abs(supply.get(EntityName.MILK) - 9.5) < 0.001);
    assert.ok(Math.abs(supply.get(EntityName.RASPBERRY) - 9.5) < 0.001);
    assert.ok(Math.abs(supply.get(EntityName.GAME_MEAT) - 9.5) < 0.001);
  });

  test("small ticks add up before anything is consumed", () => {
    const { supply, economy } = stocked(tierOne);
    economy.update(500);

    assert.equal(supply.get(EntityName.MILK), 10);
  });
});

describe("mood per villager", () => {
  const tierTwo = {
    ...tierOne,
    [EntityName.BEEF]: 10,
    [EntityName.TOMATO]: 10,
    [EntityName.VEST]: 10,
  };

  test("a villager minds their own item even when the village is fine", () => {
    const { economy } = stocked(tierTwo);
    economy.setTier(2);

    assert.equal(economy.getMood(), Mood.HAPPY);
    assert.equal(economy.getMood(EntityName.GREENGROCER), Mood.HUNGRY);
    assert.equal(economy.getMood(EntityName.STUDENT), Mood.HAPPY);
  });

  test("a preference doesn't count before its item is unlocked", () => {
    const { economy } = stocked(tierOne);

    assert.equal(economy.getMood(EntityName.GREENGROCER), Mood.HAPPY);
  });

  test("unmet needs are spread across villagers, stably", () => {
    const { economy } = stocked({
      ...tierOne,
      [EntityName.MILK]: 0,
      [EntityName.CANDLE]: 0,
    });
    const villagers = [
      EntityName.STUDENT,
      EntityName.TANNER,
      EntityName.WEAVER,
      EntityName.CITIZEN1,
      EntityName.CITIZEN2,
      EntityName.CITIZEN7,
    ];
    const moods = villagers.map((villager) => economy.getMood(villager));

    assert.deepEqual(
      villagers.map((villager) => economy.getMood(villager)),
      moods,
    );
    assert.ok(moods.includes(Mood.THIRSTY));
    assert.ok(moods.includes(Mood.SLEEPLESS));
    assert.ok(!moods.includes(Mood.HAPPY));
  });
});

describe("demand", () => {
  test("candles burn only at night", () => {
    const { supply, economy } = stocked(tierOne);

    economy.update(DAY / 2, TimePhase.DAY);
    assert.equal(supply.get(EntityName.CANDLE), 10);

    economy.update(DAY / 2, TimePhase.NIGHT);
    assert.ok(supply.get(EntityName.CANDLE) < 10);
  });

  test("rain wears clothing faster", () => {
    const dry = stocked(tierOne);
    const wet = stocked(tierOne);

    dry.economy.update(DAY, TimePhase.DAY, false);
    wet.economy.update(DAY, TimePhase.DAY, true);

    assert.ok(
      wet.supply.get(EntityName.TUNIC) < dry.supply.get(EntityName.TUNIC),
    );
  });
});

describe("improvements", () => {
  test("the store fills up to its capacity", () => {
    const { economy } = stocked({ [EntityName.WOOD]: 45.5 });

    assert.equal(economy.capacity(), STORE_CAPACITY);
    assert.equal(economy.room(EntityName.WOOD), 4);
    assert.equal(economy.room(EntityName.GLASS), STORE_CAPACITY);
  });

  test("storage raises the capacity", () => {
    const { economy } = stocked({ [EntityName.WOOD]: 50 });

    economy.improve(ImprovementName.STORAGE);

    assert.equal(economy.has(ImprovementName.STORAGE), true);
    assert.equal(economy.capacity(), STORE_CAPACITY_EXPANDED);
    assert.equal(economy.room(EntityName.WOOD), STORE_CAPACITY_EXPANDED - 50);
    assert.deepEqual(economy.getSnapshot().improvements, [
      ImprovementName.STORAGE,
    ]);
  });

  test("tier, improvements and store survive a save", () => {
    const { economy } = stocked({ [EntityName.WOOD]: 120 });

    economy.setTier(3);
    economy.improve(ImprovementName.STORAGE);

    const saved = JSON.parse(JSON.stringify(economy.state()));
    const restored = stocked({});
    restored.economy.hydrate(saved);

    assert.equal(restored.economy.getTier(), 3);
    assert.equal(restored.economy.has(ImprovementName.STORAGE), true);
    assert.equal(restored.supply.get(EntityName.WOOD), 120);
  });
});
