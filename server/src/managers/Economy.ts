import { configs } from "../configs";
import { DAY } from "../globals";
import { ItemsStore } from "../stores/Items";
import { EconomySnapshot, Mood, NeedConfig, NeedName } from "../types";

export class EconomyManager {
  private needs: Map<NeedName, NeedConfig> = new Map();
  private tier: number = 1;
  private updated: number = 0;
  private accumulator: number = 0;
  public dirty: boolean = false;

  constructor(private supply: ItemsStore) {
    this._init();
  }

  private _init() {
    configs.needs.forEach((config) => {
      this.needs.set(config.name, config);
    });
  }

  update(delta: number) {
    this.accumulator += delta;
    if (this.accumulator < 1000) return;
    this.accumulator -= 1000;

    const now = Date.now();

    if (!this.updated) {
      this.updated = now;
      return;
    }

    const elapsed = now - this.updated;
    this.updated = now;

    const days = elapsed / DAY;

    this.needs.forEach((need) => {
      if (need.tier > this.tier) return;
      if (need.consumption <= 0) return;

      const available = this.getSupply(need);
      if (available <= 0) return;

      const rate = need.consumption * 2 ** (this.tier - need.tier);
      this._consume(need, rate * days);
      this.dirty = true;
    });
  }

  getSupply(need: NeedConfig): number {
    return need.items
      .filter((tier) => tier.tier <= this.tier)
      .reduce((sum, tier) => sum + this.supply.get(tier.item), 0);
  }

  private _consume(need: NeedConfig, amount: number) {
    const items = need.items
      .filter((item) => item.tier <= this.tier)
      .map((item) => ({
        name: item.item,
        available: this.supply.get(item.item),
      }))
      .filter((item) => item.available > 0);

    if (!items.length) return;

    const total = items.reduce((sum, item) => sum + item.available, 0);
    if (total <= 0) return;

    const target = Math.min(amount, total);
    let consumedTotal = 0;

    items.forEach((item, index) => {
      const isLast = index === items.length - 1;
      const share = isLast
        ? Math.max(0, target - consumedTotal)
        : Math.min(item.available, (item.available / total) * target);

      if (share <= 0) return;

      this.supply.remove(item.name, share);
      consumedTotal += share;
    });
  }

  getTier(): number {
    return this.tier;
  }

  upgradeTier(): void {
    this.tier++;
    this.dirty = true;
  }

  isLow(name: NeedName): boolean {
    const need = this.needs.get(name);
    if (!need || need.tier > this.tier) return false;

    return this.getSupply(need) < need.low;
  }

  getMood(): Mood {
    let mood = Mood.HAPPY;
    let lowest = Infinity;

    this.needs.forEach((need) => {
      if (!need.mood || need.tier > this.tier || need.low <= 0) return;

      const supply = this.getSupply(need);
      if (supply >= need.low) return;

      const ratio = supply / need.low;
      if (ratio < lowest) {
        lowest = ratio;
        mood = need.mood;
      }
    });

    return mood;
  }

  getSnapshot(): EconomySnapshot {
    const needs: EconomySnapshot["needs"] = [];

    this.needs.forEach((need) => {
      if (need.tier > this.tier) return;

      const items = need.items
        .filter((tier) => tier.tier <= this.tier)
        .map((tier) => ({
          item: tier.item,
          quantity: Math.floor(this.supply.get(tier.item)),
        }));

      needs.push({ name: need.name, items });
    });

    return { tier: this.tier, needs };
  }
}
