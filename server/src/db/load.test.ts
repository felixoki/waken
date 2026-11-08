import { after, beforeEach, describe, test } from "node:test";
import assert from "node:assert/strict";
import { load } from "./load";
import { pg } from "./postgres";
import { redis } from "./redis";

type Query = typeof pg.query;
type Get = typeof redis.get;

const stub = (rows: unknown[] | Error) => {
  pg.query = (async () => {
    if (rows instanceof Error) throw rows;
    return { rows };
  }) as unknown as Query;
};

describe("load", () => {
  beforeEach(() => {
    redis.get = (async () => null) as unknown as Get;
    redis.setex = (async () => "OK") as unknown as typeof redis.setex;
  });

  after(() => {
    redis.disconnect();
  });

  test("world throws when postgres fails", async () => {
    stub(new Error("connection refused"));
    await assert.rejects(load.world("w"), /connection refused/);
  });

  test("world is null when there is no save", async () => {
    stub([]);
    assert.equal(await load.world("w"), null);
  });

  test("player throws when postgres fails", async () => {
    stub(new Error("connection refused"));
    await assert.rejects(load.player("w", "p"), /connection refused/);
  });

  test("player is null when there is no save", async () => {
    stub([]);
    assert.equal(await load.player("w", "p"), null);
  });
});
