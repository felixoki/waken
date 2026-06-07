import { PhysicsManager } from "../managers/Physics";
import { TileManager } from "../managers/Tile";
import { CameraManager } from "../managers/Camera";
import { InterfaceManager } from "../managers/Interface";
import { Event, PipelineName } from "@server/types";
import type { MainScene } from "./Main";
import { Player } from "../Player";

export class Scene extends Phaser.Scene {
  public physicsManager!: PhysicsManager;
  public tileManager!: TileManager;
  public cameraManager!: CameraManager;
  public interfaceManager!: InterfaceManager;
  public light!: Phaser.GameObjects.Rectangle;

  get managers() {
    const main = this.scene.get("main") as MainScene;

    return {
      players: main.managers.players,
      entities: main.managers.entities,
      socket: main.managers.socket,
      chunks: main.managers.chunks,
      sound: main.managers.sound,
      physics: this.physicsManager,
      tile: this.tileManager,
      camera: this.cameraManager,
      interface: this.interfaceManager,
    };
  }

  create(): void {
    this.physicsManager = new PhysicsManager(this);
    this.cameraManager = new CameraManager(this);
    this.interfaceManager = new InterfaceManager(this);

    this.lights.enable();
    this.lights.setAmbientColor(0xffffff);

    this.light = this.add.rectangle(0, 0, 1, 1, 0xffffff);
    this.light.setOrigin(0, 0);
    this.light.setDepth(Number.MAX_SAFE_INTEGER);
    this.light.setBlendMode(Phaser.BlendModes.MULTIPLY);
    this.light.setPipeline("Light2D");
    this.light.setScrollFactor(0);

    this.cameras.main.setPostPipeline(PipelineName.AMBIENCE);

    this.game.events.on(
      Event.CAMERA_FOLLOW,
      (data: { key: string; player: Player }) => {
        if (data.key === this.scene.key) this.cameraManager.follow(data.player);
      },
    );
  }

  update(_time: number, delta: number): void {
    const playerY = this.managers.players.player?.y;
    this.tileManager?.update(delta, playerY);
    this.interfaceManager.update();

    const { width, height } = this.cameras.main;
    this.light.setSize(width, height);
  }

  shutdown(): void {
    this.physicsManager.destroy();
    this.tileManager?.destroy();
  }
}
