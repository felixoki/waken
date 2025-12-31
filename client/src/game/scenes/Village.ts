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
    this.load.spritesheet(
      "player-running",
      "assets/sprites/player_running.png",
      {
        frameWidth: 64,
        frameHeight: 64,
      }
    );
    this.load.spritesheet(
      "player-jumping",
      "assets/sprites/player_jumping.png",
      {
        frameWidth: 64,
        frameHeight: 64,
      }
    );
    this.load.spritesheet(
      "player-casting",
      "assets/sprites/player_casting.png",
      {
        frameWidth: 64,
        frameHeight: 64,
      }
    );
    this.load.spritesheet(
      "orc1-idle",
      "assets/sprites/orc1_idle_with_shadow.png",
      {
        frameWidth: 64,
        frameHeight: 64,
      }
    );
    this.load.spritesheet(
      "orc1-walking",
      "assets/sprites/orc1_walking_with_shadow.png",
      {
        frameWidth: 64,
        frameHeight: 64,
      }
    );
    this.load.spritesheet(
      "orc1-slashing",
      "assets/sprites/orc1_slashing_with_shadow.png",
      {
        frameWidth: 64,
        frameHeight: 64,
      }
    );
  }
}
