import {
  ANCHOR,
  AWAY,
  EntityName,
  Schedule,
  ScheduleRule,
  SpotName,
  TimePhase,
} from "../types";

const night: ScheduleRule = { phases: [TimePhase.NIGHT], target: AWAY };

const rain: ScheduleRule = { when: { raining: true }, target: AWAY };

const closing: ScheduleRule = { from: [0.7, 0.9], target: AWAY };

const tavern = (spot: SpotName, chance: number): ScheduleRule => ({
  from: [0.5, 0.58],
  until: [0.68, 0.85],
  chance,
  target: spot,
});

const cult: Schedule = [{ when: { tier: 2 }, target: ANCHOR }, { target: AWAY }];

export const schedules: Partial<Record<EntityName, Schedule>> = {
  [EntityName.VISITOR1]: cult,
  [EntityName.VISITOR2]: cult,
  [EntityName.CULT_TENT]: cult,
  [EntityName.TANNER]: [tavern(SpotName.TAVERN_TARRO, 0.7), night],
  [EntityName.CITIZEN7]: [tavern(SpotName.TAVERN_ESKEN, 0.5), night],
  [EntityName.BOOKKEEPER]: [night],
  [EntityName.HELPER1]: [night],
  [EntityName.HELPER2]: [night],
  [EntityName.STUDENT]: [rain, night],
  [EntityName.FISHWIFE]: [night],
  [EntityName.CITIZEN1]: [tavern(SpotName.TAVERN_EMY, 0.3), night],
  [EntityName.CITIZEN2]: [tavern(SpotName.TAVERN_FAIRE, 0.3), night],
  [EntityName.CITIZEN3]: [tavern(SpotName.TAVERN_DUNEAS, 0.6), night],
  [EntityName.CITIZEN4]: [closing],
  [EntityName.CITIZEN5]: [closing],
  [EntityName.CITIZEN6]: [closing],
  [EntityName.CITIZEN8]: [closing],
  [EntityName.CITIZEN9]: [night],
  [EntityName.CITIZEN10]: [
    {
      phases: [TimePhase.DAY],
      when: {
        stock: { [EntityName.BREAD]: 1 },
        present: { [EntityName.DUCK]: 1 },
      },
      target: SpotName.LAKE_GLIMBLID,
    },
    tavern(SpotName.TAVERN_GLIMBLID, 0.3),
    night,
  ],
  [EntityName.CITIZEN11]: [night],
  [EntityName.CITIZEN12]: [night],
  [EntityName.CITIZEN13]: [tavern(SpotName.TAVERN_TELLIS, 0.4), night],
};
