import { Socket } from "socket.io";
import { MAX_STACK } from "../globals";
import {
  ComponentName,
  Item,
  Event,
  Slot,
  SlotType,
  SlotZone,
  SlotReference,
  SpellName,
  ZoneHandler,
  PlayerConfig,
} from "../types";
import { configs } from "../configs/index.js";
import { World } from "../World";

export const storage = {
  add(slots: (Item | null)[], item: Item): (Item | null)[] {
    const result = storage.clone(slots);
    let remaining = item.quantity;

    if (item.stackable)
      for (const s of result) {
        if (s?.name !== item.name || s.quantity >= MAX_STACK) continue;
        const add = Math.min(MAX_STACK - s.quantity, remaining);

        s.quantity += add;
        remaining -= add;
        if (remaining === 0) return result;
      }

    const empty = result.findIndex((s) => s === null);

    if (remaining > 0 && empty !== -1)
      result[empty] = { ...item, quantity: remaining };

    return result;
  },

  remove(slots: (Item | null)[], item: Item): (Item | null)[] {
    const result = storage.clone(slots);
    let remaining = item.quantity;

    for (let i = 0; i < result.length && remaining > 0; i++) {
      if (result[i]?.name !== item.name) continue;
      const remove = Math.min(result[i]!.quantity, remaining);

      result[i]!.quantity -= remove;
      remaining -= remove;
      if (result[i]!.quantity === 0) result[i] = null;
    }

    return result;
  },

  has(slots: (Item | null)[], item: Item): boolean {
    const total = slots
      .filter((s): s is Item => s?.name === item.name)
      .reduce((sum, s) => sum + s.quantity, 0);

    return total >= item.quantity;
  },

  clone(slots: (Item | null)[]) {
    return slots.map((s) => (s ? { ...s } : null));
  },

  open: (data: { entityId: string }, socket: Socket, world: World) => {
    const player = world.players.getBySocketId(socket.id);
    const entity = world.entities.get(data.entityId);

    if (!entity || entity.isLocked || !player) return;

    if (!entity.storing) {
      const def = configs.entities[entity.name];
      const comp = def?.components.find(
        (c) => c.name === ComponentName.STORAGE,
      );
      const slots =
        comp && comp.name === ComponentName.STORAGE ? comp.config.slots : 16;

      let storing: (Item | null)[] = new Array(slots).fill(null);

      if (entity.loot)
        for (const entry of entity.loot) {
          if (Math.random() > entry.chance) continue;
          const { chance, ...item } = entry;
          storing = storage.add(storing, item);
        }

      entity.storing = storing;
    }

    entity.isLocked = true;
    entity.lockedBy = player.id;

    socket.emit(Event.STORAGE_SYNC, {
      entityId: data.entityId,
      slots: entity.storing,
    });
  },

  close: (data: { entityId: string }, socket: Socket, world: World) => {
    const entity = world.entities.get(data.entityId);
    const player = world.players.getBySocketId(socket.id);

    if (!entity || !player || entity.lockedBy !== player.id) return;

    entity.isLocked = false;
    entity.lockedBy = undefined;
  },

  zone: {
    [SlotZone.INVENTORY]: {
      accepts: SlotType.ENTITY,
      readonly: false,

      resolve(player: PlayerConfig, ref: SlotReference) {
        if (ref.index < 0 || ref.index >= player.inventory.length) return null;
        return { slots: player.inventory, index: ref.index };
      },

      sync(socket: Socket, player: PlayerConfig) {
        socket.emit(Event.INVENTORY_SYNC, player.inventory);
      },
    },

    [SlotZone.HOTBAR]: {
      accepts: null,
      readonly: false,

      resolve(player: PlayerConfig, ref: SlotReference) {
        if (ref.index < 0 || ref.index >= player.hotbar.length) return null;
        return { slots: player.hotbar, index: ref.index };
      },

      sync(socket: Socket, player: PlayerConfig) {
        socket.emit(Event.HOTBAR_SYNC, player.hotbar);
      },
    },

    [SlotZone.STORAGE]: {
      accepts: SlotType.ENTITY,
      readonly: false,

      resolve(player: PlayerConfig, ref: SlotReference, world: World) {
        const entity = ref.entityId ? world.entities.get(ref.entityId) : null;
        if (!entity || entity.lockedBy !== player.id || !entity.storing)
          return null;

        const slots = entity.storing;
        const index =
          ref.index === -1 ? slots.findIndex((s) => s === null) : ref.index;
        if (index < 0 || index >= slots.length) return null;

        return { slots, index };
      },

      sync(
        socket: Socket,
        _player: PlayerConfig,
        ref: SlotReference,
        world: World,
      ) {
        const entity = world.entities.get(ref.entityId!);

        if (entity)
          socket.emit(Event.STORAGE_SYNC, {
            entityId: ref.entityId,
            slots: entity.storing,
          });
      },
    },

    [SlotZone.SPELLBOOK]: {
      accepts: SlotType.SPELL,
      readonly: true,

      resolve(player: PlayerConfig, ref: SlotReference) {
        const index = ref.index === -1 ? 0 : ref.index;

        if (index < 0 || index >= player.spells.length) return null;
        return { slots: player.spells, index };
      },

      sync(socket: Socket, player: PlayerConfig) {
        socket.emit(Event.SPELLS_SYNC, player.spells);
      },
    },
  } as Record<SlotZone, ZoneHandler>,

  move: (
    data: { source: SlotReference; target: SlotReference; type: SlotType },
    socket: Socket,
    world: World,
  ) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player) return;

    const { source, target, type } = data;

    if (
      source.zone === target.zone &&
      source.index === target.index &&
      source.entityId === target.entityId
    )
      return;

    const zone = {
      source: storage.zone[source.zone],
      target: storage.zone[target.zone],
    };

    const src = zone.source.resolve(player, source, world);
    const tgt = zone.target.resolve(player, target, world);

    if (!src || !tgt) return;

    const value = {
      source: src.slots[src.index],
      target: tgt.slots[tgt.index],
    };

    if (
      value.source === null ||
      (zone.target.accepts !== null && zone.target.accepts !== type)
    )
      return;

    if (zone.target.readonly) {
      if (!zone.source.readonly) {
        src.slots[src.index] = null;
        zone.source.sync(socket, player, source, world);
      }

      return;
    }

    if (!zone.source.readonly && value.target !== null) {
      const from = storage.unwrap(source.zone, value.source);
      const into = storage.unwrap(target.zone, value.target);

      if (from.type === SlotType.ENTITY && into.type === SlotType.ENTITY) {
        const fromItem = from.core as Item;
        const intoItem = into.core as Item;

        if (
          fromItem.name === intoItem.name &&
          fromItem.stackable &&
          intoItem.stackable &&
          intoItem.quantity < MAX_STACK
        ) {
          const moved = Math.min(MAX_STACK - intoItem.quantity, fromItem.quantity);

          intoItem.quantity += moved;
          fromItem.quantity -= moved;

          if (fromItem.quantity === 0) src.slots[src.index] = null;

          zone.source.sync(socket, player, source, world);

          const same =
            source.zone === target.zone && source.entityId === target.entityId;

          if (!zone.target.readonly && !same)
            zone.target.sync(socket, player, target, world);

          return;
        }
      }
    }

    const core = storage.unwrap(source.zone, value.source).core;
    const wrapped = storage.wrap(target.zone, core, type);

    if (
      target.zone === SlotZone.HOTBAR &&
      source.zone !== SlotZone.HOTBAR &&
      type === SlotType.SPELL
    ) {
      const name = (wrapped as Slot & { type: SlotType.SPELL }).name;
      const existing = (tgt.slots as (Slot | null)[]).findIndex(
        (s, i) =>
          i !== tgt.index && s?.type === SlotType.SPELL && s.name === name,
      );

      if (existing !== -1) return;
    }

    let swapped: Item | Slot | SpellName | null | undefined = null;

    if (value.target !== null) {
      const displaced = storage.unwrap(target.zone, value.target);

      if (zone.source.readonly) {
        if (displaced.type === SlotType.ENTITY) return;

        const withinHotbar =
          source.zone === SlotZone.HOTBAR && target.zone === SlotZone.HOTBAR;

        if (!withinHotbar && displaced.type !== type) return;
      }

      swapped = storage.wrap(source.zone, displaced.core, displaced.type);
      if (swapped === undefined) return;
    }

    if (!zone.source.readonly) src.slots[src.index] = swapped;

    tgt.slots[tgt.index] = wrapped;

    if (!zone.source.readonly) zone.source.sync(socket, player, source, world);

    if (!zone.target.readonly) {
      const same =
        source.zone === target.zone && source.entityId === target.entityId;

      if (!same) zone.target.sync(socket, player, target, world);
    }
  },

  unwrap(
    zone: SlotZone,
    val: Item | Slot | SpellName,
  ): { core: Item | SpellName; type: SlotType } {
    if (zone !== SlotZone.HOTBAR)
      return {
        core: val as Item | SpellName,
        type: storage.zone[zone].accepts!,
      };

    const slot = val as Slot;

    return slot.type === SlotType.SPELL
      ? { core: slot.name, type: SlotType.SPELL }
      : { core: slot.item, type: SlotType.ENTITY };
  },

  wrap(
    zone: SlotZone,
    core: Item | SpellName,
    type: SlotType,
  ): Item | Slot | SpellName | undefined {
    if (
      storage.zone[zone].accepts !== null &&
      storage.zone[zone].accepts !== type
    )
      return undefined;

    if (zone !== SlotZone.HOTBAR) return core;

    return type === SlotType.SPELL
      ? { type: SlotType.SPELL, name: core as SpellName }
      : { type: SlotType.ENTITY, item: core as Item };
  },
};
