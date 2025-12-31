import { Scene } from "./scenes/Scene";

export class Hitbox extends Phaser.GameObjects.Rectangle {
  public hits = new Set<string>();
  public ownerId: string;

  declare body: Phaser.Physics.Arcade.Body;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    ownerId: string
  ) {
    super(scene, x, y, width, height);

    this.ownerId = ownerId;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    scene.physicsManager.groups.hits.add(this);
  }

  destroy(fromScene?: boolean): void {
    super.destroy(fromScene);
  }
}
