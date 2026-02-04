import { Direction, HotbarDirection } from "@server/types";
import { Scene } from "../scenes/Scene";

type Key = Phaser.Input.Keyboard.Key;

export class InputManager {
  private scene: Scene;
  private keys: {
    Q: Key;
    W: Key;
    E: Key;
    A: Key;
    S: Key;
    D: Key;
    C: Key;
    SHIFT: Key;
    SPACE: Key;
  };
  private target?: { x: number; y: number };

  constructor(scene: Scene) {
    this.scene = scene;
    this.keys = scene.input.keyboard!.addKeys({
      Q: Phaser.Input.Keyboard.KeyCodes.Q,
      W: Phaser.Input.Keyboard.KeyCodes.W,
      E: Phaser.Input.Keyboard.KeyCodes.E,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
      C: Phaser.Input.Keyboard.KeyCodes.C,
      SHIFT: Phaser.Input.Keyboard.KeyCodes.SHIFT,
      SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE,
    }) as typeof this.keys;

    this.registerPointerEvents();
  }

  getDirection(): Direction | null {
    const pressed = [
      { key: this.keys.W, dir: Direction.UP },
      { key: this.keys.S, dir: Direction.DOWN },
      { key: this.keys.A, dir: Direction.LEFT },
      { key: this.keys.D, dir: Direction.RIGHT },
    ]
      .filter((k) => k.key.isDown)
      .sort((a, b) => b.key.timeDown - a.key.timeDown);

    return pressed[0]?.dir || null;
  }

  getDirections(): Direction[] {
    const directions: Direction[] = [];

    if (this.keys.W.isDown) directions.push(Direction.UP);
    if (this.keys.S.isDown) directions.push(Direction.DOWN);
    if (this.keys.A.isDown) directions.push(Direction.LEFT);
    if (this.keys.D.isDown) directions.push(Direction.RIGHT);

    return directions;
  }

  getNavigation(): HotbarDirection.PREV | HotbarDirection.NEXT | null {
    if (Phaser.Input.Keyboard.JustDown(this.keys.Q))
      return HotbarDirection.PREV;

    if (Phaser.Input.Keyboard.JustDown(this.keys.E))
      return HotbarDirection.NEXT;

    return null;
  }

  isRunning(): boolean {
    return this.keys.SHIFT.isDown;
  }

  isJumping(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.keys.SPACE);
  }

  isRolling(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.keys.C);
  }

  setTarget(target: { x: number; y: number }): void {
    this.target = target;
  }

  getTarget(): { x: number; y: number } | undefined {
    const t = this.target;
    this.target = undefined;
    return t;
  }

  registerPointerEvents(): void {
    this.scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      const target = this.scene.cameraManager.getWorldPoint(
        pointer.x,
        pointer.y,
      );

      this.setTarget({
        x: target.x,
        y: target.y,
      });
    });
  }

  destroy(): void {
    this.scene.input.off("pointerdown");
  }
}
