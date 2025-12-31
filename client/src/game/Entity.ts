import { ComponentName, Direction, StateName } from "@server/types";
import { State } from "./state/State";
import { Component } from "./components/Component";
import { EntityName } from "@server/configs";
import { Scene } from "./scenes/Scene";

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
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    this.scene.physicsManager.groups.entities.add(this);

    /**
     * We need to pass these in for variety
     */
    this.body.setSize(16, 32);
    this.body.setOffset(24, 16);
    this.body.pushable = false;
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
