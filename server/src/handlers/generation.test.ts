import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { generation } from "./generation";
import { TerrainName, WaterSound } from "../types/generation";
import type { WaterResult } from "../biomes/generators/Water";

describe("water sounds", () => {
  test("rivers and lakes are marked, creeks and marsh stay silent", () => {
    const W = TerrainName.WATER;
    const G = TerrainName.GROUND;
    const grid = [W, W, W, W, W, G];
    const owner = new Int16Array([-1, 0, 2, 3, 4, 0]);
    const water = {
      bodies: [
        { kind: "lake", cells: [1, 2] },
        { kind: "creek", cells: [3] },
        { kind: "marsh", cells: [4] },
      ],
      owner,
    } as unknown as WaterResult;

    const bytes = Buffer.from(generation.waters(grid, water), "base64");

    assert.deepEqual(
      [...bytes],
      [WaterSound.RIVER, WaterSound.LAKE, WaterSound.LAKE, 0, 0, 0],
    );
  });
});
