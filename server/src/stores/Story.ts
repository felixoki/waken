import { EntityName, StoryFlag, VillageState, WorldStory } from "../types";

export class StoryStore {
  private flags: Set<StoryFlag> = new Set();
  private lean: Map<EntityName, number> = new Map();
  private friends: Set<EntityName> = new Set();
  public village: VillageState = VillageState.WHOLE;
  public cultDays = 0;
  public meatless = 0;

  has(flag: StoryFlag): boolean {
    return this.flags.has(flag);
  }

  set(flag: StoryFlag): void {
    this.flags.add(flag);
  }

  clear(flag: StoryFlag): void {
    this.flags.delete(flag);
  }

  leanOf(villager: EntityName): number {
    return this.lean.get(villager) ?? 0;
  }

  setLean(villager: EntityName, value: number): void {
    if (value > 0) this.lean.set(villager, value);
    else this.lean.delete(villager);
  }

  befriend(villager: EntityName): void {
    this.friends.add(villager);
  }

  isFriend(villager: EntityName): boolean {
    return this.friends.has(villager);
  }

  snapshot(): WorldStory {
    return {
      flags: [...this.flags],
      lean: Object.fromEntries(this.lean),
      friends: [...this.friends],
      village: this.village,
      cultDays: this.cultDays,
      meatless: this.meatless,
    };
  }

  hydrate(story: WorldStory | StoryFlag[]): void {
    if (Array.isArray(story)) {
      this.flags = new Set(story);
      return;
    }

    this.flags = new Set(story.flags ?? []);
    this.lean = new Map(
      Object.entries(story.lean ?? {}) as [EntityName, number][],
    );
    this.friends = new Set(story.friends ?? []);
    this.village = story.village ?? VillageState.WHOLE;
    this.cultDays = story.cultDays ?? 0;
    this.meatless = story.meatless ?? 0;
  }
}
