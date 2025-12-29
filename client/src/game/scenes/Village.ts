import { Scene } from "./Scene";

export default class Village extends Scene {
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
    this.load.spritesheet(
      "player-walking",
      "assets/sprites/player_walking.png",
      {
        frameWidth: 64,
        frameHeight: 64,
      }
    );
  }
}
