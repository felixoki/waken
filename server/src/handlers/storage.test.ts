import { after, describe, test } from "node:test";
import assert from "node:assert/strict";
import { Socket } from "socket.io";
import { handlers } from "./index";
import { World } from "../World";
import {
  EntityConfig,
  EntityName,
  Item,
  PlayerConfig,
  SlotType,
  SlotZone,
} from "../types";
import { MAX_STACK } from "../globals";
import { redis } from "../db/redis";
import { pg } from "../db/postgres";

const wood = (quantity: number): Item => ({
  name: EntityName.WOOD,
  quantity,
  stackable: true,
});

const stone = (quantity: number): Item => ({
  name: EntityName.SOULSTONE,
  quantity,
  stackable: false,
});

const setup = (inventory: (Item | null)[], storing?: (Item | null)[]) => {
  const player = { id: "p", inventory } as PlayerConfig;
  const chest = { id: "c", lockedBy: "p", storing } as EntityConfig;
  const world = {
    players: { getBySocketId: () => player },
    entities: { get: () => chest },
  } as unknown as World;
  const socket = { id: "s", emit: () => true, to: () => socket } as unknown as Socket;

  return { player, chest, world, socket };
};

const move = (
  from: number,
  to: number,
  quantity: number | undefined,
  ctx: ReturnType<typeof setup>,
) =>
  handlers.storage.move(
    {
      source: { zone: SlotZone.INVENTORY, index: from },
      target: { zone: SlotZone.INVENTORY, index: to },
      type: SlotType.ENTITY,
      quantity,
    },
    ctx.socket,
    ctx.world,
  );

describe("storage split", () => {
  after(() => {
    redis.disconnect();
    void pg.end();
  });

  test("splits onto an empty slot", () => {
    const ctx = setup([wood(10), null]);
    move(0, 1, 4, ctx);

    assert.equal(ctx.player.inventory[0]?.quantity, 6);
    assert.equal(ctx.player.inventory[1]?.quantity, 4);
  });

  test("merges only what fits", () => {
    const ctx = setup([wood(10), wood(MAX_STACK - 2)]);
    move(0, 1, 5, ctx);

    assert.equal(ctx.player.inventory[0]?.quantity, 8);
    assert.equal(ctx.player.inventory[1]?.quantity, MAX_STACK);
  });

  test("does nothing onto a different item", () => {
    const ctx = setup([wood(10), stone(1)]);
    move(0, 1, 5, ctx);

    assert.equal(ctx.player.inventory[0]?.quantity, 10);
    assert.equal(ctx.player.inventory[1]?.name, EntityName.SOULSTONE);
  });

  test("without a quantity moves the whole stack", () => {
    const ctx = setup([wood(10), null]);
    move(0, 1, undefined, ctx);

    assert.equal(ctx.player.inventory[0], null);
    assert.equal(ctx.player.inventory[1]?.quantity, 10);
  });

  test("take all fills stacks first and leaves what doesn't fit", () => {
    const ctx = setup(
      [wood(MAX_STACK - 5), stone(1), null],
      [wood(20), stone(1), stone(1)],
    );
    handlers.storage.takeAll({ entityId: "c" }, ctx.socket, ctx.world);

    assert.deepEqual(
      ctx.player.inventory.map((s) => s?.quantity ?? 0),
      [MAX_STACK, 1, 15],
    );
    assert.deepEqual(ctx.chest.storing, [null, stone(1), stone(1)]);
  });

  test("take all needs the chest to be open by the player", () => {
    const ctx = setup([null], [wood(5)]);
    ctx.chest.lockedBy = "other";
    handlers.storage.takeAll({ entityId: "c" }, ctx.socket, ctx.world);

    assert.deepEqual(ctx.player.inventory, [null]);
  });
});
