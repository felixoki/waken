import { after, describe, test } from "node:test";
import assert from "node:assert/strict";
import { Server, Socket } from "socket.io";
import { handlers } from "./index";
import { World } from "../World";
import { Event, MapName, PlayerConfig, Transition } from "../types";
import { SublevelStore } from "../stores/Sublevel";
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
