import Phaser from "phaser";
import SocketManager from "../managers/Socket";

export default class Village extends Phaser.Scene {
  public socketManager = SocketManager;

  constructor() {
    super("Village");
  }

  create() {
    this.socketManager.init();
    this.socketManager.emit("player:create");

    this._registerEvents();
  }

  private _registerEvents() {
    this.socketManager.on("player:joined", (data) => {
      console.log(`Player joined: ${data.id}`);
    });

    this.socketManager.on("player:left", (data) => {
      console.log(`Player left: ${data.id}`);
    });
  }
}
