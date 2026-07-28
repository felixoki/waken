import { PhysicsManager } from "../managers/Physics";
import { TileManager } from "../managers/Tile";
import { CameraManager } from "../managers/Camera";
import { InterfaceManager } from "../managers/Interface";
import { Event, MapName, PipelineName } from "@server/types";
import { configs } from "@server/configs";
import { AmbiencePipeline } from "../pipelines/Ambience";
import type { MainScene } from "./Main";
import { Player } from "../Player";

export class Scene extends Phaser.Scene {
  public physicsManager!: PhysicsManager;
  public tileManager!: TileManager;
  public cameraManager!: CameraManager;
  public interfaceManager!: InterfaceManager;
  public light!: Phaser.GameObjects.Rectangle;
  
  private ambience?: AmbiencePipeline;

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

    if (!this.cameras.main.hasPostPipeline)
      this.cameras.main.setPostPipeline(PipelineName.AMBIENCE);

    this.ambience = this.cameras.main.getPostPipeline(
      AmbiencePipeline,
    ) as AmbiencePipeline;

    const ambience = configs.maps[this.scene.key as MapName]?.ambience;
    if (this.ambience && ambience) this.ambience.setBase(ambience);

    this.game.events.off(Event.CAMERA_FOLLOW, this._follow, this);
    this.game.events.on(Event.CAMERA_FOLLOW, this._follow, this);
  }

  private _follow(data: { key: string; player: Player }): void {
    if (data.key === this.scene.key) this.cameraManager.follow(data.player);
  }

  teardown(): void {
    [...this.children.list].forEach((child) => child.destroy());

    this.tileManager?.destroy();
    this.tileManager = undefined!;
  }

  update(_time: number, delta: number): void {
    if (!this.tileManager) return;

    const player = this.managers.players.player;
    this.tileManager.update(delta, player);
    this.interfaceManager.update();

    const { width, height } = this.cameras.main;
    this.light.setSize(width, height);

    const cam = this.cameras.main;
    this.ambience?.setCamera(cam.scrollX, cam.scrollY, cam.zoom);
  }

  shutdown(): void {
    this.game.events.off(Event.CAMERA_FOLLOW, this._follow, this);
    this.physicsManager.destroy();
    this.cameraManager.destroy();
    this.tileManager?.destroy();
  }
}
