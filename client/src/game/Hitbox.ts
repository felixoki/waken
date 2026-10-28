import { CombatConfig } from "@server/types";
import { Scene } from "./scenes/Scene";
import type { Entity } from "./Entity";

export interface Cone {
  x: number;
  y: number;
  dx: number;
  dy: number;
  reach: number;
  spread: number;
}

export class Hitbox extends Phaser.GameObjects.Rectangle {
  public hits = new Set<string>();
  public impacts = new Set<string>();
  public ownerId: string;
  public config: CombatConfig;
  public clearance?: number;
  public inner: number = 0;
  public cone?: Cone;
  public debug?: Phaser.GameObjects.Graphics;
  public hazard: boolean;
  public onImpact?: (entity: Entity) => void;

  declare body: Phaser.Physics.Arcade.Body;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    ownerId: string,
    config: CombatConfig,
    clearance?: number,
    hazard: boolean = false,
  ) {
    super(scene, x, y, width, height);

    this.ownerId = ownerId;
    this.config = config;
    this.clearance = clearance ?? (config as { clearance?: number }).clearance;
    this.hazard = hazard;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    scene.physicsManager.groups.hits.add(this);

    if ("duration" in config && config.duration)
      scene.time.delayedCall(config.duration, () => this.destroy());
  }

  drawCone() {
    if (!this.cone || !this.scene.physics.world.drawDebug) return;

    const c = this.cone;
    const fx = c.x + c.dx * c.reach;
    const fy = c.y + c.dy * c.reach;
    const side = c.reach * c.spread;

    this.debug ??= this.scene.add.graphics().setDepth(1000);
    this.debug
      .clear()
      .lineStyle(1, 0xff6600, 1)
      .strokeTriangle(
        c.x,
        c.y,
        fx - c.dy * side,
        fy + c.dx * side,
        fx + c.dy * side,
        fy - c.dx * side,
      );
  }

  destroy(fromScene?: boolean) {
    this.debug?.destroy();
    super.destroy(fromScene);
  }
}
