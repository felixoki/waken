import {
  Direction,
  Event,
  Input,
  StateName,
  EntityName,
  HotbarSlotType,
  SpellName,
  ComponentName,
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

export class Player extends Entity {
  public socketId: string;
  public isAuthority: boolean;
  public isControllable: boolean;
  public inputManager?: InputManager;

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
    this.addComponent(
      new HotbarComponent(this, [
        { type: HotbarSlotType.SPELL, name: SpellName.SHARD },
        { type: HotbarSlotType.SPELL, name: SpellName.SLASH },
        { type: HotbarSlotType.ENTITY, name: EntityName.AXE },
        { type: HotbarSlotType.ENTITY, name: EntityName.LANTERN },
        { type: HotbarSlotType.ENTITY, name: EntityName.HOE },
        null,
        null,
        null,
      ]),
    );
    this.addComponent(new DamageableComponent());
  }

  update(remoteInput?: Input): void {
    this.components.forEach((component) => component.update());

    this.inputManager?.update();

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
      if (this.isControllable)
        this.scene.game.events.emit(Event.PLAYER_INPUT, input);

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
      const x = Phaser.Math.Linear(this.x, input.x, 0.2);
      const y = Phaser.Math.Linear(this.y, input.y, 0.2);

      this.setPosition(x, y);
    }

    if (this.isControllable)
      this.scene.game.events.emit(Event.PLAYER_INPUT, input);

    const depthY = Math.round(this.y);

    if (depthY !== this._depthY) {
      this._depthY = depthY;
      this.setDepth(1000 + this.y);
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
      isJumping: isJumping || false,
      isRolling: isRolling || false,
      pointerdown: pointerdown || false,
      target: target,
      state: this.state,
      equipped: equipped,
    };
  }

  destroy(): void {
    handlers.player.lantern.unequip(this);
    this.inputManager?.destroy();
    super.destroy();
  }
}
