import {
  ComponentName,
  SpellConfig,
  SpellName,
  SpellType,
  StateName,
} from "@server/types";
import { State } from "./State";
import { Entity } from "../Entity";
import { AnimationComponent } from "../components/Animation";
import { DURATION_CASTING } from "@server/globals";
import { handlers } from "../handlers";
import { Player } from "../Player";
import { HotbarComponent } from "../components/Hotbar";
import { configs } from "@server/configs";

type Handler = (
  entity: Entity,
  config: SpellConfig,
  target: { x: number; y: number },
  direction: { x: number; y: number },
) => void;

export class Casting implements State {
  private timer: Phaser.Time.TimerEvent | null = null;

  private handlers: Record<SpellType, Handler> = {
    [SpellType.PROJECTILE]: (entity, config, _target, direction) =>
      handlers.spells.projectile(entity, config, direction),

    [SpellType.MELEE]: (entity, config, _target, direction) =>
      handlers.spells.melee(entity, config, direction),

    [SpellType.AREA]: (entity, config, target, _direction) =>
      handlers.spells.area(entity, config, target),

    [SpellType.SCENE]: (entity, config, _target, _direction) =>
      handlers.spells.scene(entity, config),
  };

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
    const direction = handlers.combat.getDirectionToPoint(
      entity,
      entity.target!,
    );

    this.handlers[config.type](entity, config, entity.target!, direction);

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
