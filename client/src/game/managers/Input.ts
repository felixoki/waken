import { Direction } from "@server/types";
import { Scene } from "../scenes/Scene";

type Key = Phaser.Input.Keyboard.Key;

export class InputManager {
  private keys: {
    W: Key;
    A: Key;
    S: Key;
    D: Key;
    SHIFT: Key;
    SPACE: Key;
  };

  constructor(scene: Scene) {
    this.keys = scene.input.keyboard!.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
      SHIFT: Phaser.Input.Keyboard.KeyCodes.SHIFT,
      SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE,
    }) as typeof this.keys;
  }

  getDirection(): Direction | null {
    if (this.keys.W.isDown) return Direction.UP;
    if (this.keys.S.isDown) return Direction.DOWN;
    if (this.keys.A.isDown) return Direction.LEFT;
    if (this.keys.D.isDown) return Direction.RIGHT;

    return null;
  }

  getDirections(): Direction[] {
    const directions: Direction[] = [];

    if (this.keys.W.isDown) directions.push(Direction.UP);
    if (this.keys.S.isDown) directions.push(Direction.DOWN);
    if (this.keys.A.isDown) directions.push(Direction.LEFT);
    if (this.keys.D.isDown) directions.push(Direction.RIGHT);

    return directions;
  }

  isRunning(): boolean {
    return this.keys.SHIFT.isDown;
  }
}
