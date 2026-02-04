import {
  Direction,
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
  public isHost: boolean;
  public isControllable: boolean;
  public inputManager?: InputManager;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    texture: string,
    id: string,
    name: string,
    health: number,
    direction: Direction,
    directions: Direction[],
    states: Map<StateName, State>,
    socketId: string,
    isHost: boolean,
    isControllable: boolean,
  ) {
    super(
      scene,
      x,
      y,
      texture,
      id,
      name,
      health,
      direction,
      directions,
      states,
    );

    this.socketId = socketId;
    this.isHost = isHost;
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
        { type: HotbarSlotType.SPELL, name: SpellName.ILLUMINATE },
        { type: HotbarSlotType.SPELL, name: SpellName.HURT_SHADOWS },
        null,
        null,
        null,
        null,
      ]),
    );
    this.addComponent(new DamageableComponent());
  }

  update(remoteInput?: Input): void {
    this.components.forEach((component) => component.update());

    const input = remoteInput || this._getInput();

    if (!input || this.isLocked) return;

    const prev = {
      state: this.state,
      direction: this.direction,
      directionCount: this.directions.length,
    };

    this.target = input.target;
    this.setDirection(input.direction);
    this.directions = input.directions;

    const { state, needsUpdate } = handlers.state.resolve(input, prev);

    if (remoteInput) {
      const hotbar = this.getComponent<HotbarComponent>(ComponentName.HOTBAR);
      hotbar?.set(input.equipped);
    }

    if (state !== this.state) this.transitionTo(state);
    if (needsUpdate) this.states?.get(this.state)?.update(this);

    /**
     * Do proper interpolation in the future
     */
    if (remoteInput) {
      const x = Phaser.Math.Linear(this.x, input.x, 0.2);
      const y = Phaser.Math.Linear(this.y, input.y, 0.2);

      this.setPosition(x, y);
    }

    if (this.isControllable) this.scene.game.events.emit("player:input", input);

    /**
     * We will need to implement a proper depth sorting system
     */
    this.setDepth(1000 + this.y);
  }

  private _getInput(): Input {
    const direction = this.inputManager?.getDirection();
    const directions = this.inputManager?.getDirections();
    const isRunning = this.inputManager?.isRunning();
    const isJumping = this.inputManager?.isJumping();
    const isRolling = this.inputManager?.isRolling();
    const target = this.inputManager?.getTarget();

    const hotbar = this.getComponent<HotbarComponent>(ComponentName.HOTBAR);
    const equipped = hotbar?.get();

    return {
      id: this.id,
      x: this.x,
      y: this.y,
      direction: direction,
      directions: directions || [],
      isRunning: isRunning || false,
      isJumping: isJumping || false,
      isRolling: isRolling || false,
      target: target,
      state: this.state,
      equipped: equipped,
    };
  }

  destroy(): void {
    this.inputManager?.destroy();
    super.destroy();
  }
}
