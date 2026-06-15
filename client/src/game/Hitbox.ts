import { CombatConfig } from "@server/types";
import { Scene } from "./scenes/Scene";

export class Hitbox extends Phaser.GameObjects.Rectangle {
  public hits = new Set<string>();
  public ownerId: string;
  public config: CombatConfig;
  public clearance?: number;
  public hazard: boolean;

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

    if (config.duration)
      scene.time.delayedCall(config.duration, () => this.destroy());
  }
}
