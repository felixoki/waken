import { Entity } from "./Entity";
import {
  EntityConfig,
  EntityDefinition,
  Input,
  StateName,
  DragonAction,
  SpellName,
  Stuck,
} from "@server/types";
import { StateFactory } from "./factory/State";
import { Scene } from "./scenes/Scene";
import { ComponentFactory } from "./factory/Component";
import { handlers } from "./handlers";

export class Villain extends Entity {
  public isTransforming: boolean = false;
  public actions: DragonAction[] = [];
  public engagements: number = 0;
  public spell: SpellName | null = null;
  public stuck: Stuck = {
    lastPosition: { x: 0, y: 0 },
    lastCheck: 0,
    interval: 200,
  };

  constructor(scene: Scene, def: EntityConfig & EntityDefinition) {
    super(
      scene,
      def.x,
      def.y,
      `${def.name}-${StateName.IDLE}`,
      def.id,
      def.name,
      def.health,
      def.facing,
      def.moving,
      StateFactory.create(def.states),
    );

    this.createdAt = def.createdAt;
    this.maxHealth = def.maxHealth ?? def.health;

    this._setup(def);
  }

  private _setup(def: EntityConfig & EntityDefinition): void {
    const components = ComponentFactory.create(def.components, this, def);
    for (const [, component] of components) this.addComponent(component);

    this.transitionTo(StateName.IDLE);
  }

  protected _getInput(): Partial<Input> | null {
    if (
      !this.scene.managers.players?.player?.isAuthority ||
      !this.scene.managers.chunks?.isActive(this.map, this.x, this.y)
    )
      return null;

    const input = handlers.villain.think(this);
    if (!input) return null;

    return { ...input, id: this.id, x: this.x, y: this.y };
  }

  protected _changed(input: Partial<Input>): boolean {
    if (input.state === StateName.CASTING) return true;
    return super._changed(input);
  }
}
