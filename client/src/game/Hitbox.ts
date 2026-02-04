import { SpellConfig, WeaponConfig } from "@server/types";
import { Scene } from "./scenes/Scene";

export class Hitbox extends Phaser.GameObjects.Rectangle {
  public hits = new Set<string>();
  public ownerId: string;
  public config: SpellConfig | WeaponConfig;

  declare body: Phaser.Physics.Arcade.Body;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    ownerId: string,
    config: SpellConfig | WeaponConfig,
  ) {
    super(scene, x, y, width, height);

    this.ownerId = ownerId;
    this.config = config;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    scene.physicsManager.groups.hits.add(this);

    if (config.duration)
      scene.time.delayedCall(config.duration, () => this.destroy());
  }
}
