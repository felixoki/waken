import { Direction, PlayerInput, StateName } from "@server/types";
import { AnimationComponent } from "./components/Animation";
import { Entity } from "./Entity";
import { InputManager } from "./managers/Input";
import { ANIMATIONS, EntityName } from "@server/configs";
import { handlers } from "./handlers";
import { State } from "./state/State";
import { Scene } from "./scenes/Scene";

export class Player extends Entity {
  public socketId: string;
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
    isControllable: boolean
  ) {
    super(scene, x, y, texture, id, name, direction, directions, states);

    this.socketId = socketId;
    this.isControllable = isControllable;

    if (this.isControllable) this.inputManager = new InputManager(this.scene);

    this.init();
  }

  init(): void {
    this.setScale(2);

    this.addComponent(
      new AnimationComponent(this, ANIMATIONS[EntityName.PLAYER])
    );
  }

  update(remoteInput?: PlayerInput): void {
    const input = remoteInput || this._getInput();

    if (!input) return;

    const prev = { state: this.state, direction: this.direction };

    this.setDirection(input.direction);
    this.directions = input.directions;

    const { state, needsUpdate } = handlers.state.resolve(input, prev);

    if (state !== this.state) this.transitionTo(state);

    if (needsUpdate) this.states?.get(this.state)?.update(this);

    if (this.isControllable) this.scene.game.events.emit("player:input", input);
  }

  private _getInput(): PlayerInput {
    const direction = this.inputManager?.getDirection();
    const directions = this.inputManager?.getDirections();

    return {
      id: this.id,
      x: this.x,
      y: this.y,
      direction: direction,
      directions: directions || [],
      state: this.state,
      nextState: this.state, // return from InputManager
    };
  }

  setDirection(direction: Direction | null | undefined): void {
    this.direction = direction || this.direction;
  }
}
