import {
  ComponentName,
  EffectName,
  EntityName,
  Slot,
  SlotType,
} from "@server/types";
import { Entity } from "../Entity";
import { Effect } from "./Effect";
import { SkinComponent } from "../components/Skin";
import { HotbarComponent } from "../components/Hotbar";
import { Player } from "../Player";
import EventBus from "../EventBus";
import { Event } from "@server/types";
import { DRAGON_FORM_DURATION } from "@server/globals";
import { configs } from "@server/configs";

export class DragonEffect extends Effect {
  name = EffectName.DRAGON;

  private saved: (Slot | null)[] | null = null;
  private timer?: Phaser.Time.TimerEvent;

  constructor(private entity: Entity) {
    super();
  }

  attach(): void {
    this.entity.addComponent(new SkinComponent(this.entity, EntityName.DRAGON));

    const hotbar = this.entity.getComponent<HotbarComponent>(
      ComponentName.HOTBAR,
    );
    if (!hotbar) return;

    this.saved = hotbar.getSlots();

    hotbar.setSlots(this._slots());
    hotbar.select(0);

    if ((this.entity as Player).isControllable)
      EventBus.emit(Event.TRANSFORM_TOGGLE, true);

    this.timer = this.entity.scene.time.delayedCall(DRAGON_FORM_DURATION, () =>
      this.entity.removeEffect(EffectName.DRAGON),
    );
  }

  detach(): void {
    this.entity.removeComponent(ComponentName.SKIN);

    if (this.timer) {
      this.timer.remove(false);
      this.timer = undefined;
    }

    if (!this.saved) return;

    const hotbar = this.entity.getComponent<HotbarComponent>(
      ComponentName.HOTBAR,
    );
    hotbar?.setSlots(this.saved);
    this.saved = null;

    if ((this.entity as Player).isControllable)
      EventBus.emit(Event.TRANSFORM_TOGGLE, false);
  }

  private _slots(): (Slot | null)[] {
    const attacks = configs.entities[EntityName.DRAGON]?.attacks ?? [];
    const slots: (Slot | null)[] = new Array(attacks.length).fill(null);

    attacks.forEach((attack, i) => {
      if (attack.spell) slots[i] = { type: SlotType.SPELL, name: attack.spell };
    });

    return slots;
  }
}
