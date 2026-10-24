import { World } from "../World";
import { EntityName, Mood, NeedName, StoryFlag } from "../types";
import { configs } from "../configs/index.js";
import { village as rules } from "../story/village.js";
import { CULT_KNOWN_DAYS, CULT_MAX } from "../globals.js";

const IMMUNE = new Set<EntityName>([EntityName.CITIZEN12, EntityName.CITIZEN11]);

export const village = {
  villagers: (world: World): EntityName[] => [
    ...new Set(
      world.entities.all
        .map((entity) => entity.name)
        .filter(
          (name) => !!configs.entities[name]?.dialogue && !IMMUNE.has(name),
        ),
    ),
  ],

  cult: (world: World): number =>
    Math.min(
      CULT_MAX,
      village
        .villagers(world)
        .filter((name) => rules.leaning(world.story.leanOf(name))).length,
    ),

  day: (world: World) => {
    const food = configs.needs.find((need) => need.name === NeedName.FOOD);
    const fed = !!food && world.economy.isMet(food);

    world.story.meatless =
      fed && !world.economy.meatEaten ? world.story.meatless + 1 : 0;
    world.economy.meatEaten = false;

    if (world.economy.getTier() < 2) return;

    world.story.cultDays++;
    if (world.story.cultDays >= CULT_KNOWN_DAYS)
      world.story.set(StoryFlag.ED_TAR_KNOWN);

    const villagers = village.villagers(world);
    let leaning = 0;

    for (const name of villagers) {
      const lean = rules.next(
        world.story.leanOf(name),
        world.economy.getMood(name) === Mood.HAPPY,
        world.story.isFriend(name),
      );

      world.story.setLean(name, lean);
      if (rules.leaning(lean)) leaning++;
    }

    world.story.village = rules.state(leaning, villagers.length);
  },
};
