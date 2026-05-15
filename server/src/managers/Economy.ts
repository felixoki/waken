import { configs } from "../configs";
import { DAY } from "../globals";
import { ItemsStore } from "../stores/Items";
import { EconomySnapshot, NeedConfig, NeedName } from "../types";

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
      const available = this.getSupply(need);

      if (available > 0) {
        const consumption = need.consumption[this.tier] * days;
        this._consume(need, consumption);
        this.dirty = true;
      }
    });
  }

  getSupply(need: NeedConfig): number {
    return need.items
      .filter((tier) => tier.tier <= this.tier)
      .reduce((sum, tier) => sum + this.supply.get(tier.item), 0);
  }

  private _consume(need: NeedConfig, amount: number) {
    let remaining = amount;

    const items = need.items
      .filter((item) => item.tier <= this.tier)
      .sort((a, b) => a.tier - b.tier);

    for (const item of items) {
      if (remaining <= 0) break;

      const available = this.supply.get(item.item);

      if (available > 0) {
        const consumed = Math.min(available, remaining);
        this.supply.remove(item.item, consumed);
        remaining -= consumed;
      }
    }
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
    if (!need) return false;

    const threshold = need.threshold[this.tier];
    return this.getSupply(need) < threshold * 0.3;
  }

  getSnapshot(): EconomySnapshot {
    const needs: EconomySnapshot["needs"] = [];

    this.needs.forEach((need) => {
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
