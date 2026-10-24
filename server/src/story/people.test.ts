import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { conditions, StoryContext } from "./conditions";
import { configs } from "../configs";
import {
  DialogueNode,
  EntityName,
  FactName,
  Mood,
  NodeId,
  StoryFlag,
  VillageState,
  ErrandState,
} from "../types";

const greeting = (name: EntityName): DialogueNode[] => {
  const def = configs.entities[name]?.dialogue?.[NodeId.GREETING];
  return (Array.isArray(def) ? def : [def]).filter(
    (entry): entry is DialogueNode => !!entry && !("ref" in entry),
  );
};

const context = (options: {
  bond?: Partial<Record<EntityName, number>>;
  flags?: StoryFlag[];
  carrying?: EntityName[];
  followed?: EntityName[];
  mood?: Mood;
  craving?: boolean;
  tier?: number;
  village?: VillageState;
  stock?: Partial<Record<EntityName, number>>;
}): StoryContext => ({
  facts: {
    [FactName.TIER]: options.tier ?? 1,
    [FactName.DAY]: 0,
    [FactName.LAST_HAND_IN]: 0,
    [FactName.VILLAGE]: options.village ?? VillageState.WHOLE,
    [FactName.MEATLESS]: 0,
  },
  mood: options.mood ?? Mood.HAPPY,
  flagged: (flag) => options.flags?.includes(flag) ?? false,
  carrying: (name) => options.carrying?.includes(name) ?? false,
  followed: (name) => options.followed?.includes(name) ?? false,
  errand: ErrandState.NONE,
  bond: (name) => options.bond?.[name] ?? 0,
  since: () => undefined,
  craving: options.craving ?? false,
  leaning: false,
  stock: (name) => options.stock?.[name] ?? 0,
  present: () => 0,
});

describe("ila's tips", () => {
  const nodes = greeting(EntityName.STUDENT);

  test("a stranger hears her usual line", () => {
    assert.equal(conditions.pick(nodes, context({}))?.when, undefined);
  });

  test("the first tip comes at bond 2", () => {
    const node = conditions.pick(nodes, context({ bond: { [EntityName.STUDENT]: 2 } }));
    assert.deepEqual(node?.story?.[0], {
      name: "flag:set",
      flag: StoryFlag.ILA_TIP_GREASE,
      scope: "player",
    });
  });

  test("a carried page jumps the queue", () => {
    const node = conditions.pick(
      nodes,
      context({
        bond: { [EntityName.STUDENT]: 6 },
        carrying: [EntityName.SPELL_PAGE_CATCH_SOUL],
      }),
    );
    assert.equal(node?.when?.carrying?.[0], EntityName.SPELL_PAGE_CATCH_SOUL);
  });

  test("each tip is told once", () => {
    const told = [
      StoryFlag.ILA_TIP_GREASE,
      StoryFlag.ILA_TIP_WATER,
      StoryFlag.ILA_TIP_LIGHT,
      StoryFlag.ILA_TIP_CATCH,
      StoryFlag.ILA_TIP_WEAKNESS,
    ];
    const node = conditions.pick(
      nodes,
      context({ bond: { [EntityName.STUDENT]: 10 }, flags: told }),
    );
    assert.equal(node?.when, undefined);
  });
});

describe("lynha", () => {
  const nodes = greeting(EntityName.CITIZEN16);

  test("is cool when the player is close to ila", () => {
    const node = conditions.pick(nodes, context({ bond: { [EntityName.STUDENT]: 5 } }));
    assert.match(String(node?.text), /Ila talks about you/);
  });

  test("her own friendship outweighs it", () => {
    const node = conditions.pick(
      nodes,
      context({ bond: { [EntityName.STUDENT]: 5, [EntityName.CITIZEN16]: 5 } }),
    );
    assert.match(String(node?.text), /room by the fire/);
  });
});

describe("cravings", () => {
  test("aurin complains when her carrots run out", () => {
    const node = conditions.pick(
      greeting(EntityName.GREENGROCER),
      context({ craving: true, mood: Mood.HUNGRY }),
    );
    assert.match(String(node?.text), /carrot/);
  });

  test("garleas never says he slept well", () => {
    const node = conditions.pick(
      greeting(EntityName.BEVERAGE_SALER),
      context({ mood: Mood.HAPPY }),
    );
    assert.match(String(node?.text), /closed my eyes/);
  });

  test("garleas minds his wine more than his sleep", () => {
    const node = conditions.pick(
      greeting(EntityName.BEVERAGE_SALER),
      context({ mood: Mood.HAPPY, craving: true }),
    );
    assert.match(String(node?.text), /Out of wine/);
  });
});

describe("opening the windmill and the forge", () => {
  const nodes = (name: EntityName, id: string): DialogueNode[] => {
    const def = configs.entities[name]?.dialogue?.[id];
    return (Array.isArray(def) ? def : [def]).filter(
      (entry): entry is DialogueNode => !!entry && !("ref" in entry),
    );
  };

  test("aunne keeps the windmill locked for strangers", () => {
    const node = conditions.pick(nodes(EntityName.BAKER, "windmill"), context({}));
    assert.match(String(node?.text), /locked/);
  });

  test("a friend gets the key, for the whole world", () => {
    const node = conditions.pick(
      nodes(EntityName.BAKER, "windmill"),
      context({ bond: { [EntityName.BAKER]: 5 } }),
    );
    assert.equal(node?.story?.[0]?.name, "flag:set");
    assert.equal((node?.story?.[0] as { scope: string }).scope, "world");
  });

  test("once open, everyone hears the after line", () => {
    const node = conditions.pick(
      nodes(EntityName.BLACKSMITH, "forge"),
      context({ flags: [StoryFlag.FORGE_OPEN] }),
    );
    assert.match(String(node?.text), /yours too/);
  });
});

describe("the ed tar arrive", () => {
  test("odda gets the order once, then says what she did with it", () => {
    const nodes = greeting(EntityName.HERBALIST);

    assert.match(String(conditions.pick(nodes, context({ tier: 2 }))?.text), /twenty bottles/);
    assert.match(
      String(conditions.pick(nodes, context({ tier: 2, flags: [StoryFlag.ODDA_ORDERS] }))?.text),
      /I'm not out/,
    );
    assert.match(
      String(
        conditions.pick(
          nodes,
          context({ tier: 2, flags: [StoryFlag.ODDA_ORDERS], village: VillageState.STRAINED }),
        )?.text,
      ),
      /sold it/,
    );
  });

  test("irelle only notices once the cloth is in the village", () => {
    const nodes = greeting(EntityName.WEAVER);

    assert.equal(conditions.pick(nodes, context({ tier: 2 })), null);
    assert.match(
      String(
        conditions.pick(nodes, context({ tier: 2, stock: { [EntityName.WANDERERS_CLOTH]: 1 } }))
          ?.text,
      ),
      /Same weave/,
    );
  });

  test("enna's numbers stop adding up when the village is strained", () => {
    const nodes = greeting(EntityName.HELPER1);

    assert.match(
      String(conditions.pick(nodes, context({ village: VillageState.STRAINED }))?.text),
      /nobody delivered/,
    );
  });
});

describe("the village learns their name", () => {
  const malie = greeting(EntityName.CITIZEN11).filter((node) => node.when);

  test("early on they are the open hand", () => {
    const node = conditions.pick(malie, context({ tier: 2 }));
    assert.match(String(node?.text), /Open Hand/);
  });

  test("once known they are the ed tar", () => {
    const node = conditions.pick(
      malie,
      context({ tier: 2, flags: [StoryFlag.ED_TAR_KNOWN] }),
    );
    assert.match(String(node?.text), /Ed Tar/);
  });
});

describe("asselme makes his case in order", () => {
  const nodes = (configs.entities[EntityName.CITIZEN12]?.dialogue?.["asselme:case"] ?? []) as DialogueNode[];

  test("he starts with the roads", () => {
    assert.match(String(conditions.pick(nodes, context({}))?.text), /roads safe/);
  });

  test("then the stores", () => {
    const node = conditions.pick(
      nodes,
      context({ flags: [StoryFlag.ASSELME_CASE_1] }),
    );
    assert.match(String(node?.text), /stores run low/);
  });

  test("once he has said it all, any of it again", () => {
    const told = [
      StoryFlag.ASSELME_CASE_1,
      StoryFlag.ASSELME_CASE_2,
      StoryFlag.ASSELME_CASE_3,
      StoryFlag.ASSELME_CASE_4,
      StoryFlag.ASSELME_CASE_5,
    ];
    const node = conditions.pick(nodes, context({ flags: told }));
    assert.equal(Array.isArray(node?.text), true);
  });
});
