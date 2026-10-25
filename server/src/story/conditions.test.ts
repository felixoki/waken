import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { conditions, StoryContext } from "./conditions";
import {
  Condition,
  EntityName,
  ErrandState,
  FactName,
  Mood,
  StoryFlag,
} from "../types";

const context = (overrides: Partial<StoryContext> = {}): StoryContext => ({
  facts: {
    [FactName.TIER]: 1,
    [FactName.DAY]: 0,
    [FactName.LAST_HAND_IN]: 0,
    [FactName.VILLAGE]: 0,
    [FactName.MEATLESS]: 0,
  },
  mood: Mood.HAPPY,
  flagged: () => false,
  carrying: () => false,
  followed: () => false,
  errand: ErrandState.NONE,
  bond: () => 0,
  since: () => undefined,
  craving: false,
  leaning: false,
  stock: () => 0,
  present: () => 0,
  ...overrides,
});

const facts = (values: Partial<StoryContext["facts"]>) =>
  context({ facts: { ...context().facts, ...values } });

describe("passes", () => {
  test("no condition always passes", () => {
    assert.equal(conditions.passes(undefined, context()), true);
  });

  test("tier is a minimum", () => {
    const when: Condition = { tier: 2 };

    assert.equal(conditions.passes(when, facts({ [FactName.TIER]: 1 })), false);
    assert.equal(conditions.passes(when, facts({ [FactName.TIER]: 2 })), true);
    assert.equal(conditions.passes(when, facts({ [FactName.TIER]: 3 })), true);
  });

  test("mood must match", () => {
    const when: Condition = { mood: Mood.HUNGRY };

    assert.equal(conditions.passes(when, context()), false);
    assert.equal(
      conditions.passes(when, context({ mood: Mood.HUNGRY })),
      true,
    );
  });

  test("flags must be set and unflags must not", () => {
    const flagged = () => true;

    assert.equal(
      conditions.passes({ flags: [StoryFlag.ENNA_BIG_HAND_IN] }, context()),
      false,
    );
    assert.equal(
      conditions.passes(
        { flags: [StoryFlag.ENNA_BIG_HAND_IN] },
        context({ flagged }),
      ),
      true,
    );
    assert.equal(
      conditions.passes(
        { unflags: [StoryFlag.ENNA_BIG_HAND_IN] },
        context({ flagged }),
      ),
      false,
    );
  });

  test("carrying needs every item", () => {
    const when: Condition = {
      carrying: [EntityName.BREAD, EntityName.MILK],
    };
    const onlyBread = (name: EntityName) => name === EntityName.BREAD;

    assert.equal(
      conditions.passes(when, context({ carrying: onlyBread })),
      false,
    );
    assert.equal(
      conditions.passes(when, context({ carrying: () => true })),
      true,
    );
  });

  test("carrying any needs one of the items", () => {
    const when: Condition = {
      carryingAny: [EntityName.BEEF, EntityName.GAME_MEAT],
    };
    const onlyBeef = (name: EntityName) => name === EntityName.BEEF;

    assert.equal(conditions.passes(when, context()), false);
    assert.equal(
      conditions.passes(when, context({ carrying: onlyBeef })),
      true,
    );
  });

  test("followed needs the animal at your heels", () => {
    const when: Condition = { followed: [EntityName.DOG] };

    assert.equal(conditions.passes(when, context()), false);
    assert.equal(
      conditions.passes(when, context({ followed: () => true })),
      true,
    );
  });

  test("facts are minimums", () => {
    const when: Condition = { facts: { [FactName.DAY]: 7 } };

    assert.equal(conditions.passes(when, facts({ [FactName.DAY]: 6 })), false);
    assert.equal(conditions.passes(when, facts({ [FactName.DAY]: 7 })), true);
  });
});

describe("pick", () => {
  type Node = { text: string; when?: Condition; salience?: number };

  const ordinary: Node = { text: "ordinary" };
  const enna: Node = {
    text: "store this much",
    salience: 1,
    when: {
      facts: { [FactName.LAST_HAND_IN]: 50 },
      unflags: [StoryFlag.ENNA_BIG_HAND_IN],
    },
  };

  test("falls back to the ordinary node", () => {
    assert.equal(conditions.pick([ordinary, enna], context()), ordinary);
  });

  test("a big hand-in brings out enna's line", () => {
    const big = facts({ [FactName.LAST_HAND_IN]: 80 });

    assert.equal(conditions.pick([ordinary, enna], big), enna);
  });

  test("enna's line fires only once", () => {
    const seen = context({
      facts: { ...context().facts, [FactName.LAST_HAND_IN]: 80 },
      flagged: (flag) => flag === StoryFlag.ENNA_BIG_HAND_IN,
    });

    assert.equal(conditions.pick([ordinary, enna], seen), ordinary);
  });

  test("returns nothing when no node passes", () => {
    assert.equal(conditions.pick([enna], context()), null);
  });
});

describe("explain", () => {
  test("lists every failing part", () => {
    const failures = conditions.explain(
      { tier: 2, flags: [StoryFlag.ENNA_BIG_HAND_IN] },
      context(),
    );

    assert.equal(failures.length, 2);
  });

  test("is empty when the condition passes", () => {
    assert.deepEqual(conditions.explain({ tier: 1 }, context()), []);
  });
});

describe("bond and time", () => {
  test("bond is a minimum with the named villager", () => {
    const when: Condition = { bond: { [EntityName.STUDENT]: 5 } };
    const bond = (level: number) => (name: EntityName) =>
      name === EntityName.STUDENT ? level : 0;

    assert.equal(conditions.passes(when, context({ bond: bond(4) })), false);
    assert.equal(conditions.passes(when, context({ bond: bond(5) })), true);
  });

  test("within needs the flag set fewer than n days ago", () => {
    const when: Condition = {
      within: { flag: StoryFlag.ENNA_BIG_HAND_IN, days: 7 },
    };
    const since = (days: number | undefined) => () => days;

    assert.equal(conditions.passes(when, context({ since: since(undefined) })), false);
    assert.equal(conditions.passes(when, context({ since: since(0) })), true);
    assert.equal(conditions.passes(when, context({ since: since(6) })), true);
    assert.equal(conditions.passes(when, context({ since: since(7) })), false);
  });

  test("fresh fails only on the day the flag was set", () => {
    const when: Condition = { fresh: [StoryFlag.ENNA_BIG_HAND_IN] };

    assert.equal(conditions.passes(when, context()), true);
    assert.equal(conditions.passes(when, context({ since: () => 0 })), false);
    assert.equal(conditions.passes(when, context({ since: () => 1 })), true);
  });
});

describe("ties", () => {
  test("nodes tied on salience are picked at random", () => {
    const a = { text: "a", salience: 1 };
    const b = { text: "b", salience: 1 };

    assert.equal(conditions.pick([a, b], context(), () => 0), a);
    assert.equal(conditions.pick([a, b], context(), () => 0.99), b);
  });
});
