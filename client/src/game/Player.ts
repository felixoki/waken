import { Direction, Input, StateName, EntityName } from "@server/types";
import { AnimationComponent } from "./components/Animation";
import { Entity } from "./Entity";
import { InputManager } from "./managers/Input";
import { ANIMATIONS } from "@server/configs";
import { handlers } from "./handlers";
import { State } from "./state/State";
import { Scene } from "./scenes/Scene";
import { BodyComponent } from "./components/Body";

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
    direction: Direction,
    directions: Direction[],
    states: Map<StateName, State>,
    socketId: string,
    isHost: boolean,
    isControllable: boolean
  ) {
    super(scene, x, y, texture, id, name, direction, directions, states);

    this.socketId = socketId;
    this.isHost = isHost;
    this.isControllable = isControllable;

    if (this.isControllable) this.inputManager = new InputManager(this.scene);

    this.init();
  }

  init(): void {
    this.addComponent(
      new AnimationComponent(this, ANIMATIONS[EntityName.PLAYER]!, true)
    );
    this.addComponent(
      new BodyComponent(this, {
        width: 16,
        height: 32,
        offsetX: 24,
        offsetY: 16,
        pushable: false,
      })
    );
  }

  update(remoteInput?: Input): void {
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
    
    this.setDepth(this.y);
  }

  private _getInput(): Input {
    const direction = this.inputManager?.getDirection();
    const directions = this.inputManager?.getDirections();
    const isRunning = this.inputManager?.isRunning();
    const isJumping = this.inputManager?.isJumping();
    const target = this.inputManager?.getTarget();

    return {
      id: this.id,
      x: this.x,
      y: this.y,
      direction: direction,
      directions: directions || [],
      isRunning: isRunning || false,
      isJumping: isJumping || false,
      target: target,
      state: this.state,
    };
  }
}
