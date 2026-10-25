import { configs } from "../configs";
import {
  DAY,
  ECONOMY_GROWTH,
  MEATS,
  STORE_CAPACITY,
  STORE_CAPACITY_EXPANDED,
} from "../globals";
import { ItemsStore } from "../stores/Items";
import {
  EconomySnapshot,
  EconomyState,
  EntityName,
  GroupName,
  ImprovementName,
  Mood,
  NeedConfig,
  NeedGroup,
  NeedItem,
  NeedName,
  TimePhase,
} from "../types";

export class EconomyManager {
  private needs: Map<NeedName, NeedConfig> = new Map();
  private tier: number = 1;
  private improvements: Set<ImprovementName> = new Set();
  private accumulator: number = 0;
  public dirty: boolean = false;
  public meatEaten: boolean = false;

  constructor(private supply: ItemsStore) {
    this._init();
  }

  private _init() {
    configs.needs.forEach((config) => {
      this.needs.set(config.name, config);
    });
  }

  update(delta: number, phase?: TimePhase, raining = false) {
    this.accumulator += delta;
    if (this.accumulator < 1000) return;

    const days = this.accumulator / DAY;
    this.accumulator = 0;

    this.needs.forEach((need) => {
      if (!this._isActive(need) || need.consumption <= 0) return;

      const rate =
        need.consumption *
        (1 + ECONOMY_GROWTH * (this.tier - need.tier)) *
        this._demand(need, phase, raining);

      for (const group of need.groups) {
        const items = this._counted(need, group.name);
        if (this._supplyOf(items) <= 0) continue;

        this._consume(items, rate * days);
        this.dirty = true;
      }
    });
  }

  private _demand(
    need: NeedConfig,
    phase: TimePhase | undefined,
    raining: boolean,
  ): number {
    const time = phase ? (need.demand?.phases?.[phase] ?? 1) : 1;
    const weather = raining ? (need.demand?.rain ?? 1) : 1;

    return time * weather;
  }

  private _isActive(need: NeedConfig): boolean {
    return need.tier <= this.tier;
  }

  private _counted(need: NeedConfig, group: GroupName): NeedItem[] {
    return need.items.filter(
      (item) => item.group === group && item.tier <= this.tier,
    );
  }

  private _supplyOf(items: NeedItem[]): number {
    return items.reduce((sum, item) => sum + this.supply.get(item.item), 0);
  }

  isRequired(need: NeedConfig, group: NeedGroup): boolean {
    return (
      this._isActive(need) &&
      need.consumption > 0 &&
      this._counted(need, group.name).length > 0
    );
  }

  isStocked(group: NeedGroup, item: NeedItem): boolean {
    return this.supply.get(item.item) >= group.low;
  }

  private _slots(need: NeedConfig, group: NeedGroup): NeedItem[][] {
    const slots = new Map<number, NeedItem[]>();

    for (const item of this._counted(need, group.name))
      slots.set(item.tier, [...(slots.get(item.tier) ?? []), item]);

    return [...slots.values()];
  }

  needed(need: NeedConfig, group: NeedGroup): number {
    if (!this.isRequired(need, group)) return 0;

    return this._slots(need, group).length;
  }

  stocked(need: NeedConfig, group: NeedGroup): number {
    return this._slots(need, group).filter((slot) =>
      slot.some((item) => this.isStocked(group, item)),
    ).length;
  }

  isGroupMet(need: NeedConfig, group: NeedGroup): boolean {
    return this.stocked(need, group) >= this.needed(need, group);
  }

  isMet(need: NeedConfig): boolean {
    return need.groups.every((group) => this.isGroupMet(need, group));
  }

  private _consume(items: NeedItem[], amount: number) {
    const stocked = items
      .map((item) => ({
        name: item.item,
        available: this.supply.get(item.item),
      }))
      .filter((item) => item.available > 0);

    if (!stocked.length) return;

    const total = stocked.reduce((sum, item) => sum + item.available, 0);
    if (total <= 0) return;

    const target = Math.min(amount, total);
    let consumedTotal = 0;

    stocked.forEach((item, index) => {
      const isLast = index === stocked.length - 1;
      const share = isLast
        ? Math.max(0, target - consumedTotal)
        : Math.min(item.available, (item.available / total) * target);

      if (share <= 0) return;

      this.supply.remove(item.name, share);
      if (MEATS.includes(item.name)) this.meatEaten = true;
      consumedTotal += share;
    });
  }

  getTier(): number {
    return this.tier;
  }

  setTier(tier: number): void {
    this.tier = tier;
    this.dirty = true;
  }

  upgradeTier(): void {
    this.tier++;
    this.dirty = true;
  }

  has(name: ImprovementName): boolean {
    return this.improvements.has(name);
  }

  improve(name: ImprovementName): void {
    this.improvements.add(name);
    this.dirty = true;
  }

  state(): EconomyState {
    return {
      tier: this.tier,
      improvements: [...this.improvements],
      store: this.supply.snapshot(),
    };
  }

  hydrate(state: EconomyState): void {
    const names = Object.values(ImprovementName);

    this.tier = state.tier ?? this.tier;
    this.improvements = new Set(
      (state.improvements ?? []).filter((name) => names.includes(name)),
    );
    if (state.store) this.supply.hydrate(state.store);
    this.dirty = true;
  }

  capacity(): number {
    return this.has(ImprovementName.STORAGE)
      ? STORE_CAPACITY_EXPANDED
      : STORE_CAPACITY;
  }

  room(name: EntityName): number {
    return Math.max(0, Math.floor(this.capacity() - this.supply.get(name)));
  }

  canUpgrade(): boolean {
    for (const need of this.needs.values()) if (!this.isMet(need)) return false;

    return true;
  }

  isLow(name: NeedName): boolean {
    const need = this.needs.get(name);
    return !!need && !this.isMet(need);
  }

  getMood(villager?: EntityName): Mood {
    const preferred = villager && this._preferred(villager);
    if (preferred) return preferred;

    const unmet = this._unmet();
    if (!unmet.length) return Mood.HAPPY;
    if (!villager) return unmet[0].mood;

    return unmet[this._hash(villager) % unmet.length].mood;
  }

  craves(villager: EntityName): boolean {
    return this._preferred(villager) !== null;
  }

  private _preferred(villager: EntityName): Mood | null {
    const preference = configs.preferences[villager];
    if (!preference) return null;

    for (const need of this.needs.values())
      for (const group of need.groups)
        for (const item of this._counted(need, group.name))
          if (
            item.item === preference &&
            need.mood &&
            this.isRequired(need, group) &&
            !this.isStocked(group, item)
          )
            return need.mood;

    return null;
  }

  private _unmet(): { mood: Mood; ratio: number }[] {
    const unmet: { mood: Mood; ratio: number }[] = [];

    this.needs.forEach((need) => {
      if (!need.mood) return;

      let ratio = Infinity;

      for (const group of need.groups)
        if (!this.isGroupMet(need, group))
          ratio = Math.min(
            ratio,
            this.stocked(need, group) / this.needed(need, group),
          );

      if (ratio !== Infinity) unmet.push({ mood: need.mood, ratio });
    });

    return unmet.sort((a, b) => a.ratio - b.ratio);
  }

  private _hash(villager: EntityName): number {
    let hash = 0;
    for (const char of villager) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;

    return hash;
  }

  getSnapshot(): EconomySnapshot {
    const needs: EconomySnapshot["needs"] = [...this.needs.values()].map(
      (need) => ({
        name: need.name,
        consumed: need.consumption > 0,
        met: this.isMet(need),
        groups: need.groups.map((group) => ({
          name: group.name,
          required: this.isRequired(need, group),
          met: this.isGroupMet(need, group),
          needed: this.needed(need, group),
          stocked: this.stocked(need, group),
          items: need.items
            .filter((item) => item.group === group.name)
            .sort((a, b) => a.tier - b.tier)
            .map((item) => ({
              item: item.item,
              quantity: Math.floor(this.supply.get(item.item)),
              tier: item.tier,
              stocked: this.isStocked(group, item),
            })),
        })),
      }),
    );

    return {
      tier: this.tier,
      canUpgrade: this.canUpgrade(),
      mood: this.getMood(),
      capacity: this.capacity(),
      improvements: [...this.improvements],
      needs,
    };
  }
}
