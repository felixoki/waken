import { PlayerConfig, Input, StateName } from "@server/types";
import { Player } from "../Player";
import { EntityName } from "@server/types";
import { Idle } from "../state/Idle";
import { Walking } from "../state/Walking";
import { Running } from "../state/Running";
import { Casting } from "../state/Casting";
import { Jumping } from "../state/Jumping";
import { Rolling } from "../state/Rolling";
import { Scene } from "../scenes/Scene";
import type { MainScene } from "../scenes/Main";

export class PlayerManager {
  public player?: Player;
  public others: Map<string, Player> = new Map();
  private main: MainScene;

  constructor(main: MainScene) {
    this.main = main;
  }

  get all(): Player[] {
    return [...this.others.values(), this.player!];
  }

  get(id: string): Player | undefined {
    if (this.player?.id === id) return this.player;
    return this.others.get(id);
  }

  update(): void {
    this.player?.update();
  }

  add(config: PlayerConfig, isLocal: boolean): void {
    if (!isLocal) {
      const existing = this.others.get(config.id);

      if (existing) {
        if (existing.map === config.map) return;
        this.remove(config.id);
      }
    }

    const scene = this.main.scene.get(config.map) as Scene;

    const player = new Player(
      scene,
      config.x,
      config.y,
      `${EntityName.PLAYER}-${StateName.IDLE}`,
      config.id,
      EntityName.PLAYER,
      config.health,
      config.facing!,
      [],
      new Map([
        [StateName.IDLE, new Idle()],
        [StateName.WALKING, new Walking()],
        [StateName.RUNNING, new Running()],
        [StateName.JUMPING, new Jumping()],
        [StateName.CASTING, new Casting()],
        [StateName.ROLLING, new Rolling()],
      ]),
      config.socketId,
      config.isHost,
      isLocal,
    );

    player.map = config.map;

    scene.physicsManager.groups.players.add(player);

    if (isLocal) {
      this.player = player;
      return;
    }

    this.others.set(config.id, player);
  }

  updateOther(input: Input): void {
    const player = this.others.get(input.id);
    if (player) player.update(input);
  }

  remove(id: string): void {
    if (this.player && this.player.id === id) {
      this.player.destroy();
      this.player = undefined;

      return;
    }

    const player = this.others.get(id);

    if (player) {
      player.destroy();
      this.others.delete(id);
    }
  }
}
