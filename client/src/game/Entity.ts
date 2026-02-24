import {
  ComponentName,
  Direction,
  Input,
  MapName,
  StateName,
} from "@server/types";
import { State } from "./state/State";
import { Component } from "./components/Component";
import { EntityName } from "@server/types";
import { Scene } from "./scenes/Scene";
import { BehaviorQueue } from "./components/BehaviorQueue";
import { handlers } from "./handlers";

export class Entity extends Phaser.GameObjects.Sprite {
  public id: string;
  public map!: MapName;
  public facing: Direction;
  public moving: Direction[];
  public isLocked: boolean = false;
  public isStatic: boolean = false;
  public health: number = 100;
  public target?: { x: number; y: number };

  public components = new Map<ComponentName, Component>();
  public states?: Map<StateName, State>;

  declare scene: Scene;
  declare state: StateName;
  declare name: EntityName;
  declare body: Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    texture: string,
    id: string,
    name: EntityName,
    health: number,
    facing: Direction,
    moving: Direction[],
    states?: Map<StateName, State>,
  ) {
    super(scene, x, y, texture);

    this.id = id;
    this.setName(name);
    this.health = health;

    this.facing = facing;
    this.moving = moving;
    this.states = states;

    this._init();
  }

  private _init() {
    this.scene.add.existing(this);
    this.setDepth(1000 + this.y);
  }

  update(remoteInput?: Partial<Input>): void {
    this.components.forEach((component) => {
      if (component.name !== ComponentName.BEHAVIOR_QUEUE) component.update();
    });

    const input = remoteInput || this._getInput();

    if (!input || this.isLocked) return;

    const prev = {
      state: this.state,
      facing: this.facing,
      movingCount: this.moving.length,
    };

    const prepared = { ...input, id: this.id, x: this.x, y: this.y };
    const { state, needsUpdate } = handlers.state.resolve(prepared, prev);

    if (input.facing) this.setFacing(input.facing);
    if (input.moving) this.moving = input.moving;

    if (state !== this.state) this.transitionTo(state);
    if (needsUpdate) this.states?.get(this.state)?.update(this);

    /**
     * Do proper interpolation in the future
     */
    if (remoteInput) {
      const x = Phaser.Math.Linear(this.x, input.x!, 0.2);
      const y = Phaser.Math.Linear(this.y, input.y!, 0.2);

      this.setPosition(x, y);
    }

    const scene = this.scene as Scene;
    const isHost = scene.managers.players?.player?.isHost;
    if (isHost && input) this.scene.game.events.emit("entity:input", input);

    /**
     * We will need to implement a proper depth sorting system
     */
    this.setDepth(1000 + this.y);
  }

  protected _getInput(): Partial<Input> | null {
    const scene = this.scene as Scene;
    const isHost = scene.managers.players?.player?.isHost;

    if (!isHost) return null;

    const behavior = this.getComponent<BehaviorQueue>(
      ComponentName.BEHAVIOR_QUEUE,
    );

    const input = behavior?.update();

    if (!input) return null;

    return { ...input, id: this.id, x: this.x, y: this.y };
  }

  destroy(fromScene?: boolean): void {
    this.components.forEach((component) => component.detach());
    this.components.clear();

    super.destroy(fromScene);
  }

  /**
   * State management
   */
  transitionTo(state: StateName): void {
    const prevState = this.states?.get(this.state);
    prevState?.exit(this);

    const nextState = this.states?.get(state);
    nextState?.enter(this);
  }

  /**
   * Component management
   */
  addComponent(component: Component): void {
    component.attach();
    this.components.set(component.name, component);
  }

  getComponent<T extends Component>(name: ComponentName): T | undefined {
    return this.components.get(name) as T | undefined;
  }

  hasComponent(name: ComponentName): boolean {
    return this.components.has(name);
  }

  removeComponent(name: ComponentName): void {
    const component = this.components.get(name);

    if (component) {
      component.detach();
      this.components.delete(name);
    }
  }

  /**
   * Helpers
   */
  setFacing(facing: Direction | null | undefined): void {
    this.facing = facing || this.facing;
  }
}
