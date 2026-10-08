import { PhysicsManager } from "../managers/Physics";
import { TileManager } from "../managers/Tile";
import { CameraManager } from "../managers/Camera";
import { InterfaceManager } from "../managers/Interface";
import { ClimateManager } from "../managers/Climate";
import { AmbienceLayer, Event, MapName, PipelineName } from "@server/types";
import { Landmark, LocationBand } from "@server/types/generation";
import { configs } from "@server/configs";
import { AmbiencePipeline } from "../pipelines/Ambience";
import type { MainScene } from "./Main";
import { Player } from "../Player";
import { snow, type SnowTracks } from "../handlers/snow";
import { location } from "../handlers/location";
import { shadows, type Shadows } from "../handlers/shadows";

export class Scene extends Phaser.Scene {
  public physicsManager!: PhysicsManager;
  public tileManager!: TileManager;
  public snow?: SnowTracks;
  public shadows?: Shadows;
  public cameraManager!: CameraManager;
  public interfaceManager!: InterfaceManager;
  public light!: Phaser.GameObjects.Rectangle;
  public landmarks: Landmark[] = [];
  public bands: LocationBand[] = [];
  public band?: LocationBand;
  public row = -1;

  private ambience?: AmbiencePipeline;
  private climate?: ClimateManager;
  private indoor = false;

  get frost(): number {
    return this.climate?.frost ?? 0;
  }

  get managers() {
    const main = this.scene.get("main") as MainScene;

    return {
      players: main.managers.players,
      entities: main.managers.entities,
      socket: main.managers.socket,
      chunks: main.managers.chunks,
      sound: main.managers.sound,
      weather: main.managers.weather,
      physics: this.physicsManager,
      tile: this.tileManager,
      camera: this.cameraManager,
      interface: this.interfaceManager,
    };
  }

  create(): void {
    const config = configs.maps[this.scene.key as MapName];
    this.indoor = !!config?.isIndoor;

    this.physicsManager = new PhysicsManager(this);
    this.cameraManager = new CameraManager(this);
    this.interfaceManager = new InterfaceManager(this);

    this.lights.enable();
    this.lights.setAmbientColor(config?.ambient ?? 0xffffff);

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

    const ambience = config?.ambience;
    if (this.ambience && ambience) this.ambience.setBase(ambience);
    if (this.ambience) this.climate = new ClimateManager(this, this.ambience);

    this.game.events.off(Event.CAMERA_FOLLOW, this._follow, this);
    this.game.events.on(Event.CAMERA_FOLLOW, this._follow, this);
  }

  private _follow(data: { key: string; player: Player }): void {
    if (data.key === this.scene.key) this.cameraManager.follow(data.player);
  }

  setTiles(tiles: TileManager): void {
    if (this.snow) snow.destroy(this.snow);
    if (this.shadows) shadows.destroy(this.shadows);

    this.tileManager = tiles;
    this.snow = snow.create(this, tiles) ?? undefined;
    this.shadows = shadows.create(this, tiles.map);
    this.bands = location.bands(tiles.map);
    this.band = undefined;
    this.row = -1;
  }

  teardown(): void {
    if (this.snow) snow.destroy(this.snow);
    this.snow = undefined;
    this.shadows = undefined;

    [...this.children.list].forEach((child) => child.destroy());

    this.landmarks = [];
    this.tileManager?.destroy();
    this.tileManager = undefined!;
  }

  update(_time: number, delta: number): void {
    if (!this.tileManager) return;

    const player = this.managers.players.player;
    this.tileManager.update(delta, player);

    if (player?.scene === this)
      location.update(this, this.scene.get("main") as MainScene, player.y);

    if (this.snow) {
      snow.flush(this.snow);
      snow.fade(this.snow, delta);
    }
    if (this.shadows) shadows.update(this.shadows, this, delta);
    this.interfaceManager.update();

    const { width, height } = this.cameras.main;
    this.light.setSize(width, height);

    const cam = this.cameras.main;
    this.ambience?.setCamera(cam.scrollX, cam.scrollY, cam.zoom);

    if (this.indoor || !this.ambience) return;

    this.climate?.update(delta);

    this.ambience.layer(AmbienceLayer.WEATHER).wetness =
      this.managers.weather.wetness * (1 - this.frost);
  }

  shutdown(): void {
    this.game.events.off(Event.CAMERA_FOLLOW, this._follow, this);
    this.physicsManager.destroy();
    this.cameraManager.destroy();
    this.tileManager?.destroy();
  }
}
