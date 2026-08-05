import { Direction, Event, HotbarDirection } from "@server/types";
import { Scene } from "../scenes/Scene";
import { handlers } from "../handlers";
import EventBus from "../EventBus";

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
    TAB: Key;
    ESC: Key;
  };
  private pointer: { x: number; y: number } = { x: 0, y: 0 };
  private target?: { x: number; y: number };
  private pointerdown: boolean = false;
  private left: boolean = false;
  private right: boolean = false;

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
      TAB: Phaser.Input.Keyboard.KeyCodes.TAB,
      ESC: Phaser.Input.Keyboard.KeyCodes.ESC,
    }) as typeof this.keys;

    this.registerPointerEvents();
  }

  update(): void {
    if (Phaser.Input.Keyboard.JustDown(this.keys.TAB))
      EventBus.emit(Event.UI_TOGGLE);

    if (Phaser.Input.Keyboard.JustDown(this.keys.ESC))
      EventBus.emit(Event.MENU_TOGGLE);

    if (this.scene.input.activePointer) {
      const pointer = this.scene.input.activePointer;
      const point = this.scene.cameraManager.getWorldPoint(
        pointer.x,
        pointer.y,
      );
      this.pointer = { x: point.x, y: point.y };
    }
  }

  getFacing(x: number, y: number): Direction {
    const dx = this.pointer.x - x;
    const dy = this.pointer.y - y;
    const angle = Math.atan2(dy, dx);

    return handlers.direction.fromAngle(angle);
  }

  getMoving(): Direction[] {
    const moving: Direction[] = [];

    if (this.keys.W.isDown) moving.push(Direction.UP);
    if (this.keys.S.isDown) moving.push(Direction.DOWN);
    if (this.keys.A.isDown) moving.push(Direction.LEFT);
    if (this.keys.D.isDown) moving.push(Direction.RIGHT);

    return moving;
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

  isPointerDown(): boolean {
    return this.pointerdown;
  }

  useLeftClick(): boolean {
    const clicked = this.left;
    this.left = false;
    return clicked;
  }

  useRightClick(): boolean {
    const clicked = this.right;
    this.right = false;
    return clicked;
  }

  getPointer(): { x: number; y: number } {
    return { x: this.pointer.x, y: this.pointer.y };
  }

  registerPointerEvents(): void {
    this.scene.input.mouse?.disableContextMenu();

    this.scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.pointerdown = true;

      if (pointer.leftButtonDown()) this.left = true;
      if (pointer.rightButtonDown()) this.right = true;

      const target = this.scene.cameraManager.getWorldPoint(
        pointer.x,
        pointer.y,
      );

      this.setTarget({
        x: target.x,
        y: target.y,
      });
    });

    this.scene.input.on("pointerup", () => {
      this.pointerdown = false;
    });
  }

  destroy(): void {
    this.scene.input.off("pointerdown");
    this.scene.input.off("pointerup");
  }
}
