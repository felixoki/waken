import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { timetable } from "./schedule";
import { schedules } from "../configs/schedules";
import {
  ANCHOR,
  AWAY,
  Condition,
  EntityName,
  Schedule,
  SpotName,
  TimePhase,
} from "../types";

describe("place", () => {
  const rules: Schedule = [
    { phases: [TimePhase.DUSK], target: SpotName.TAVERN_TARRO },
    { phases: [TimePhase.NIGHT], target: AWAY },
  ];

  test("no matching rule means the anchor", () => {
    assert.deepEqual(timetable.place(undefined, TimePhase.NIGHT, false), {
      anchor: true,
    });
    assert.deepEqual(timetable.place(rules, TimePhase.DAY, false), {
      anchor: true,
    });
  });

  test("a spot is a spot", () => {
    assert.deepEqual(timetable.place(rules, TimePhase.DUSK, false), {
      spot: SpotName.TAVERN_TARRO,
    });
  });

  test("away at night, unless sleepless", () => {
    assert.deepEqual(timetable.place(rules, TimePhase.NIGHT, false), {
      away: true,
    });
    assert.deepEqual(timetable.place(rules, TimePhase.NIGHT, true), {
      anchor: true,
    });
  });

  test("the first matching rule wins, and conditions are checked", () => {
    const fromTierTwo: Schedule = [
      { when: { tier: 2 }, target: ANCHOR },
      { target: AWAY },
    ];
    const tier = (level: number) => (when: Condition | undefined) =>
      !when?.tier || level >= when.tier;

    assert.deepEqual(
      timetable.place(fromTierTwo, TimePhase.DAY, false, tier(1)),
      { away: true },
    );
    assert.deepEqual(
      timetable.place(fromTierTwo, TimePhase.DAY, false, tier(2)),
      { anchor: true },
    );
  });
});

describe("schedules", () => {
  test("crafters, the host and the campers have none", () => {
    for (const name of [
      EntityName.BLACKSMITH,
      EntityName.BAKER,
      EntityName.HOST,
      EntityName.CITIZEN14,
      EntityName.CITIZEN15,
      EntityName.CITIZEN16,
    ])
      assert.equal(schedules[name], undefined);
  });

  test("the band goes home at night", () => {
    for (const name of [EntityName.CITIZEN4, EntityName.CITIZEN8])
      assert.deepEqual(
        timetable.place(schedules[name], TimePhase.NIGHT, false),
        { away: true },
      );
  });
});
