import { ComponentName, EntityConfig, StateName } from "@server/types";
import { Entity } from "../Entity";
import { Scene } from "../scenes/Scene";
import { StateFactory } from "./State";
import { ComponentFactory } from "./Component";
import { BehaviorQueue } from "../components/BehaviorQueue";
import { BehaviorFactory } from "./Behavior";

export class Factory {
  static create(scene: Scene, config: EntityConfig): Entity {
    const states = StateFactory.create(config.states);
    const texture = `${config.name}-${StateName.IDLE}`;

    const entity = new Entity(
      scene,
      config.x,
      config.y,
      texture,
      config.id,
      config.name,
      config.direction,
      config.directions,
      states
    );

    const components = ComponentFactory.create(config.components, entity);

    for (const [_, component] of components) entity.addComponent(component);

    if (config.behaviors && config.behaviors.length) {
      const behaviorQueue = entity.getComponent<BehaviorQueue>(
        ComponentName.BEHAVIOR_QUEUE
      );

      if (behaviorQueue) {
        const behaviors = BehaviorFactory.create(config.behaviors);
        for (const behavior of behaviors) behaviorQueue.add(behavior);
      }
    }

    return entity;
  }
}
