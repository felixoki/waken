import { Scene } from "../scenes/Scene";

export class PhsyicsManager {
  private scene: Scene;
  public groups!: {
    players: Phaser.Physics.Arcade.Group;
    entities: Phaser.Physics.Arcade.Group;
  };

  constructor(scene: Scene) {
    this.scene = scene;

    this._init();
  }

  private _init() {
    this.groups = {
      players: this.scene.physics.add.group({
        collideWorldBounds: true,
      }),
      entities: this.scene.physics.add.group({
        collideWorldBounds: true,
      }),
    };

    this.scene.physics.add.collider(this.groups.players, this.groups.players);
    this.scene.physics.add.collider(this.groups.players, this.groups.entities);
    this.scene.physics.add.collider(this.groups.entities, this.groups.entities);
  }
}
