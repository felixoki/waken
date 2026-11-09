import { after, describe, test } from "node:test";
import assert from "node:assert/strict";
import { Server, Socket } from "socket.io";
import { handlers } from "./index";
import { World } from "../World";
import { Event, MapName, PlayerConfig, Transition } from "../types";
import { SublevelStore } from "../stores/Sublevel";
import { AuthorityManager } from "../managers/Authority";
import { redis } from "../db/redis";
import { pg } from "../db/postgres";

after(async () => {
  redis.disconnect();
  await pg.end();
});

describe("sublevel.enter", () => {
  test("a failed generation denies the transition and leaves the entrance retryable", async () => {
    const events: Event[] = [];

    const socket = {
      id: "socket1",
      emit: (event: Event) => {
        events.push(event);
      },
    } as unknown as Socket;

    const player = {
      id: "player1",
      socketId: socket.id,
      map: MapName.FOREST,
    } as PlayerConfig;

    const sublevels = new SublevelStore();

    const world = {
      players: { getBySocketId: () => player },
      entities: { get: () => undefined },
      sublevels,
    } as unknown as World;

    const transition = {
      from: "entrance1",
      to: MapName.CAVE,
    } as Transition;

    let calls = 0;
    const { start } = handlers.generation;
    handlers.generation.start = () => {
      calls++;
      return Promise.reject(new Error("Worker exited with code 1"));
    };

    const { error } = console;
    console.error = () => {};

    await handlers.sublevel.enter(transition, {} as Server, socket, world);
    await handlers.sublevel.enter(transition, {} as Server, socket, world);

    console.error = error;
    handlers.generation.start = start;

    assert.equal(calls, 2);
    assert.equal(sublevels.getInstance("entrance1"), undefined);
    assert.deepEqual(events, [
      Event.SUBLEVEL_START_LOADING,
      Event.PLAYER_TRANSITION_DENIED,
      Event.SUBLEVEL_START_LOADING,
      Event.PLAYER_TRANSITION_DENIED,
    ]);
  });
});

const ENTRANCE = "cave1";

const setup = (ids: string[]) => {
  const players = new Map<string, PlayerConfig>(
    ids.map((id) => [
      id,
      { id, socketId: `socket_${id}`, map: MapName.CAVE } as PlayerConfig,
    ]),
  );

  const world = {
    sublevels: new SublevelStore(),
    authority: new AuthorityManager(),
    players: {
      get: (id: string) => players.get(id),
      update: (id: string, data: Partial<PlayerConfig>) => {
        const player = players.get(id);
        if (player) players.set(id, { ...player, ...data });
      },
    },
  } as unknown as World;

  world.sublevels.setInstance(ENTRANCE, Promise.resolve(null), MapName.CAVE);

  for (const id of ids) {
    world.sublevels.join(ENTRANCE, id);
    world.sublevels.setReturn(id, {
      entranceId: ENTRANCE,
      map: MapName.FOREST,
      x: 10,
      y: 20,
    });
  }

  world.authority.set(MapName.CAVE, ids[0], ENTRANCE);

  const io = { sockets: { sockets: new Map() } } as unknown as Server;
  const socket = { id: `socket_${ids[0]}` } as unknown as Socket;

  return { world, io, socket, player: players.get(ids[0])! };
};

describe("sublevel.leave", () => {
  test("hands authority to the player still inside", () => {
    const { world, io, socket, player } = setup(["a", "b"]);

    handlers.sublevel.leave(io, socket, world, player);

    assert.deepEqual(world.sublevels.occupants(ENTRANCE), ["b"]);
    assert.equal(world.authority.get(MapName.CAVE, ENTRANCE), "b");
    assert.equal(world.sublevels.entranceOf("a"), undefined);
  });

  test("lets the next player in take authority after the last one leaves", () => {
    const { world, io, socket, player } = setup(["a"]);

    const session = handlers.sublevel.leave(io, socket, world, player);

    assert.equal(session?.map, MapName.FOREST);
    assert.equal(world.authority.get(MapName.CAVE, ENTRANCE), undefined);
    assert.ok(world.sublevels.getInstance(ENTRANCE));
    assert.equal(world.sublevels.join(ENTRANCE, "a"), 1);
  });
});
