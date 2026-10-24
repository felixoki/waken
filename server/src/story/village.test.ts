import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { village } from "./village";
import { LEAN_MAX, LEAN_TAKEN } from "../globals";
import { VillageState } from "../types";

describe("leaning", () => {
  test("an unhappy day pushes a villager towards the cult", () => {
    assert.equal(village.next(0, false, false), 1);
  });

  test("a content day pulls them back, never below zero", () => {
    assert.equal(village.next(2, true, false), 1);
    assert.equal(village.next(0, true, false), 0);
  });

  test("a friend never leans", () => {
    assert.equal(village.next(LEAN_TAKEN, false, true), 0);
  });

  test("lean is capped, so the way back stays short", () => {
    assert.equal(village.next(LEAN_MAX, false, false), LEAN_MAX);
  });

  test(`a villager leans after ${LEAN_TAKEN} unhappy days`, () => {
    assert.equal(village.leaning(LEAN_TAKEN - 1), false);
    assert.equal(village.leaning(LEAN_TAKEN), true);
  });
});

describe("village state", () => {
  test("whole, strained up to a third, split beyond", () => {
    assert.equal(village.state(0, 12), VillageState.WHOLE);
    assert.equal(village.state(4, 12), VillageState.STRAINED);
    assert.equal(village.state(5, 12), VillageState.SPLIT);
  });
});
