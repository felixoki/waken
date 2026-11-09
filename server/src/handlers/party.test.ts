import { after, describe, test } from "node:test";
import assert from "node:assert/strict";
import { Server, Socket } from "socket.io";
import { handlers } from "./index";
import { World } from "../World";
import {
  EntityName,
  Event,
  Item,
  MapName,
  Party,
  PartyStatus,
  PlayerConfig,
  Wipe,
} from "../types";
import { redis } from "../db/redis";
import { pg } from "../db/postgres";

const wood: Item = { name: EntityName.WOOD, quantity: 7, stackable: true };
const nightcap: Item = {
  name: EntityName.NIGHTCAP,
  quantity: 1,
  stackable: false,
};

const setup = (inventory: (Item | null)[]) => {
  const wipes: Wipe[] = [];
  const transfers: Partial<PlayerConfig>[] = [];

  const socket = {
    id: "socket1",
    emit: (event: Event, data: unknown) => {
      if (event === Event.PARTY_WIPE) wipes.push(data as Wipe);
    },
  } as unknown as Socket;

  const player = {
    id: "player1",
    socketId: socket.id,
    map: MapName.FOREST,
    isDead: true,
    inventory,
  } as PlayerConfig;

  const data: Party = {
    id: "party1",
    leader: player.id,
    members: [player.id],
    ready: [],
    status: PartyStatus.LOBBY,
    depth: 0,
    unlocked: 0,
  };

  const world = {
    parties: { get: () => data },
    players: { get: () => player },
    relics: { forfeit: () => {} },
  } as unknown as World;

  const io = {
    sockets: { sockets: new Map([[socket.id, socket]]) },
  } as unknown as Server;

  const { landing, clear } = handlers.sleep;
  const { transfer } = handlers.player;
  handlers.sleep.landing = () => ({ map: MapName.VILLAGE, x: 0, y: 0 });
  handlers.sleep.clear = () => {};
  handlers.player.transfer = (...args) => {
    transfers.push(args[7] ?? {});
  };

  handlers.party.wipe(data.id, io, world);

  handlers.sleep.landing = landing;
  handlers.sleep.clear = clear;
  handlers.player.transfer = transfer;

  return { wipes, transfers };
};

after(async () => {
  redis.disconnect();
  await pg.end();
});

describe("party.wipe", () => {
  test("sends what was lost", () => {
    const { wipes, transfers } = setup([wood, null, wood]);

    assert.deepEqual(wipes, [{ kept: false, lost: [wood, wood] }]);
    assert.deepEqual(transfers[0].inventory, [null, null, null]);
  });

  test("sends nothing lost when a keep item is carried", () => {
    const inventory = [wood, nightcap, null];
    const { wipes, transfers } = setup(inventory);

    assert.deepEqual(wipes, [{ kept: true, lost: [] }]);
    assert.deepEqual(transfers[0].inventory, inventory);
  });
});
