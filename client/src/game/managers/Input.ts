import { Direction, Event, HotbarDirection } from "@server/types";
import { Scene } from "../scenes/Scene";
import { handlers } from "../handlers";
import { Binding, Bindings, bindings } from "../handlers/bindings";
import EventBus from "../EventBus";
import { escape } from "../../ui/escape";

type Key = Phaser.Input.Keyboard.Key;

export class InputManager {
  private scene: Scene;
  private keys: Record<Binding, Key>;
  private esc: Key;
  private pointer: { x: number; y: number } = { x: 0, y: 0 };
  private target?: { x: number; y: number };
  private pointerdown: boolean = false;
  private left: boolean = false;
  private right: boolean = false;
  private captured: boolean = false;

  constructor(scene: Scene) {
    this.scene = scene;
    this.esc = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.keys = this.bind(bindings.load());

    this.registerPointerEvents();
    EventBus.on(Event.DEV_CONSOLE, this.mute, this);
    EventBus.on(Event.BINDINGS_SET, this.rebind, this);
    EventBus.on(Event.INPUT_MUTE, this.mute, this);
  }

  private bind(next: Bindings): Record<Binding, Key> {
    const keyboard = this.scene.input.keyboard!;
    const keys = {} as Record<Binding, Key>;

    for (const binding of Object.values(Binding))
      keys[binding] = keyboard.addKey(next[binding]);

    return keys;
  }

  private rebind(next: Bindings): void {
    const keyboard = this.scene.input.keyboard!;

    for (const key of Object.values(this.keys))
      keyboard.removeKey(key, true, true);

    this.keys = this.bind(next);
  }

  private mute(open: boolean): void {
    const keyboard = this.scene.input.keyboard!;
    keyboard.manager.enabled = !open;
    keyboard.resetKeys();
  }

  update(): void {
    if (Phaser.Input.Keyboard.JustDown(this.keys[Binding.INVENTORY]))
      EventBus.emit(Event.UI_TOGGLE);

    if (Phaser.Input.Keyboard.JustDown(this.esc) && !escape.close())
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

  setCapture(captured: boolean): void {
    this.captured = captured;
  }

  getReel(): number {
    return (
      (this.keys[Binding.RIGHT].isDown ? 1 : 0) -
      (this.keys[Binding.LEFT].isDown ? 1 : 0)
    );
  }

  getMoving(): Direction[] {
    const moving: Direction[] = [];

    if (this.captured) return moving;

    if (this.keys[Binding.UP].isDown) moving.push(Direction.UP);
    if (this.keys[Binding.DOWN].isDown) moving.push(Direction.DOWN);
    if (this.keys[Binding.LEFT].isDown) moving.push(Direction.LEFT);
    if (this.keys[Binding.RIGHT].isDown) moving.push(Direction.RIGHT);

    return moving;
  }

  isCaptured(): boolean {
    return this.captured;
  }

  getNavigation(): HotbarDirection.PREV | HotbarDirection.NEXT | null {
    const prev = Phaser.Input.Keyboard.JustDown(this.keys[Binding.PREV]);
    const next = Phaser.Input.Keyboard.JustDown(this.keys[Binding.NEXT]);

    if (this.captured) return null;
    if (prev) return HotbarDirection.PREV;
    if (next) return HotbarDirection.NEXT;

    return null;
  }

  isRunning(): boolean {
    return !this.captured && this.keys[Binding.RUN].isDown;
  }

  isJumping(): boolean {
    return (
      Phaser.Input.Keyboard.JustDown(this.keys[Binding.JUMP]) && !this.captured
    );
  }

  isRolling(): boolean {
    return (
      Phaser.Input.Keyboard.JustDown(this.keys[Binding.ROLL]) && !this.captured
    );
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
    EventBus.off(Event.DEV_CONSOLE, this.mute, this);
    EventBus.off(Event.BINDINGS_SET, this.rebind, this);
    EventBus.off(Event.INPUT_MUTE, this.mute, this);
  }
}
