import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { tiers } from "./tiers";
import { improvements } from "./improvements";
import { ImprovementName } from "../types";
import { STORE_CAPACITY, STORE_CAPACITY_EXPANDED } from "../globals";

const capacityAt = (tier: number) =>
  improvements[ImprovementName.STORAGE].tier <= tier
    ? STORE_CAPACITY_EXPANDED
    : STORE_CAPACITY;

describe("store capacity", () => {
  for (const upgrade of tiers)
    test(`tier ${upgrade.tier} requirements fit the store at tier ${upgrade.tier - 1}`, () => {
      const capacity = capacityAt(upgrade.tier - 1);
      for (const req of upgrade.requirements)
        assert.ok(
          req.quantity <= capacity,
          `${req.item} ${req.quantity} > ${capacity}`,
        );
    });

  for (const [name, improvement] of Object.entries(improvements))
    test(`${name} cost fits the store at tier ${improvement.tier}`, () => {
      const capacity =
        name === ImprovementName.STORAGE
          ? STORE_CAPACITY
          : capacityAt(improvement.tier);
      for (const req of improvement.cost)
        assert.ok(
          req.quantity <= capacity,
          `${req.item} ${req.quantity} > ${capacity}`,
        );
    });
});
