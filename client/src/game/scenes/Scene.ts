import { PhysicsManager } from "../managers/Physics";
import { TileManager } from "../managers/Tile";
import { CameraManager } from "../managers/Camera";
import { InterfaceManager } from "../managers/Interface";
import type { MainScene } from "./Main";
import { Player } from "../Player";

export class Scene extends Phaser.Scene {
  public physicsManager!: PhysicsManager;
  public tileManager!: TileManager;
  public cameraManager!: CameraManager;
  public interfaceManager!: InterfaceManager;

  get managers() {
    const main = this.scene.get("main") as MainScene;

    return {
      players: main.playerManager,
      entities: main.entityManager,
      socket: main.socketManager,
    };
  }

  create(): void {
    this.physicsManager = new PhysicsManager(this);
    this.cameraManager = new CameraManager(this);
    this.interfaceManager = new InterfaceManager(this);

    this.game.events.on(
      "camera:follow",
      (data: { key: string; player: Player }) => {
        if (data.key === this.scene.key)
          this.cameraManager.follow(data.player);
      },
    );
  }

  update(_time: number, delta: number): void {
    this.tileManager?.update(delta);
    this.interfaceManager.update();
  }

  shutdown(): void {
    this.tileManager?.destroy();
  }
}
