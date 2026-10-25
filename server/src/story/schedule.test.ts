import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { timetable } from "./schedule";
import { schedules } from "../configs/schedules";
import {
  ANCHOR,
  AWAY,
  Clock,
  Condition,
  EntityName,
  Schedule,
  SpotName,
  TimePhase,
} from "../types";

const at = (phase: TimePhase, progress: number, day = 0): Clock => ({
  phase,
  progress,
  day,
});

const DAY = at(TimePhase.DAY, 0.3);
const DUSK = at(TimePhase.DUSK, 0.55);
const NIGHT = at(TimePhase.NIGHT, 0.95);

describe("place", () => {
  const rules: Schedule = [
    { phases: [TimePhase.DUSK], target: SpotName.TAVERN_TARRO },
    { phases: [TimePhase.NIGHT], target: AWAY },
  ];

  test("no matching rule means the anchor", () => {
    assert.deepEqual(timetable.place(undefined, NIGHT, "a", false), {
      anchor: true,
    });
    assert.deepEqual(timetable.place(rules, DAY, "a", false), {
      anchor: true,
    });
  });

  test("a spot is a spot", () => {
    assert.deepEqual(timetable.place(rules, DUSK, "a", false), {
      spot: SpotName.TAVERN_TARRO,
    });
  });

  test("away at night, unless sleepless", () => {
    assert.deepEqual(timetable.place(rules, NIGHT, "a", false), {
      away: true,
    });
    assert.deepEqual(timetable.place(rules, NIGHT, "a", true), {
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

    assert.deepEqual(timetable.place(fromTierTwo, DAY, "a", false, tier(1)), {
      away: true,
    });
    assert.deepEqual(timetable.place(fromTierTwo, DAY, "a", false, tier(2)), {
      anchor: true,
    });
  });
});

describe("windows and chance", () => {
  test("a window holds between from and until", () => {
    const rules: Schedule = [
      { from: 0.5, until: 0.7, target: SpotName.TAVERN_TARRO },
    ];

    assert.deepEqual(
      timetable.place(rules, at(TimePhase.DAY, 0.4), "a", false),
      {
        anchor: true,
      },
    );
    assert.deepEqual(
      timetable.place(rules, at(TimePhase.NIGHT, 0.65), "a", false),
      {
        spot: SpotName.TAVERN_TARRO,
      },
    );
    assert.deepEqual(
      timetable.place(rules, at(TimePhase.NIGHT, 0.7), "a", false),
      {
        anchor: true,
      },
    );
  });

  test("a ranged moment stays within its range", () => {
    for (let day = 0; day < 50; day++) {
      const value = timetable.moment([0.6, 0.8], "a", day, "x");
      assert.ok(value >= 0.6 && value < 0.8);
    }
  });

  test("the nightly roll is the same all night and differs between nights", () => {
    const rolls = new Set<number>();
    for (let day = 0; day < 20; day++) {
      const roll = timetable.roll("a", day, "chance");
      assert.equal(roll, timetable.roll("a", day, "chance"));
      rolls.add(roll);
    }
    assert.ok(rolls.size > 15);
  });

  test("chance decides how many nights a villager comes", () => {
    const rules: Schedule = [
      { from: 0.5, until: 0.9, chance: 0.5, target: SpotName.TAVERN_TARRO },
    ];
    let nights = 0;
    for (let day = 0; day < 400; day++)
      if (
        "spot" in
        timetable.place(rules, at(TimePhase.NIGHT, 0.6, day), "a", false)
      )
        nights++;

    assert.ok(nights > 140 && nights < 260);
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

  test("the band plays into the night and goes home late", () => {
    for (const name of [EntityName.CITIZEN4, EntityName.CITIZEN8]) {
      assert.deepEqual(
        timetable.place(
          schedules[name],
          at(TimePhase.NIGHT, 0.65),
          name,
          false,
        ),
        { anchor: true },
      );
      assert.deepEqual(
        timetable.place(
          schedules[name],
          at(TimePhase.NIGHT, 0.95),
          name,
          false,
        ),
        { away: true },
      );
    }
  });

  test("tavern guests are home by the end of the night", () => {
    for (const name of [EntityName.TANNER, EntityName.CITIZEN3])
      for (let day = 0; day < 30; day++)
        assert.deepEqual(
          timetable.place(
            schedules[name],
            at(TimePhase.NIGHT, 0.95, day),
            name,
            false,
          ),
          { away: true },
        );
  });
});
