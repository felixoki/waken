import {
  ComponentName,
  EntityConfig,
  EntityDefinition,
  StateName,
} from "@server/types";
import { Entity } from "../Entity";
import { Scene } from "../scenes/Scene";
import { StateFactory } from "./State";
import { ComponentFactory } from "./Component";
import { BehaviorQueue } from "../components/BehaviorQueue";
import { BehaviorFactory } from "./Behavior";

export class Factory {
  static create(
    scene: Scene,
    definition: EntityConfig & EntityDefinition
  ): Entity {
    const states = StateFactory.create(definition.states);
    const texture = `${definition.name}-${StateName.IDLE}`;

    const entity = new Entity(
      scene,
      definition.x,
      definition.y,
      texture,
      definition.id,
      definition.name,
      definition.health,
      definition.direction,
      definition.directions,
      states
    );

    const components = ComponentFactory.create(definition.components, entity);

    for (const [_, component] of components) entity.addComponent(component);

    if (definition.behaviors && definition.behaviors.length) {
      const behaviorQueue = entity.getComponent<BehaviorQueue>(
        ComponentName.BEHAVIOR_QUEUE
      );

      if (behaviorQueue) {
        const behaviors = BehaviorFactory.create(definition.behaviors);
        for (const behavior of behaviors) behaviorQueue.add(behavior);
      }
    }

    return entity;
  }
}
