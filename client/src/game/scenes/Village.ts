import Phaser from "phaser";
import SocketManager from "../managers/Socket";
import { PlayerManager } from "../managers/Player";

export default class Village extends Phaser.Scene {
  public socketManager = SocketManager;
  public playerManager!: PlayerManager;

  constructor() {
    super("Village");
  }

  /**
   * Implement Preloader
   */
  preload() {
    this.load.spritesheet("player-idle", "assets/sprites/player_idle.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet("player-walking", "assets/sprites/player_walking.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
  }

  create() {
    this.playerManager = new PlayerManager(this);

    this.socketManager.init();
    this.socketManager.emit("player:create");

    this._registerEvents();
  }

  private _registerEvents() {
    this.socketManager.on("player:create:local", (data) => {
      console.log(`You joined: ${data.id}`);
      this.playerManager.add(data, true);
    });

    this.socketManager.on("player:create", (data) => {
      console.log(`Player joined: ${data.id}`);
      this.playerManager.add(data, false);
    });

    this.socketManager.on("player:left", (data) => {
      console.log(`Player left: ${data.id}`);
    });
  }
}
