import {
  Direction,
  Event,
  Input,
  StateName,
  EntityName,
  ComponentName,
  SoundName,
  EffectName,
} from "@server/types";
import { AnimationComponent } from "./components/Animation";
import { Entity } from "./Entity";
import { InputManager } from "./managers/Input";
import { configs } from "@server/configs";
import { handlers } from "./handlers";
import { State } from "./state/State";
import { Scene } from "./scenes/Scene";
import { BodyComponent } from "./components/Body";
import { InventoryComponent } from "./components/Inventory";
import { HotbarComponent } from "./components/Hotbar";
import { DamageableComponent } from "./components/Damageable";
import { FOOTSTEP_DISTANCE } from "@server/globals";

export class Player extends Entity {
  public socketId: string;
  public isAuthority: boolean;
  public isControllable: boolean;
  public isTransitioning: boolean = false;
  public inputManager?: InputManager;

  private stepAccumulator: number = 0;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    texture: string,
    id: string,
    name: EntityName,
    health: number,
    mana: number,
    facing: Direction,
    moving: Direction[],
    states: Map<StateName, State>,
    socketId: string,
    isAuthority: boolean,
    isControllable: boolean,
  ) {
    super(scene, x, y, texture, id, name, health, facing, moving, states);

    this.mana = mana;
    this.socketId = socketId;
    this.isAuthority = isAuthority;
    this.isControllable = isControllable;

    if (this.isControllable) this.inputManager = new InputManager(this.scene);

    this.init();
  }

  init(): void {
    this.addComponent(
      new AnimationComponent(this, configs.animations[EntityName.PLAYER]!),
    );
    this.addComponent(
      new BodyComponent(this, {
        width: 8,
        height: 12,
        offsetX: 12,
        offsetY: 12,
        pushable: false,
      }),
    );
    this.addComponent(new InventoryComponent());
    this.addComponent(new HotbarComponent(this, new Array(8).fill(null)));
    this.addComponent(new DamageableComponent());
  }

  update(remoteInput?: Input): void {
    this.components.forEach((component) => component.update());

    this.inputManager?.update();

    if (this.isControllable) this._footsteps();

    const input = remoteInput || this._getInput();

    if (!input) return;

    if (this.isLocked) {
      if (input.moving) this.moving = input.moving;
      if (input.facing) this.setFacing(input.facing);

      this.pointerdown = input.pointerdown;

      if (this.inputManager) {
        this.target = this.inputManager.getPointer();
        input.target = this.target;
      } else this.target = input.target;

      this.states?.get(this.state)?.update(this);
      if (this.isControllable && this._changed(input)) {
        this.lastInput = input;
        this.scene.game.events.emit(Event.PLAYER_INPUT, input);
      }

      return;
    }

    const prev = {
      state: this.state,
      facing: this.facing,
      movingCount: this.moving.length,
    };

    this.target = input.target;
    this.setFacing(input.facing);
    this.moving = input.moving;
    this.pointerdown = input.pointerdown;

    const { state, needsUpdate } = handlers.state.resolve(input, prev);

    if (remoteInput) {
      const hotbar = this.getComponent<HotbarComponent>(ComponentName.HOTBAR);
      hotbar?.set(input.equipped);
    }

    if (state !== this.state) this.transitionTo(state);
    if (needsUpdate) this.states?.get(this.state)?.update(this);

    handlers.player.lantern.sync(this, input.equipped);

    if (remoteInput) {
      const delta = this.scene.game.loop.delta;
      const x = handlers.interpolation.lerp(this.x, input.x, delta);
      const y = handlers.interpolation.lerp(this.y, input.y, delta);

      this.setPosition(x, y);
    }

    if (this.isControllable && this._changed(input)) {
      this.lastInput = input;
      this.scene.game.events.emit(Event.PLAYER_INPUT, input);
    }

    const depthY = Math.round(this.y);

    if (depthY !== this.depthY) {
      this.depthY = depthY;
      this.setDepth(1000 + this.y);
    }
  }

  private _footsteps(): void {
    if (
      this.state !== StateName.WALKING &&
      this.state !== StateName.RUNNING
    ) {
      this.stepAccumulator = 0;
      return;
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (!body) return;

    const speed = body.velocity.length();
    if (speed < 1) return;

    this.stepAccumulator += speed * (this.scene.game.loop.delta / 1000);

    if (this.stepAccumulator >= FOOTSTEP_DISTANCE) {
      this.stepAccumulator -= FOOTSTEP_DISTANCE;
      this.scene.managers.sound.play.sfx(SoundName.FOOTSTEP);
    }
  }

  protected _getInput(): Input {
    const facing = this.inputManager?.getFacing(this.x, this.y);
    const moving = this.inputManager?.getMoving();
    const isRunning = this.inputManager?.isRunning();
    const isJumping = this.inputManager?.isJumping();
    const isRolling = this.inputManager?.isRolling();
    const pointerdown = this.inputManager?.isPointerDown();
    const target = this.inputManager?.getTarget();

    const hotbar = this.getComponent<HotbarComponent>(ComponentName.HOTBAR);
    const equipped = hotbar?.get();

    return {
      id: this.id,
      x: this.x,
      y: this.y,
      facing: facing,
      moving: moving || [],
      isRunning: isRunning || false,
      isFlying: this.hasEffect(EffectName.DRAGON) && (isRunning || false),
      isJumping: isJumping || false,
      isRolling: isRolling || false,
      pointerdown: pointerdown || false,
      target: target,
      state: this.state,
      equipped: equipped,
    };
  }

  protected _changed(input: Input): boolean {
    const last = this.lastInput;
    if (!last) return true;

    return (
      input.x !== last.x ||
      input.y !== last.y ||
      input.facing !== last.facing ||
      input.state !== last.state ||
      input.isRunning !== last.isRunning ||
      input.isFlying !== last.isFlying ||
      input.isJumping !== last.isJumping ||
      input.isRolling !== last.isRolling ||
      input.pointerdown !== last.pointerdown ||
      input.equipped !== last.equipped ||
      input.moving.length !== (last.moving?.length ?? 0) ||
      input.moving.some((d, i) => d !== last.moving?.[i]) ||
      input.target?.x !== last.target?.x ||
      input.target?.y !== last.target?.y
    );
  }

  destroy(): void {
    handlers.player.lantern.unequip(this);
    this.inputManager?.destroy();
    super.destroy();
  }
}
