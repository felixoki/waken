import { after, describe, test } from "node:test";
import assert from "node:assert/strict";
import { Server, Socket } from "socket.io";
import { handlers } from "./index";
import { World } from "../World";
import {
  EntityConfig,
  EntityName,
  Event,
  Item,
  MapName,
  Notice,
  NoticeKind,
  PlayerConfig,
  Warning,
} from "../types";
import { INVENTORY_SIZE, MAX_STACK } from "../globals";
import { redis } from "../db/redis";
import { pg } from "../db/postgres";

const ID = "wood1";

const setup = (room: number, quantity: number) => {
  const notices: Notice[] = [];
  const picked: { id: string; taken: number; left: number }[] = [];
  const broadcasts: Event[] = [];
  const socket = {
    id: "socket1",
    emit: (event: Event, data: unknown) => {
      if (event === Event.NOTIFY) notices.push(data as Notice);
      if (event === Event.ENTITY_PICKED)
        picked.push(data as { id: string; taken: number; left: number });
    },
  } as unknown as Socket;

  const inventory: (Item | null)[] = Array.from(
    { length: INVENTORY_SIZE },
    () => ({ name: EntityName.SOULSTONE, quantity: 1, stackable: false }),
  );
  inventory[0] = {
    name: EntityName.WOOD,
    quantity: MAX_STACK - room,
    stackable: true,
  };

  const player = { id: "player1", inventory } as PlayerConfig;
  const entity = {
    id: ID,
    name: EntityName.WOOD,
    map: MapName.HOME,
    quantity,
  } as EntityConfig;
  const entities = new Map([[ID, entity]]);

  const world = {
    players: { getBySocketId: () => player },
    entities: {
      get: (id: string) => entities.get(id),
      remove: (id: string) => entities.delete(id),
    },
    relics: { has: () => false },
    chunks: {
      getChunkByEntity: () => null,
      getPartyByEntity: () => undefined,
      removeEntity: () => {},
    },
  } as unknown as World;

  const broadcast = handlers.broadcast.entity;
  handlers.broadcast.entity = (_io, _world, event) => {
    broadcasts.push(event);
  };

  handlers.entity.pickup(ID, socket, {} as Server, world);

  handlers.broadcast.entity = broadcast;

  return { notices, picked, broadcasts, player, entity, entities };
};

const full: Notice = { kind: NoticeKind.WARN, warning: Warning.INVENTORY_FULL };

describe("entity pickup", () => {
  after(() => {
    redis.disconnect();
    void pg.end();
  });

  test("takes the whole stack when it fits", () => {
    const { notices, picked, broadcasts, player, entities } = setup(5, 5);

    assert.deepEqual(picked, [{ id: ID, taken: 5, left: 0 }]);
    assert.equal(player.inventory[0]?.quantity, MAX_STACK);
    assert.equal(notices.length, 1);
    assert.equal(notices[0].kind, NoticeKind.ITEM);
    assert.equal(entities.has(ID), false);
    assert.deepEqual(broadcasts, [Event.ENTITY_PICKUP]);
  });

  test("takes what fits and leaves the rest", () => {
    const { notices, picked, broadcasts, player, entity, entities } = setup(
      3,
      5,
    );

    assert.deepEqual(picked, [{ id: ID, taken: 3, left: 2 }]);
    assert.equal(player.inventory[0]?.quantity, MAX_STACK);
    assert.deepEqual(notices, [
      {
        kind: NoticeKind.ITEM,
        name: EntityName.WOOD,
        quantity: 3,
        soul: undefined,
      },
      full,
    ]);
    assert.equal(entities.has(ID), true);
    assert.equal(entity.quantity, 2);
    assert.deepEqual(broadcasts, []);
  });

  test("warns and takes nothing when full", () => {
    const { notices, picked, broadcasts, player, entity, entities } = setup(
      0,
      5,
    );

    assert.deepEqual(picked, [{ id: ID, taken: 0, left: 5 }]);
    assert.equal(player.inventory[0]?.quantity, MAX_STACK);
    assert.deepEqual(notices, [full]);
    assert.equal(entities.has(ID), true);
    assert.equal(entity.quantity, 5);
    assert.deepEqual(broadcasts, []);
  });
});
