import { BodyConfig, ComponentConfig, ComponentName } from "@server/types";
import { Entity } from "../Entity";
import { Component } from "../components/Component";
import { PointableComponent } from "../components/Pointable";
import { BehaviorQueue } from "../components/BehaviorQueue";
import { BodyComponent } from "../components/Body";
import { ANIMATIONS } from "@server/configs";
import { AnimationComponent } from "../components/Animation";

export class ComponentFactory {
  static create(
    configs: ComponentConfig[],
    entity: Entity
  ): Map<ComponentName, Component> {
    const components = new Map<ComponentName, Component>();

    for (const config of configs) {
      const map: Record<ComponentName, Component> = {
        [ComponentName.ANIMATION]: new AnimationComponent(
          entity,
          ANIMATIONS[entity.name],
          false
        ),
        [ComponentName.BEHAVIOR_QUEUE]: new BehaviorQueue(entity),
        [ComponentName.BODY]: new BodyComponent(
          entity,
          (config as { name: ComponentName.BODY; config: BodyConfig }).config
        ),
        [ComponentName.POINTABLE]: new PointableComponent(entity),
      };

      if (map[config.name]) components.set(config.name, map[config.name]);
    }

    return components;
  }
}
