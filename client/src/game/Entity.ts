import { ComponentName, Direction, StateName } from "@server/types";
import { State } from "./state/State";
import { Component } from "./components/Component";
import { EntityName } from "@server/types";
import { Scene } from "./scenes/Scene";
import { PointableComponent } from "./components/Pointable";
import { AnimationComponent } from "./components/Animation";
import { ANIMATIONS } from "@server/configs";
import { BehaviorQueue } from "./components/BehaviorQueue";
import { Patrol } from "./behavior/Patrol";
import { handlers } from "./handlers";

export class Entity extends Phaser.GameObjects.Sprite {
  public id: string;
  public direction: Direction;
  public directions: Direction[];
  public isLocked: boolean = false;

  public components = new Map<ComponentName, Component>();
  public states?: Map<StateName, State>;

  declare scene: Scene;
  declare state: StateName;
  declare name: EntityName;
  declare body: Phaser.Physics.Arcade.Body;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    texture: string,
    id: string,
    name: string,
    direction: Direction,
    directions: Direction[],
    states?: Map<StateName, State>
  ) {
    super(scene, x, y, texture);

    this.id = id;
    this.setName(name);

    this.direction = direction;
    this.directions = directions;
    this.states = states;

    this._init();
  }

  private _init() {
    /**
     * We will handle this with the camera later
     */
    this.setScale(2);

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    this.scene.physicsManager.groups.entities.add(this);

    /**
     * We need to pass these in for variety
     */
    this.body.setSize(16, 32);
    this.body.setOffset(24, 16);
    this.body.pushable = false;

    /**
     * We will handle this with a factory later
     */
    this.addComponent(new PointableComponent(this));
    this.addComponent(
      new AnimationComponent(this, ANIMATIONS[this.name], false)
    );
    this.addComponent(new BehaviorQueue(this));
    this.getComponent<BehaviorQueue>(ComponentName.BEHAVIOR_QUEUE)?.add(
      new Patrol(true)
    );
  }

  update(): void {
    const behavior = this.getComponent<BehaviorQueue>(
      ComponentName.BEHAVIOR_QUEUE
    );
    const input = behavior?.update();

    if (!input || this.isLocked) return;

    const prev = {
      state: this.state,
      direction: this.direction,
      directionCount: this.directions.length,
    };

    const prepared = { ...input, id: this.id, x: this.x, y: this.y };

    const { state, needsUpdate } = handlers.state.resolve(prepared, prev);

    if (input.direction) this.direction = input.direction;
    if (input.directions) this.directions = input.directions;

    if (state !== this.state) this.transitionTo(state);
    if (needsUpdate) this.states?.get(this.state)?.update(this);
  }

  destroy(fromScene?: boolean): void {
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
}
