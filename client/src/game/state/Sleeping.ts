import { Direction, Event, StateName } from "@server/types";
import { State } from "./State";
import { Entity } from "../Entity";
import { Player } from "../Player";
import { handlers } from "../handlers";

export class Sleeping implements State {
  public name = StateName.SLEEPING;

  private bed: string | undefined;
  private out: Direction | undefined;

  enter(entity: Entity): void {
    const bed = handlers.sleep.bed(entity);
    const config = handlers.sleep.config(bed);

    entity.setState(this.name);
    entity.isLocked = true;

    this.bed = entity.bed;
    this.out = undefined;

    const body = entity.body as Phaser.Physics.Arcade.Body;

    body?.setVelocity(0, 0);
    if (body) body.enable = false;

    if (bed && config)
      entity.setPosition(bed.x + config.anchor.x, bed.y + config.anchor.y);

    entity.setVisible(false);
  }

  update(entity: Entity): void {
    if (!entity.bed) {
      entity.transitionTo(StateName.IDLE);
      return;
    }

    if (!(entity as Player).isControllable) return;
    if (!entity.moving.length) return;

    const config = handlers.sleep.config(handlers.sleep.bed(entity));

    this.out = config ? handlers.sleep.exit(entity, config) : undefined;
    entity.bed = undefined;

    entity.scene.game.events.emit(Event.PLAYER_WAKE_REQUEST, {
      direction: this.out,
    });
  }

  exit(entity: Entity): void {
    const bed = this.bed
      ? entity.scene.managers.entities.get(this.bed)
      : undefined;
    const config = handlers.sleep.config(bed);
    const side = this.out ?? (config && handlers.sleep.exit(entity, config));
    const exit = side && config?.exits[side];

    if (bed && exit) entity.setPosition(bed.x + exit.x, bed.y + exit.y);

    entity.setVisible(true);
    entity.setDepth(1000 + entity.y);

    const body = entity.body as Phaser.Physics.Arcade.Body;
    if (body) body.enable = true;

    entity.bed = undefined;
    entity.isLocked = false;
    this.bed = undefined;
    this.out = undefined;
  }
}
