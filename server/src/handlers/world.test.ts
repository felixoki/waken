import { after, describe, test } from "node:test";
import assert from "node:assert/strict";
import { handlers } from "./index";
import { World } from "../World";
import { EntityConfig, EntityName, MapName } from "../types";
import { save } from "../db/save";
import { load } from "../db/load";
import { redis } from "../db/redis";
import { pg } from "../db/postgres";

const entity = (id: string, map: MapName, name = EntityName.WOOD): EntityConfig =>
  ({ id, map, name, x: 0, y: 0 }) as EntityConfig;

describe("world persistence", () => {
  after(() => {
    redis.disconnect();
    void pg.end();
  });

  test("save leaves out entities on instanced maps", async () => {
    let saved: EntityConfig[] = [];
    save.world = (async (_: string, state: { entities: EntityConfig[] }) => {
      saved = state.entities;
    }) as typeof save.world;

    const world = {
      entities: {
        all: [entity("v", MapName.VILLAGE), entity("f", MapName.FOREST)],
      },
      players: { all: [], get: () => undefined },
      getTime: () => ({}),
      relics: { snapshot: () => [] },
      story: { snapshot: () => ({}) },
      economy: { state: () => ({}) },
    } as unknown as World;

    await handlers.world.save("w", world);

    assert.deepEqual(
      saved.map((e) => e.id),
      ["v"],
    );
  });

  test("restore drops entities on instanced maps from old saves", async () => {
    load.world = (async () => ({
      entities: [
        entity("v", MapName.VILLAGE),
        entity("f", MapName.FOREST),
        entity("d", MapName.DUNGEON),
      ],
    })) as unknown as typeof load.world;

    const added: string[] = [];
    const world = {
      entities: {
        add: (id: string) => added.push(id),
        spawners: { get: () => undefined },
      },
      chunks: { registerEntity: () => {} },
      dropped: { add: () => {} },
    } as unknown as World;

    await handlers.world.restore("w", world);

    assert.ok(added.includes("v"));
    assert.ok(!added.includes("f"));
    assert.ok(!added.includes("d"));
  });

  test("restore clears locks saved mid-use", async () => {
    load.world = (async () => ({
      entities: [
        {
          ...entity("chest", MapName.VILLAGE, EntityName.CHEST1),
          isLocked: true,
          lockedBy: "player1",
        },
        { ...entity("npc", MapName.VILLAGE, EntityName.STUDENT), isLocked: true },
      ],
    })) as unknown as typeof load.world;

    const added: EntityConfig[] = [];
    const world = {
      entities: {
        add: (_: string, e: EntityConfig) => added.push(e),
        spawners: { get: () => undefined },
      },
      chunks: { registerEntity: () => {} },
      dropped: { add: () => {} },
    } as unknown as World;

    await handlers.world.restore("w", world);

    for (const id of ["chest", "npc"]) {
      const restored = added.find((e) => e.id === id);
      assert.equal(restored?.isLocked, false);
      assert.equal(restored?.lockedBy, undefined);
    }
  });
});
