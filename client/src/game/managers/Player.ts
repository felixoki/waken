import { PlayerConfig, StateName } from "@server/types";
import { Player } from "../Player";
import { EntityName } from "@server/configs";

export class PlayerManager {
  private scene: Phaser.Scene;
  public player?: Player;
  private others: Map<string, Player> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  add(config: PlayerConfig, isLocal: boolean): void {
    const player = new Player(
      this.scene,
      config.x,
      config.y,
      `${EntityName.PLAYER}-${StateName.IDLE}`,
      config.id,
      EntityName.PLAYER,
      config.socketId,
      isLocal
    );

    if (isLocal) this.player = player;
    else this.others.set(config.id, player);
  }
}
