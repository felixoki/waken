import { Direction, PlayerConfig, PlayerInput, StateName } from "@server/types";
import { Player } from "../Player";
import { EntityName } from "@server/types";
import { Idle } from "../state/Idle";
import { Walking } from "../state/Walking";
import { Scene } from "../scenes/Scene";
import { Running } from "../state/Running";
import { Casting } from "../state/Casting";
import { Jumping } from "../state/Jumping";

export class PlayerManager {
  private scene: Scene;
  public player?: Player;
  private others: Map<string, Player> = new Map();

  constructor(scene: Scene) {
    this.scene = scene;
  }

  update(): void {
    this.player?.update();
  }

  add(config: PlayerConfig, isLocal: boolean): void {
    /**
     * We should introduce a factory pattern here later on
     */
    const player = new Player(
      this.scene,
      config.x,
      config.y,
      `${EntityName.PLAYER}-${StateName.IDLE}`,
      config.id,
      EntityName.PLAYER,
      Direction.DOWN,
      [],
      new Map([
        [StateName.IDLE, new Idle()],
        [StateName.WALKING, new Walking()],
        [StateName.RUNNING, new Running()],
        [StateName.JUMPING, new Jumping()],
        [StateName.CASTING, new Casting()],
      ]),
      config.socketId,
      config.isHost,
      isLocal
    );

    this.scene.physicsManager.groups.players.add(player);

    if (isLocal) {
      this.player = player;
      return;
    }

    this.others.set(config.id, player);
  }

  updateOther(input: PlayerInput): void {
    const player = this.others.get(input.id);
    if (player) player.update(input);
  }

  remove(id: string): void {
    const player = this.others.get(id);

    if (player) {
      player.destroy();
      this.others.delete(id);
    }
  }

  destroy(): void {
    if (this.player) {
      this.player.destroy();
      this.player = undefined;
    }

    for (const player of this.others.values()) player.destroy();
    this.others.clear();
  }
}
