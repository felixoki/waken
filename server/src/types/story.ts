import { EntityName, FishName } from "./entities";
import { Mood } from "./dialogue";

export enum StoryFlag {
  ENNA_BIG_HAND_IN = "enna.bigHandIn",
  BARREN_BUCKET = "barren.bucket",
  TARRO_BELLAN = "tarro.bellan",
  ESKEN_MAP = "esken.map",
  ESKEN_GLIMBLID = "esken.glimblid",
  GLIMBLID_PACES = "glimblid.paces",
  ENNOR_LISTENED = "ennor.listened",
  ELLIN_LISTENED = "ellin.listened",
  LYNHA_GIFT = "lynha.gift",
  ILA_TIP_GREASE = "ila.tip.grease",
  ILA_TIP_WATER = "ila.tip.water",
  ILA_TIP_LIGHT = "ila.tip.light",
  ILA_TIP_CATCH = "ila.tip.catch",
  ILA_TIP_WEAKNESS = "ila.tip.weakness",
  WINDMILL_OPEN = "windmill.open",
  FORGE_OPEN = "forge.open",
  ODDA_ORDERS = "odda.orders",
  IRELLE_WEAVE = "irelle.weave",
  ED_TAR_KNOWN = "edTar.known",
  ASSELME_CASE_1 = "asselme.case1",
  ASSELME_CASE_2 = "asselme.case2",
  ASSELME_CASE_3 = "asselme.case3",
  ASSELME_CASE_4 = "asselme.case4",
  ASSELME_CASE_5 = "asselme.case5",
  IVRO_TOLD = "ivro.told",
  MEVY_BOOT = "mevy.boot",
  TELLIS_GIVEN = "tellis.given",
  TELLIS_REFUSED = "tellis.refused",
  AURIN_CHARM = "aurin.charm",
  AURIN_STREAK = "aurin.streak",
  FENN_DOG = "fenn.dog",
  FENN_DOG_SEEN = "fenn.dogSeen",
  VALEN_DOG = "valen.dog",
  MEVY_CAT = "mevy.cat",
  VALEN_HOOK = "valen.hook",
  VALEN_RECORD = "valen.record",
  SOULS_CAUGHT = "souls.caught",
  GRANDMOTHER_FREED = "grandmother.freed",
  GRANDMOTHER_SEEN = "grandmother.seen",
  EMY_FRAME = "emy.frame",
  EMY_TOLD = "emy.told",
  EMY_SOULS = "emy.souls",
  EMY_AFTER = "emy.after",
  EMY_ODDA = "emy.odda",
  ODDA_CONFESSED = "odda.confessed",
  ODDA_RELIEF = "odda.relief",
  ODDA_LATER = "odda.later",
  ODDA_TOLD_EMY = "odda.toldEmy",
}

export enum ErrandState {
  NONE = "none",
  ACTIVE = "active",
  READY = "ready",
}

export interface ErrandConfig {
  id: string;
  tier: number;
  for: EntityName;
  item: EntityName;
  amount: number;
}

export interface ErrandReward {
  item: EntityName;
  quantity: number;
  tier: number;
  weight: number;
  rare?: boolean;
}

export interface Errand {
  id: string;
  day: number;
}

export enum FactName {
  TIER = "tier",
  DAY = "day",
  LAST_HAND_IN = "lastHandIn",
  VILLAGE = "village",
  MEATLESS = "meatless",
}

export enum VillageState {
  WHOLE = 0,
  STRAINED = 1,
  SPLIT = 2,
}

export interface WorldStory {
  flags: StoryFlag[];
  lean: Partial<Record<EntityName, number>>;
  friends: EntityName[];
  village: VillageState;
  cultDays: number;
  meatless: number;
}

export type Facts = Record<FactName, number>;

export interface Condition {
  tier?: number;
  mood?: Mood;
  flags?: StoryFlag[];
  unflags?: StoryFlag[];
  carrying?: EntityName[];
  facts?: Partial<Record<FactName, number>>;
  bond?: Partial<Record<EntityName, number>>;
  within?: { flag: StoryFlag; days: number };
  fresh?: StoryFlag[];
  carryingAny?: EntityName[];
  errand?: ErrandState;
  record?: Partial<Record<FishName, number>>;
  followed?: EntityName[];
  craving?: boolean;
  leaning?: boolean;
  stock?: Partial<Record<EntityName, number>>;
  present?: Partial<Record<EntityName, number>>;
}

export enum StoryScope {
  PLAYER = "player",
  WORLD = "world",
}

export enum StoryEffectName {
  FLAG_SET = "flag:set",
  FLAG_CLEAR = "flag:clear",
  BOND_ADD = "bond:add",
  BOND_CAP = "bond:cap",
  ITEM_TAKE = "item:take",
  ITEM_GIVE = "item:give",
  ITEM_TAKE_ANY = "item:takeAny",
  ANIMAL_SETTLE = "animal:settle",
  ERRAND_START = "errand:start",
  ERRAND_FINISH = "errand:finish",
  ERRAND_DROP = "errand:drop",
}

export type StoryEffect =
  | {
      name: StoryEffectName.FLAG_SET | StoryEffectName.FLAG_CLEAR;
      flag: StoryFlag;
      scope: StoryScope;
    }
  | { name: StoryEffectName.BOND_ADD; amount: number }
  | { name: StoryEffectName.BOND_CAP; max: number }
  | {
      name: StoryEffectName.ITEM_TAKE | StoryEffectName.ITEM_GIVE;
      item: EntityName;
      quantity: number;
    }
  | { name: StoryEffectName.ITEM_TAKE_ANY; items: EntityName[] }
  | { name: StoryEffectName.ANIMAL_SETTLE; animal: EntityName }
  | {
      name:
        | StoryEffectName.ERRAND_START
        | StoryEffectName.ERRAND_FINISH
        | StoryEffectName.ERRAND_DROP;
    };

export interface PlayerStory {
  flags: StoryFlag[];
  facts: Partial<Record<FactName, number>>;
  bond: Partial<Record<EntityName, number>>;
  caps: Partial<Record<EntityName, number>>;
  talked: Partial<Record<EntityName, number>>;
  days: Partial<Record<StoryFlag, number>>;
  errand?: Errand;
  lastErrand?: string;
  lastReward?: { item: EntityName; quantity: number };
}
