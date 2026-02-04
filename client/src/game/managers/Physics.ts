import { handlers } from "../handlers";
import { Scene } from "../scenes/Scene";

export class PhsyicsManager {
  private scene: Scene;
  public groups!: {
    players: Phaser.Physics.Arcade.Group;
    entities: Phaser.Physics.Arcade.Group;
    hits: Phaser.Physics.Arcade.Group;
    overlaps: Phaser.Physics.Arcade.Group;
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
      hits: this.scene.physics.add.group(),
      overlaps: this.scene.physics.add.group(),
    };

    this.scene.physics.add.collider(this.groups.players, this.groups.players);
    this.scene.physics.add.collider(this.groups.players, this.groups.entities);
    this.scene.physics.add.collider(this.groups.entities, this.groups.entities);

    this.scene.physics.add.overlap(
      this.groups.entities,
      this.groups.hits,
      handlers.combat.hit,
      undefined,
      this
    );

    this.scene.physics.add.overlap(
      this.groups.players,
      this.groups.overlaps,
      handlers.physics.overlap,
      undefined,
      this
    );

    this.scene.physics.add.overlap(
      this.groups.entities,
      this.groups.overlaps,
      handlers.physics.overlap,
      undefined,
      this
    );
  }
}
