import { EntityName } from "./entities.js";
import { ImprovementName } from "./improvements.js";
import { SpellName } from "./spells.js";

export enum NoticeKind {
  ITEM = "item",
  TAKEN = "taken",
  LEDGER = "ledger",
  SPELL = "spell",
  PLAYER = "player",
  PARTY = "party",
  TIER = "tier",
  IMPROVEMENT = "improvement",
  WARN = "warn",
}

export enum Warning {
  INVENTORY_FULL = "inventory_full",
}

export type Notice =
  | {
      kind: NoticeKind.ITEM;
      name: EntityName;
      quantity: number;
      soul?: EntityName;
      from?: EntityName;
    }
  | { kind: NoticeKind.TAKEN; name: EntityName; quantity: number }
  | { kind: NoticeKind.LEDGER; total: number }
  | { kind: NoticeKind.SPELL; name: SpellName }
  | { kind: NoticeKind.PLAYER | NoticeKind.PARTY; id: string; joined: boolean }
  | { kind: NoticeKind.TIER; tier: number }
  | { kind: NoticeKind.IMPROVEMENT; name: ImprovementName }
  | { kind: NoticeKind.WARN; warning: Warning };
