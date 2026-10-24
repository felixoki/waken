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

const cult: Schedule = [{ when: { tier: 2 }, target: ANCHOR }, { target: AWAY }];

export const schedules: Partial<Record<EntityName, Schedule>> = {
  [EntityName.VISITOR1]: cult,
  [EntityName.VISITOR2]: cult,
  [EntityName.CULT_TENT]: cult,
  [EntityName.TANNER]: [
    { phases: [TimePhase.DUSK], target: SpotName.TAVERN_TARRO },
    night,
  ],
  [EntityName.CITIZEN7]: [
    { phases: [TimePhase.DUSK], target: SpotName.TAVERN_ESKEN },
    night,
  ],
  [EntityName.BOOKKEEPER]: [night],
  [EntityName.HELPER1]: [night],
  [EntityName.HELPER2]: [night],
  [EntityName.STUDENT]: [night],
  [EntityName.FISHWIFE]: [night],
  [EntityName.CITIZEN1]: [night],
  [EntityName.CITIZEN2]: [night],
  [EntityName.CITIZEN3]: [night],
  [EntityName.CITIZEN4]: [night],
  [EntityName.CITIZEN5]: [night],
  [EntityName.CITIZEN6]: [night],
  [EntityName.CITIZEN8]: [night],
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
    night,
  ],
  [EntityName.CITIZEN11]: [night],
  [EntityName.CITIZEN12]: [night],
  [EntityName.CITIZEN13]: [night],
};
