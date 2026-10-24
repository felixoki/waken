import { Server, Socket } from "socket.io";
import { World } from "../World";
import {
  EntityConfig,
  EntityName,
  ErrandConfig,
  ErrandState,
  Event,
  FactName,
  Item,
  MapName,
  PlayerConfig,
  SlotType,
  StoryEffect,
  StoryEffectName,
  StoryFlag,
  StoryScope,
} from "../types";
import { StoryContext } from "../story/conditions.js";
import { BOND_FRIEND, BOND_MAX } from "../globals.js";
import { village } from "../story/village.js";
import { errands } from "../story/errands.js";
import { configs } from "../configs/index.js";
import { handlers } from ".";

export interface StoryTarget {
  player: PlayerConfig;
  world: World;
  socket: Socket;
  io: Server;
  villager?: EntityName;
}

export const story = {
  context: (
    world: World,
    player: PlayerConfig,
    villager?: EntityName,
  ): StoryContext => {
    const carried = story.carried(player);

    return {
      facts: {
        [FactName.TIER]: world.economy.getTier(),
        [FactName.DAY]: world.getTime().days,
        [FactName.LAST_HAND_IN]:
          player.story.facts[FactName.LAST_HAND_IN] ?? 0,
        [FactName.VILLAGE]: world.story.village,
        [FactName.MEATLESS]: world.story.meatless,
      },
      mood: world.economy.getMood(villager),
      craving: !!villager && world.economy.craves(villager),
      leaning:
        !!villager && village.leaning(world.story.leanOf(villager)),
      flagged: (flag: StoryFlag) =>
        player.story.flags.includes(flag) || world.story.has(flag),
      carrying: (name: EntityName) =>
        carried.some((item) => item.name === name || item.soul === name),
      followed: (name: EntityName) => !!story.follower(world, player, name),
      errand: story.errand.state(player),
      stock: (name: EntityName) => world.items.get(name),
      present: (name: EntityName) => story.present(world, name),
      bond: (name: EntityName) => player.story.bond[name] ?? 0,
      since: (flag: StoryFlag) => {
        const day = player.story.days[flag];
        return day === undefined ? undefined : world.getTime().days - day;
      },
    };
  },

  world: (world: World): StoryContext => ({
    facts: {
      [FactName.TIER]: world.economy.getTier(),
      [FactName.DAY]: world.getTime().days,
      [FactName.LAST_HAND_IN]: 0,
      [FactName.VILLAGE]: world.story.village,
      [FactName.MEATLESS]: world.story.meatless,
    },
    mood: world.economy.getMood(),
    flagged: (flag: StoryFlag) => world.story.has(flag),
    carrying: () => false,
    followed: () => false,
    errand: ErrandState.NONE,
    bond: () => 0,
    since: () => undefined,
    craving: false,
    leaning: false,
    stock: (name: EntityName) => world.items.get(name),
    present: (name: EntityName) => story.present(world, name),
  }),

  follower: (
    world: World,
    player: PlayerConfig,
    name: EntityName,
  ): EntityConfig | undefined =>
    world.entities
      .getByMap(player.map)
      .find(
        (entity) => entity.name === name && entity.tame?.follows === player.id,
      ),

  present: (world: World, name: EntityName): number =>
    world.entities.all.filter(
      (entity) =>
        entity.name === name &&
        entity.map === MapName.VILLAGE &&
        !entity.away &&
        !entity.tame?.isTamed,
    ).length,

  carried: (player: PlayerConfig): Item[] => [
    ...player.inventory.filter((item): item is Item => !!item),
    ...player.hotbar.flatMap((slot) =>
      slot?.type === SlotType.ENTITY ? [slot.item] : [],
    ),
    ...player.robe.filter((item): item is Item => !!item),
  ],

  bond: (
    player: PlayerConfig,
    villager: EntityName,
    amount: number,
    world: World,
  ) => {
    const max = Math.min(BOND_MAX, player.story.caps[villager] ?? BOND_MAX);
    const current = player.story.bond[villager] ?? 0;
    const next = Math.max(0, Math.min(max, current + amount));

    player.story.bond[villager] = next;
    if (next >= BOND_FRIEND) world.story.befriend(villager);
  },

  talk: (player: PlayerConfig, villager: EntityName, world: World) => {
    const today = world.getTime().days;
    if (player.story.talked[villager] === today) return;

    player.story.talked[villager] = today;
    story.bond(player, villager, 1, world);
  },

  take: (
    player: PlayerConfig,
    name: EntityName,
    quantity: number,
    socket: Socket,
  ) => {
    const held = player.inventory
      .filter((item): item is Item => item?.name === name && !item.soul)
      .reduce((sum, item) => sum + item.quantity, 0);
    const fromInventory = Math.min(held, quantity);
    let remaining = quantity - fromInventory;

    player.inventory = handlers.storage.remove(player.inventory, {
      name,
      quantity: fromInventory,
      stackable: true,
    });

    player.hotbar = player.hotbar.map((slot) => {
      if (remaining <= 0 || slot?.type !== SlotType.ENTITY) return slot;
      if (slot.item.name !== name || slot.item.soul) return slot;

      const taken = Math.min(slot.item.quantity, remaining);
      remaining -= taken;

      return slot.item.quantity === taken
        ? null
        : { ...slot, item: { ...slot.item, quantity: slot.item.quantity - taken } };
    });

    socket.emit(Event.INVENTORY_SYNC, player.inventory);
    socket.emit(Event.HOTBAR_SYNC, player.hotbar);
  },

  errand: {
    of: (player: PlayerConfig): ErrandConfig | undefined =>
      configs.errands.find((errand) => errand.id === player.story.errand?.id),

    held: (player: PlayerConfig, name: EntityName): number =>
      story
        .carried(player)
        .filter((item) => item.name === name && !item.soul)
        .reduce((sum, item) => sum + item.quantity, 0),

    state: (player: PlayerConfig): ErrandState => {
      const errand = story.errand.of(player);
      if (!errand) return ErrandState.NONE;

      return story.errand.held(player, errand.item) >= errand.amount
        ? ErrandState.READY
        : ErrandState.ACTIVE;
    },

    fill: (text: string, player: PlayerConfig): string => {
      const id = player.story.errand?.id ?? player.story.lastErrand;
      const errand = configs.errands.find((entry) => entry.id === id);
      if (!errand) return text;

      return errands.fill(
        text,
        errand,
        (name) => {
          const metadata = configs.entities[name]?.metadata;
          return metadata?.name ?? metadata?.displayName?.toLowerCase() ?? name;
        },
        player.story.lastReward,
      );
    },
  },

  remember: (player: PlayerConfig, flag: StoryFlag, world: World) => {
    if (!player.story.flags.includes(flag)) player.story.flags.push(flag);

    player.story.days[flag] = world.getTime().days;
  },

  apply: (effects: StoryEffect[], target: StoryTarget) => {
    const { player, world, socket, io, villager } = target;

    for (const effect of effects)
      switch (effect.name) {
        case StoryEffectName.FLAG_SET:
          if (effect.scope === StoryScope.WORLD) world.story.set(effect.flag);
          else story.remember(player, effect.flag, world);
          break;

        case StoryEffectName.FLAG_CLEAR:
          if (effect.scope === StoryScope.WORLD) world.story.clear(effect.flag);
          else
            player.story.flags = player.story.flags.filter(
              (flag) => flag !== effect.flag,
            );
          break;

        case StoryEffectName.BOND_ADD:
          if (villager) story.bond(player, villager, effect.amount, world);
          break;

        case StoryEffectName.BOND_CAP:
          if (villager) {
            player.story.caps[villager] = effect.max;
            story.bond(player, villager, 0, world);
          }
          break;

        case StoryEffectName.ITEM_TAKE:
          story.take(player, effect.item, effect.quantity, socket);
          break;

        case StoryEffectName.ITEM_TAKE_ANY: {
          const item = effect.items.find((name) =>
            story.carried(player).some((carried) => carried.name === name),
          );
          if (item) story.take(player, item, 1, socket);
          break;
        }

        case StoryEffectName.ANIMAL_SETTLE: {
          const animal = story.follower(world, player, effect.animal);
          if (animal) handlers.taming.settle(animal, io, world);
          break;
        }

        case StoryEffectName.ERRAND_START: {
          if (player.story.errand) break;

          const errand = errands.pick(
            configs.errands,
            world.economy.getTier(),
            player.story.lastErrand,
          );
          if (errand)
            player.story.errand = { id: errand.id, day: world.getTime().days };
          break;
        }

        case StoryEffectName.ERRAND_FINISH: {
          const errand = story.errand.of(player);
          if (!errand || story.errand.state(player) !== ErrandState.READY)
            break;

          story.take(player, errand.item, errand.amount, socket);

          const reward = errands.roll(
            configs.errandRewards,
            world.economy.getTier(),
          );
          if (reward) {
            player.story.lastReward = {
              item: reward.item,
              quantity: reward.quantity,
            };
            story.apply(
              [
                {
                  name: StoryEffectName.ITEM_GIVE,
                  item: reward.item,
                  quantity: reward.quantity,
                },
              ],
              target,
            );
          }
          player.story.lastErrand = errand.id;
          player.story.errand = undefined;
          break;
        }

        case StoryEffectName.ERRAND_DROP:
          player.story.lastErrand = player.story.errand?.id;
          player.story.errand = undefined;
          break;

        case StoryEffectName.ITEM_GIVE:
          handlers.item.give(
            player,
            [
              {
                name: effect.item,
                quantity: effect.quantity,
                stackable:
                  configs.entities[effect.item]?.metadata?.stackable ?? false,
              },
            ],
            socket,
            world,
          );
          break;
      }
  },
};
