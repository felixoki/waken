import { ComponentName, SpellName, StateName } from "@server/types";
import { State } from "./State";
import { Entity } from "../Entity";
import { AnimationComponent } from "../components/Animation";
import { DURATION_CASTING } from "@server/globals";
import { handlers } from "../handlers";
import { Player } from "../Player";
import { HotbarComponent } from "../components/Hotbar";
import { configs } from "@server/configs";

export class Casting implements State {
  private timer: Phaser.Time.TimerEvent | null = null;

  public name: StateName = StateName.CASTING;

  enter(entity: Entity): void {
    entity.setState(this.name);
    entity.isLocked = true;

    const anim = entity.getComponent<AnimationComponent>(
      ComponentName.ANIMATION,
    );
    anim?.play(this.name, entity.direction);

    const hotbar = (entity as Player).getComponent<HotbarComponent>(
      ComponentName.HOTBAR,
    );
    const equipped = hotbar?.get();

    const config = configs.spells[equipped?.name as SpellName];
    const direction = handlers.direction.getDirectionToPoint(
      entity,
      entity.target!,
    );

    handlers.spells[config.name](entity, config, entity.target!, direction);

    this.timer = entity.scene.time.delayedCall(DURATION_CASTING, () => {
      this.exit(entity);
    });
  }

  update(_entity: Entity): void {}

  exit(entity: Entity): void {
    if (this.timer) {
      this.timer.destroy();
      this.timer = null;
    }

    entity.isLocked = false;

    const reset = entity.states?.get(StateName.IDLE);
    if (reset) reset.enter(entity);
  }
}
