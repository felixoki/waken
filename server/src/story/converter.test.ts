import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { converter } from "./converter";
import { DAY } from "../globals";
import { ConverterConfig, EntityName, Item } from "../types";

const mill: ConverterConfig = {
  inputs: [{ item: EntityName.WHEAT, quantity: 2 }],
  output: { item: EntityName.FLOUR, quantity: 1 },
  days: 1,
};

const forge: ConverterConfig = {
  inputs: [
    { item: EntityName.IRON_ORE, quantity: 2 },
    { item: EntityName.WOOD, quantity: 1 },
  ],
  output: { item: EntityName.IRON1, quantity: 1 },
  days: 1,
};

const item = (name: EntityName, quantity: number): Item => ({
  name,
  quantity,
  stackable: true,
});

const empty = (n: number) => new Array<Item | null>(n).fill(null);

describe("converter", () => {
  test("waits a full day", () => {
    assert.equal(converter.ready(0, DAY - 1, mill), false);
    assert.equal(converter.ready(0, DAY, mill), true);
  });

  test("the clock counts days", () => {
    assert.equal(converter.clock({ days: 2, current: 5, phase: "day" } as never), 2 * DAY + 5);
  });

  test("grinds as many batches as there is wheat, leaving the rest", () => {
    const slots = [item(EntityName.WHEAT, 5), ...empty(3)];
    const result = converter.convert(slots, mill);

    assert.equal(converter.count(result, EntityName.WHEAT), 1);
    assert.equal(converter.count(result, EntityName.FLOUR), 2);
  });

  test("the forge needs every input", () => {
    const slots = [item(EntityName.IRON_ORE, 6), item(EntityName.WOOD, 2), ...empty(2)];
    const result = converter.convert(slots, forge);

    assert.equal(converter.count(result, EntityName.IRON1), 2);
    assert.equal(converter.count(result, EntityName.IRON_ORE), 2);
    assert.equal(converter.count(result, EntityName.WOOD), 0);
  });

  test("nothing happens without a full batch", () => {
    const slots = [item(EntityName.WHEAT, 1), ...empty(3)];

    assert.deepEqual(converter.convert(slots, mill), slots);
  });

  test("counts only the recipe's inputs", () => {
    const slots = [item(EntityName.WHEAT, 4), item(EntityName.BREAD, 3), null];

    assert.equal(converter.amount(slots, mill), 4);
  });
});
