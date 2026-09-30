import { ComponentName, SurfaceName } from "@server/types";
import { KICK_SPACING, TREAD_FEET } from "@server/globals";
import { Entity } from "../Entity";
import { Component } from "./Component";
import { handlers } from "../handlers";

export class TreadComponent extends Component {
  public name = ComponentName.TREAD;

  private waded = 0;
  private lastX = 0;
  private lastY = 0;
  private tracking = false;

  constructor(private entity: Entity) {
    super();
  }

  update(): void {
    const entity = this.entity;
    const body = entity.body as Phaser.Physics.Arcade.Body | null;
    const tiles = entity.scene?.tileManager;
    const tracks = entity.scene?.snow;

    if (!body || !tiles || !tracks) return;

    const x = body.center.x;
    const feet = body.bottom;

    if (entity.z > 0 || tiles.surfaceAt(x, feet) !== SurfaceName.SNOW) {
      this.tracking = false;
      return;
    }

    const dx = this.tracking ? x - this.lastX : 0;
    const dy = this.tracking ? feet - this.lastY : 0;
    const moved = Math.hypot(dx, dy);

    this.tracking = true;
    this.lastX = x;
    this.lastY = feet;

    const dirX = moved ? dx / moved : 0;
    const dirY = moved ? dy / moved : 0;

    handlers.snow.tread(tracks, x, feet + TREAD_FEET, dirX, dirY);

    if (!moved) return;

    this.waded += moved;
    if (this.waded < KICK_SPACING) return;

    this.waded %= KICK_SPACING;

    handlers.snow.kick(tracks, x, feet + TREAD_FEET, dirX, dirY);
  }
}
