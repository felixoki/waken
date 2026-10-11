import { SpellName } from "./spells";
import { Item } from "./components";
import { PlayerConfig } from "./players";
import { Socket } from "socket.io";
import { World } from "../World";

export enum SlotType {
  SPELL = "spell",
  ENTITY = "entity",
}

export type Slot =
  | { type: SlotType.SPELL; name: SpellName }
  | { type: SlotType.ENTITY; item: Item };

export enum HotbarDirection {
  PREV = "prev",
  NEXT = "next",
}

export enum SlotZone {
  INVENTORY = "inventory",
  HOTBAR = "hotbar",
  ROBE = "robe",
  STORAGE = "storage",
  SPELLBOOK = "spellbook",
}

export interface SlotReference {
  zone: SlotZone;
  index: number;
  entityId?: string;
}

export type SlotRef = { slots: any[]; index: number };

export type ZoneHandler = {
  accepts: SlotType | null;
  readonly: boolean;
  allows?(item: Item): boolean;
  resolve(
    player: PlayerConfig,
    ref: SlotReference,
    world: World,
  ): SlotRef | null;
  sync(
    socket: Socket,
    player: PlayerConfig,
    ref: SlotReference,
    world: World,
  ): void;
};
