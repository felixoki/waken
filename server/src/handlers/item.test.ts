import { after, describe, test } from "node:test";
import assert from "node:assert/strict";
import { Server, Socket } from "socket.io";
import { handlers } from "./index";
import { World } from "../World";
import {
  EntityName,
  Event,
  EntityConfig,
  Item,
  LooseKind,
  MapName,
  Notice,
  NoticeKind,
  PlayerConfig,
} from "../types";
import { INVENTORY_SIZE } from "../globals";
import { configs } from "../configs";
import { redis } from "../db/redis";
import { pg } from "../db/postgres";

const capture = () => {
  const notices: Notice[] = [];
  const socket = {
    emit: (event: Event, data: unknown) => {
      if (event === Event.NOTIFY) notices.push(data as Notice);
    },
  } as unknown as Socket;

  return { notices, socket };
};

const filled = (free: number): (Item | null)[] =>
  Array.from({ length: INVENTORY_SIZE }, (_, i) =>
    i < INVENTORY_SIZE - free
      ? { name: EntityName.SOULSTONE, quantity: 1, stackable: false }
      : null,
  );

describe("item notices", () => {
  after(() => {
    redis.disconnect();
    void pg.end();
  });

  test("give notices only the amount that fit", () => {
    const { notices, socket } = capture();
    const player = { inventory: filled(1) } as PlayerConfig;
    const spill = handlers.item.spill;
    handlers.item.spill = () => {};

    handlers.item.give(
      player,
      [{ name: EntityName.SOULSTONE, quantity: 3, stackable: false }],
      socket,
      {} as World,
      EntityName.CITIZEN11,
    );

    handlers.item.spill = spill;

    assert.deepEqual(notices, [
      {
        kind: NoticeKind.ITEM,
        name: EntityName.SOULSTONE,
        quantity: 1,
        soul: undefined,
        from: EntityName.CITIZEN11,
      },
    ]);
  });

  test("give notices nothing when nothing fit", () => {
    const { notices, socket } = capture();
    const player = { inventory: filled(0) } as PlayerConfig;
    const spill = handlers.item.spill;
    handlers.item.spill = () => {};

    handlers.item.give(
      player,
      [{ name: EntityName.SOULSTONE, quantity: 1, stackable: false }],
      socket,
      {} as World,
    );

    handlers.item.spill = spill;

    assert.deepEqual(notices, []);
  });

  test("deposit notices the ledger total", () => {
    const { notices, socket } = capture();
    const name = EntityName.WOOD;
    assert.ok(configs.collectables.has(name));
    const player = {
      inventory: [{ name, quantity: 4, stackable: true }, null],
    } as PlayerConfig;
    const world = {
      economy: { room: () => 3 },
      items: { add: () => {} },
    } as unknown as World;
    const { economy, store } = handlers.broadcast;
    handlers.broadcast.economy = () => {};
    handlers.broadcast.store = () => {};

    const total = handlers.item.deposit(player, [0], socket, {} as Server, world);

    handlers.broadcast.economy = economy;
    handlers.broadcast.store = store;

    assert.equal(total, 3);
    assert.deepEqual(notices, [{ kind: NoticeKind.LEDGER, total: 3 }]);
  });

  test("spill marks the item as a loose drop", () => {
    const created: Omit<EntityConfig, "id" | "createdAt">[] = [];
    const create = handlers.entity.create;
    handlers.entity.create = (config) => {
      created.push(config);
      return { ...config, id: "0-0-0-0-drop1", createdAt: 0 };
    };

    const world = {
      parties: { getByPlayerId: () => undefined },
      dropped: new Set<string>(),
    } as unknown as World;

    handlers.item.spill(
      { id: "player1", map: MapName.HOME, x: 0, y: 0 } as PlayerConfig,
      { name: EntityName.WOOD, quantity: 2, stackable: true },
      {} as Socket,
      world,
    );

    handlers.entity.create = create;

    assert.equal(created.length, 1);
    assert.equal(created[0].loose, LooseKind.DROP);
    assert.ok(world.dropped.has("0-0-0-0-drop1"));
  });
});
