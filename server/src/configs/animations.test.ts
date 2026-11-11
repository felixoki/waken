import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { animations } from "./animations";
import { StateName } from "../types";

describe("slashing animations", () => {
  for (const [entity, states] of Object.entries(animations)) {
    const slashing = states?.[StateName.SLASHING];
    if (!slashing) continue;

    test(`${entity} lands its hit inside the animation`, () => {
      assert.ok(slashing.impact !== undefined, "impact frame is set");
      assert.ok(slashing.impact >= 0);
      assert.ok(slashing.impact + 2 <= slashing.frameCount);
    });
  }
});
