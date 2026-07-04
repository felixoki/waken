import { ComponentName, SlotType, SpellName, StateName } from "@server/types";
import { Component } from "./Component";
import { Entity } from "../Entity";
import { HotbarComponent } from "./Hotbar";
import { configs } from "@server/configs";

export class ReviveableComponent extends Component {
  private entity: Entity;

  public name = ComponentName.REVIVEABLE;

  constructor(entity: Entity) {
    super();

    this.entity = entity;
  }

  attach(): void {
    this.entity.on("pointed", this._revive, this);
  }

  detach(): void {
    this.entity.off("pointed", this._revive, this);
  }

  private _revive(caster: Entity): void {
    if (!caster || caster === this.entity) return;
    if (caster.state === StateName.DEAD) return;

    const hotbar = caster.getComponent<HotbarComponent>(ComponentName.HOTBAR);
    const equipped = hotbar?.get();

    if (equipped?.type !== SlotType.SPELL || equipped.name !== SpellName.REVIVE)
      return;

    const config = configs.spells[SpellName.REVIVE];
    const range = config.range ?? 80;

    const dx = this.entity.x - caster.x;
    const dy = this.entity.y - caster.y;

    if (dx * dx + dy * dy > range * range) return;

    if (caster.mana < config.mana) return;

    caster.target = { x: this.entity.x, y: this.entity.y, id: this.entity.id };
    caster.transitionTo(StateName.CASTING);
  }
}
