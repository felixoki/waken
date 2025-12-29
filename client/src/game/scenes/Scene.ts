import SocketManager from "../managers/Socket";
import { PlayerManager } from "../managers/Player";
import { PlayerConfig, PlayerInput } from "@server/types";
import { PhsyicsManager } from "../managers/Physics";

export class Scene extends Phaser.Scene {
  public physicsManager!: PhsyicsManager;
  public playerManager!: PlayerManager;
  public socketManager = SocketManager;

  create() {
    this.physicsManager = new PhsyicsManager(this);
    this.playerManager = new PlayerManager(this);

    this.socketManager.init();
    this.socketManager.emit("player:create");

    this._registerEvents();
  }

  update() {
    this.playerManager.update();
  }

  private _registerEvents() {
    this.socketManager.on("player:create:local", (data: PlayerConfig) => {
      this.playerManager.add(data, true);
    });

    this.socketManager.on("player:create", (data: PlayerConfig) => {
      this.playerManager.add(data, false);
    });

    this.socketManager.on("player:left", (data: { id: string }) => {
      this.playerManager.remove(data.id);
    });

    this.socketManager.on("player:input", (data: PlayerInput) => {
      this.playerManager.updateOther(data);
    });

    this.game.events.on("player:input", (data: PlayerInput) => {
      this.socketManager.emit("player:input", data);
    });
  }
}
